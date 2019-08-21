import ccxt.async_support as ccxt
from ccxt import ExchangeError, NetworkError
from opentron.util import asyncio, Util

stock_params = dict(enableRateLimit=True)


class Stock(Util):
    def __init__(self, name, api, weight,
                 USD='USD', master=False):
        super().__init__()

        self.name = name
        self.api = getattr(ccxt, api)
        self.weight = weight
        self.USD = USD
        self.master = master

    # Начать сессию с биржей
    def start_session(self):
        return self.api(stock_params)

    # Получить данные по свечам
    async def get_stock_data(self, kwargs):
        kwargs = self.get_default_kwargs(kwargs)

        pair = kwargs['symbol'].split('/')
        response = []
        name = kwargs.pop('name', 'Unknown')
        session = self.start_session()

        if pair[1][:3] == 'USD' and pair[1] != self.USD:
            kwargs['symbol'] = kwargs['symbol'].replace(pair[1], self.USD)

        while len(response) == 0:
            try:
                response = await session.fetch_ohlcv(**kwargs)
            except (ExchangeError, NetworkError) as e:
                self.log.warning(f'{name} | Network error: {e}')
            except Exception as e:
                self.log.warning(f'{name} | Failed to load stock data: {e}')
                break
            finally:
                if len(response) == 0:
                    await asyncio.sleep(1)

        await session.close()
        return response

    # Создать шаблон смешанных данных
    def create_average(self, current, average=None):
        if not average:
            average = [current[0], 0, 0, 0, 0, current[5]]

        for i in range(1, 5):
            average[i] = average[i] + current[i] * self.weight

        return average

    # Получить параметры для биржи по умолчанию
    def get_default_kwargs(self, kwargs):
        kwargs.setdefault('symbol', 'BTC/USDT')
        kwargs.setdefault('timeframe', '1m')
        kwargs.setdefault('limit', '1')

        return kwargs
