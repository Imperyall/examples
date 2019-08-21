import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import {
	Dialog,
	Typography,
	DialogTitle,
	DialogContent,
	IconButton
} from '@material-ui/core'

import CloseIcon from '@material-ui/icons/Close'

import { STYLE } from 'utils/constants'

const styles = theme => ({
	paper: {
		backgroundColor: STYLE.BACKGROUND.ITEM
	},

	title: {
		borderBottom: `1px solid ${theme.palette.divider}`,
		margin: 0,
		padding: theme.spacing(2),

		'& h6': {
			color: STYLE.TEXT
		}
	},

	content: {
		color: STYLE.TEXT,
		margin: 0,
		padding: theme.spacing(2),

		'& p': {
			color: STYLE.TEXT
		}
	},

	closeButton: {
		position: 'absolute',
		right: theme.spacing(),
		top: theme.spacing(),
		color: theme.palette.grey[500]
	}
})

const ModalDialog = props => {
	const { children, handleClose, open, classes, title } = props

	return (
		<Dialog
			classes={{
				paper: classes.paper
			}}
			onClose={handleClose}
			aria-labelledby="modal-dialog"
			open={open}
		>
			<DialogTitle
				disableTypography
				className={classes.title}
				id="modal-dialog"
			>
				<Typography variant="h6">{title}</Typography>
				{handleClose ? (
					<IconButton
						aria-label="Close"
						className={classes.closeButton}
						onClick={handleClose}
					>
						<CloseIcon />
					</IconButton>
				) : null}
			</DialogTitle>
			<DialogContent className={classes.content}>{children}</DialogContent>
		</Dialog>
	)
}

ModalDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	handleClose: PropTypes.func,
	open: PropTypes.bool
}

export default withStyles(styles)(ModalDialog)
