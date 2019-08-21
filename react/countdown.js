import React from 'react'
import PropTypes from 'prop-types'
import ReactCountdown from 'react-countdown-now'

const Countdown = props => {
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) return props.children
    else {
      hours = `${hours < 10 ? '0' : ''}${hours}`
      minutes = `${minutes < 10 ? '0' : ''}${minutes}`
      seconds = `${seconds < 10 ? '0' : ''}${seconds}`

      return <span>{hours}:{minutes}:{seconds}</span>
    }
  }

  return(
    <ReactCountdown
      date={props.date}
      renderer={renderer}
    />
  )
}

Countdown.propTypes = {
  children: PropTypes.object,
  date: PropTypes.number
}

export default Countdown
