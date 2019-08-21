import time
from opentron.util import asyncio, Util
from opentron.constants import MAX_STICKS


class WorkerStick(Util):
    def __init__(self, name, db, ready_action,
                 stick_action, stocks, symbol,
                 asset, timeframe_id, timeframe,
                 period):
        super().__init__()

        self.name = name
        self.db = db
        self.ready_action = ready_action
        self.stick_action = stick_action
        self.stocks = stocks
        self.symbol = symbol
        self.asset = asset
        self.timeframe_id = timeframe_id
        self.timeframe = timeframe
        self.period = period
        self.enable = False

        self.log.info(f'{self.name} | Init Worker')

    # Воркер
    async def run(self):
        self.log.info(f'{self.name} | Start run stick')

        await self.maintenance()

        step = time.time() % self.period
        await asyncio.sleep(self.period - step)

        while self.enable:
            try:
                response = await self.get_average()

                if len(response) > 0:
                    data = await self.db.get_last_stick(
                        self.asset, self.timeframe_id)

                    if len(data) == 0:
                        self.log.warning(f'{self.name} | Database is empty')

                        await self.maintenance()
                    else:
                        await self.update(
                            [{'time': i.pop(0), 'data': i} for i in response])
                else:
                    self.log.warning(f'{self.name} | Response is empty')
            except Exception as e:
                self.log.error(f'{self.name} | Work error: {e}')
            finally:
                for i in range(self.period):
                    if self.enable:
                        await asyncio.sleep(1)

    # Получить свечи
    async def get_average(self, limit=1):
        kwargs = dict(
            limit=limit,
            symbol=self.symbol,
            timeframe=self.timeframe
        )
        average = []
        master = []

        for stock in self.stocks:
            if stock.master:
                master = await stock.get_stock_data(kwargs)

                for i in range(limit):
                    average.append(stock.create_average(master[i]))

                break

        for stock in self.stocks:
            if stock.master:
                continue

            current = await stock.get_stock_data(kwargs)

            for i in range(limit):
                if len(current) != 0 and len(current) > i:
                    current[i][0] = master[i][0]
                    stock.create_average(current[i], average[i])
                else:
                    stock.create_average(master[i], average[i])

        return average

    # Проверка базы данных
    async def maintenance(self):
        self.log.info(f'{self.name} | Start DB Maintenance')

        task_id = self.ready_action()
        task_id2 = self.stick_action()

        response = await self.get_average(MAX_STICKS)

        if len(response) > 0:
            data = await self.db.get_last_stick(
                self.asset, self.timeframe_id, MAX_STICKS)

            if len(data) == 0:
                response = [{'time': i.pop(0), 'data': i}
                            for i in response]
            else:
                last = data[0]
                new_data = []

                for i in response:
                    time = i.pop(0)

                    if time > last:
                        new_data.append({'time': time, 'data': i})
                response = new_data

            await self.update(response)
        else:
            self.log.warning(f'{self.name} | Response is empty')

        self.log.info(f'{self.name} | End DB Maintenance')

        self.stick_action(task_id2)
        self.ready_action(task_id)

    # Вставить данные по свечам в базу данных
    async def update(self, values):
        if len(values) > 0:
            try:
                values = [{
                    'asset': self.asset,
                    'timeframe': self.timeframe_id,
                    **i,
                } for i in values]

                if len(values) == 1:
                    values = values[0]

                    await self.db.upd(
                        asset=self.asset,
                        timeframe=self.timeframe_id,
                        time=values['time'],
                        data=values['data']
                    )
                else:
                    await self.db.insert().gino.all(values)
            except Exception as e:
                self.log.error(f'{self.name} | Insert data error: {e}')
