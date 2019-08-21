import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import { ExpandLessRounded, ExpandMoreRounded } from '@material-ui/icons'
import { red, green } from '@material-ui/core/colors'

const styles = theme => ({
	arrowUp: {
		color: green[500]
	},

	arrowDown: {
		color: red[500]
	}
})

class Icons extends React.Component {
	render() {
		const { classes, name, param } = this.props

		switch (name) {
			case 'arrow':
				return param ? (
					<ExpandLessRounded className={classes.arrowUp} />
				) : (
					<ExpandMoreRounded className={classes.arrowDown} />
				)

			default:
				return <></>
		}
	}
}

Icons.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string,
  param: PropTypes.bool
}

export default withStyles(styles)(Icons)
