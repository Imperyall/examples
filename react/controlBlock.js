import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import shortid from 'shortid'

import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import {
  Paper,
  Button,
  Typography,
  TextField,
  OutlinedInput,
  MenuItem,
  Select
} from '@material-ui/core'
import { red, green } from '@material-ui/core/colors'

import * as actions from 'actions'
import { Utils, numberFormatter, usdFormatter } from 'utils'
import { MIN_AMOUNT } from 'utils/constants'
import Progress from 'components/common/progress'
import StrikePool from './strikePool'

const styles = theme => ({
  wrapper: {
    display: 'grid'
  },

  root: {
    display: 'grid',
    gridGap: theme.spacing(),
    gridTemplateRows: 'auto auto 1fr auto auto'
  },

  buttonsAmount: {
    display: 'grid',
    gridGap: theme.spacing(),
    '-ms-grid-columns': '1fr 1fr',
    gridTemplateColumns: '1fr 1fr'
  },

  buttonsBet: {
    display: 'grid',
    gridGap: theme.spacing(),
    gridAutoRows: '45px',

    '& button': {
      '&:first-child': {
        backgroundColor: green[200],
        cursor: 'default',

        '&:enabled': {
          backgroundColor: green[800],
          cursor: 'pointer',

          '&:hover': {
            backgroundColor: green[900]
          }
        }
      },

      '&:last-child': {
        backgroundColor: red[200],
        cursor: 'default',

        '&:enabled': {
          backgroundColor: red[800],
          cursor: 'pointer',

          '&:hover': {
            backgroundColor: red[900]
          }
        }
      }
    }
  },

  textField: {
    marginTop: theme.spacing(2),

    '& input': {
      fontSize: '16px',
      textAlign: 'center'
    }
  },

  select: {
    '& div': {
      fontSize: '16px',
      textAlign: 'center',
      fontWeight: 600
    }
  },

  pool: {
    display: 'grid',
    gridGap: '6px',
    gridTemplateColumns: '1fr 1fr',
    marginBottom: theme.spacing()
  },

  poolElement: {
    display: 'grid',
    gridGap: '4px',
    gridTemplateColumns: '2fr 3fr',
    // fontSize: '15px',

    '&:last-child': {
      textAlign: 'right',
      gridTemplateColumns: '3fr 2fr'
    },

    '& > $poolLast': {
      gridColumnStart: 1,
      gridColumnEnd: 3,

      '&.red': {
        color: red[800]
      },

      '&.green': {
        color: green[800]
      }
    }
  },
  poolLast: {}
})

const buttonsAmount = [
  { name: 'b_inv_min', value: 'MIN' },
  { name: 'b_inv_max', value: 'MAX' },
  { name: 'b_inv_div', value: '/2' },
  { name: 'b_inv_mul', value: 'x2' }
]

class ControlBlock extends React.Component {
  state = {
    investError: false,
    betEnabled: true,
    betLoading: false,
    amount: MIN_AMOUNT
  }

  componentDidUpdate(prevProps) {
    const { tronId, lastStick, ifConnect, getPoolData } = this.props

    if (ifConnect && prevProps.lastStick !== lastStick)
      getPoolData(tronId)
  }

  handleClickInvest = e => {
    const { name } = e.currentTarget
    const { balance } = this.props

    let amount = MIN_AMOUNT
    const minMax = v =>
      Math.floor(
        v < MIN_AMOUNT || MIN_AMOUNT > balance
          ? MIN_AMOUNT
          : v > balance
          ? balance
          : v
      )

    switch (name) {
      case 'b_inv_max':
        amount = Math.floor(balance)
        break
      case 'b_inv_div':
        amount = minMax(this.state.amount / 2)
        break
      case 'b_inv_mul':
        amount = minMax(this.state.amount * 2)
        break
      default:
        break
    }

    this.setState({ amount })
    this.setState({ investError: false })
  }

  handleAmount = e =>
    this.setState({ amount: e.currentTarget.value.replace(/\D/g, '') })
  handleLoading = betLoading => this.setState({ betLoading })
  handleBetEnabled = betEnabled => this.setState({ betEnabled })

  handleClickBet = async e => {
    const { name } = e.currentTarget
    const {
      // tronId,
      curExpiration,
      curAsset,
      newNotify,
    } = this.props

    this.handleLoading(true)

    let [err] = await Utils.invest(
      name,
      this.state.amount,
      curExpiration,
      curAsset
    )

    if (err) {
      newNotify(err, 'error')
    } else {
      newNotify('Success order', 'success')
    }

    // await handleBalance()
    this.handleLoading(false)
  }

  blurInvestValue = e => {
    const value = e.currentTarget.value.replace(/\D/g, '')

    this.setState((prevState, prevProps) => ({
      investError: !!(+value < MIN_AMOUNT || +value > prevProps.balance)
    }))
  }

  render() {
    const {
      curAsset,
      chartData,
      poolData,
      classes,
      curExpiration,
      expirationData,
      strikeData,
      setCurExpiration,
      tronLogin
    } = this.props

    const { investError, amount, betEnabled, betLoading } = this.state

    const ifLoading = !expirationData.length || chartData == null

    let poolAmount = [0, 0]
    let poolTotal = [0, 0]
    let poolParts = [0, 0]

    let currentStrike = strikeData.find(
      item =>
        item.asset === curAsset && item.expiration === curExpiration
    )

    currentStrike = currentStrike ? currentStrike.strike : 0

    const currentPool = poolData.find(
      item =>
        item.asset === curAsset && item.expiration === curExpiration
    )

    if (currentPool) {
      poolAmount = [currentPool.callAmount, currentPool.putAmount]
      poolTotal = [currentPool.callTotal, currentPool.putTotal]

      poolParts = [
        currentPool.callTotal === 0
          ? 0
          : (
              (currentPool.callAmount /
                (currentPool.callAmount + currentPool.putAmount)) *
              100
            ).toFixed(1),
        currentPool.putTotal === 0
          ? 0
          : (
              (currentPool.putAmount /
                (currentPool.callAmount + currentPool.putAmount)) *
              100
            ).toFixed(1)
      ]
    }

    return (
      <Paper className={classes.wrapper}>
        {!ifLoading ? (
          <div className={classes.root}>
            <div>
              <Typography align="center" variant="subtitle1">
                Invested Amount
              </Typography>
              <div className={classes.buttonsAmount}>
                {buttonsAmount.map(item => (
                  <Button
                    key={shortid.generate()}
                    disabled={!tronLogin}
                    name={item.name}
                    onClick={this.handleClickInvest}
                  >
                    {item.value}
                  </Button>
                ))}
              </div>
              <TextField
                error={investError}
                disabled={!tronLogin}
                fullWidth
                className={classes.textField}
                value={numberFormatter.format(amount)}
                onChange={this.handleAmount}
                onBlur={this.blurInvestValue}
              />
            </div>
            <div>
              <Typography align="center" variant="subtitle1">
                Expiration Time
              </Typography>
              <Select
                disabled={!tronLogin}
                value={curExpiration}
                onChange={e => setCurExpiration(e.target.value)}
                className={classes.select}
                fullWidth
                input={<OutlinedInput />}
              >
                {expirationData.map(item => (
                  <MenuItem key={shortid.generate()} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div>
              <Typography align="center" variant="subtitle1">
                Strike
              </Typography>
              <Typography align="center" variant="h5">
                {usdFormatter(currentStrike)}
              </Typography>
            </div>
            <div>
              <div className={classes.pool}>
                <div className={classes.poolElement}>
                  <div>{poolTotal[0]}</div>
                  <div>{poolParts[0]} %</div>
                  <div className={classNames(classes.poolLast, 'green')}>
                    {poolAmount[0]}
                  </div>
                </div>
                <div className={classes.poolElement}>
                  <div>{poolParts[1]} %</div>
                  <div>{poolTotal[1]}</div>
                  <div className={classNames(classes.poolLast, 'red')}>
                    {poolAmount[1]}
                  </div>
                </div>
              </div>
              <StrikePool values={poolParts} />
            </div>
            {betLoading ? (
              <Progress style={{ minHeight: '95px' }} />
            ) : (
              <div className={classes.buttonsBet}>
                <Button
                  disabled={investError || !betEnabled || !tronLogin}
                  name="callAmount"
                  onClick={this.handleClickBet}
                >
                  CALL
                </Button>
                <Button
                  disabled={investError || !betEnabled || !tronLogin}
                  name="putAmount"
                  onClick={this.handleClickBet}
                >
                  PUT
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Progress />
        )}
      </Paper>
    )
  }
}

ControlBlock.propTypes = {
  tronId: PropTypes.number,
  curAsset: PropTypes.number,
  classes: PropTypes.object.isRequired,
  chartData: PropTypes.array,
  poolData: PropTypes.array,
  curExpiration: PropTypes.number,
  expirationData: PropTypes.array,
  strikeData: PropTypes.array,
  setCurExpiration: PropTypes.func,
  balance: PropTypes.number,
  tronLogin: PropTypes.bool,
  lastStick: PropTypes.number,
  ifConnect: PropTypes.bool,
  getPoolData: PropTypes.func
}

const mapStateToProps = store => ({
  tronId: store.tron.id,
  curAsset: store.trade.curAsset,
  chartData: store.trade.chartData,
  poolData: store.trade.poolData,
  balance: store.tron.balance,
  tronLogin: store.tron.login,
  curExpiration: store.trade.curExpiration,
  expirationData: store.trade.expirationData,
  strikeData: store.trade.strikeData,
  lastStick: store.trade.lastStick,
  ifConnect: store.app.connect
})

const mapDispatchToProps = actions

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ControlBlock))
