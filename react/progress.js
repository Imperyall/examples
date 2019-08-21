import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import MuiProgress from '@material-ui/core/CircularProgress'

const styles = theme => ({
	root: {
		margin: 0
	}
})

const Progress = props => {
	const {classes, ...another} = props

	return(
		<div className="center" {...another}>
			<MuiProgress className={classes.root} />
		</div>
	)
}

Progress.propTypes = {
	classes: PropTypes.object.isRequired,
	another: PropTypes.object
}

export default withStyles(styles)(Progress)
