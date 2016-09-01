const RtmClient = require('@slack/client').RtmClient
const MemoryDataStore = require('@slack/client').MemoryDataStore
const RTM_EVENTS = require('@slack/client').RTM_EVENTS
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS
const SLACK = require('../helpers').logging.SLACK

class Slack extends RtmClient {
  constructor(token) {
    super(token, {
      logLevel: 'error',
      dataStore: new MemoryDataStore(),
      autoReconnect: true,
      autoMark: false
    })

    this._initEvents()
    this.start()
  }

  _initEvents() {
    this.on(CLIENT_EVENTS.RTM.AUTHENTICATED, ({ self, team }) => this.emit('connected', { self, team }))

    this.on(CLIENT_EVENTS.RTM.DISCONNECT, () => this.emit('disconnected'))

    this.on(CLIENT_EVENTS.RTM.UNABLE_TO_RTM_START, () => this.emit('disconnected'))

    this.on(RTM_EVENTS.MESSAGE, message => this.emit('newMessage', message))

    this.on(CLIENT_EVENTS.RTM.ATTEMPTING_RECONNECT, () => {
      console.error(SLACK, 'Connection to Slack lost, reconnecting...')
    })
  }
}

exports.default = Slack;
module.exports = exports['default'];
