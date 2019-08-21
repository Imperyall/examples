import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import { withSnackbar } from 'notistack'

import * as actions from 'actions'

class Notifier extends React.Component {
	displayed = []

	storeDisplayed = id => (this.displayed = [...this.displayed, id])

	shouldComponentUpdate({ notifications: newSnacks = [] }) {
		const { notifications: currentSnacks } = this.props
		let notExists = false

		for (let i = 0; i < newSnacks.length; i += 1) {
			if (notExists) continue

			notExists =
				notExists ||
				!currentSnacks.filter(({ key }) => newSnacks[i].key === key).length
		}

		return notExists
	}

	componentDidUpdate() {
		const {
			notifications = [],
			closeSnackbar,
			enqueueSnackbar,
			removeNotify
		} = this.props

		const cancelButton = key => (
			<IconButton
				key="close"
				aria-label="Close"
				onClick={() => closeSnackbar(key)}
			>
				<CloseIcon />
			</IconButton>
		)

		notifications.forEach(notification => {
			if (this.displayed.includes(notification.key)) return

			enqueueSnackbar(notification.message, {
				...notification.options,
				action: cancelButton
			})

			this.storeDisplayed(notification.key)
			removeNotify(notification.key)
		})
	}

	render() {
		return null
	}
}

Notifier.propTypes = {
	displayed: PropTypes.array,
	storeDisplayed: PropTypes.func
}

const mapStateToProps = store => ({
	notifications: store.notify.pool
})

const mapDispatchToProps = actions

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withSnackbar(Notifier))
