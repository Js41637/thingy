const colors = require('colors') // eslint-disable-line
const elasticsearch = require('elasticsearch')
const RtmClient = require('@slack/client').RtmClient
const MemoryDataStore = require('@slack/client').MemoryDataStore
const RTM_EVENTS = require('@slack/client').RTM_EVENTS
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS
const config = require('./config')

const SLACK = `${'['.grey}${'Slack'.cyan}${']'.grey}`
const ELASTIC = `${'['.grey}${'Elastic'.red}${']'.grey}`

const client = new elasticsearch.Client({
  host: config.host,
  log: 'error'
})

const rtm = new RtmClient(config.token, {
  logLevel: 'error',
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: false
})

rtm.start()

client.ping({
  requestTimeout: 30000,
  hello: "elasticsearch"
}, (error) => {
  if (error) console.error(ELASTIC, 'elasticsearch cluster is down!'.toUpperCase())
  else console.log(ELASTIC, 'All is well')
})

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  console.log(SLACK, 'Received Message', message)

  if (message.type == 'message' && !message.subtype) {
    let body = message
    delete body.team
    delete body.type
    client.create({
      index: 'messages',
      type: 'message',
      id: body.ts,
      body
    }, err => {
      if (err) console.error(ELASTIC, "Encountered an error", err)
      else console.log(ELASTIC, "Successfully created message")
    })
  } else {
    if (message.subtype == 'message_changed') return handleMessageChanged(message)
    else console.log("Not a message changed")
  }
})

// Update original message on message changed event
const handleMessageChanged = message => {
  setTimeout(() => {
    let msg = message.message

    // Delete things we know won't change
    delete msg.type
    delete msg.channel
    delete msg.user

    // If it's an edited message, store the original message and put it into array
    if (msg.edited) {
      delete msg.edited.user // Don't need dis
      msg.edits = [msg.edited]
      delete msg.edited // No longer needed
      if (message.previous_message) msg.edits[0].original = message.previous_message.text
    }

    client.update({
      index: 'messages',
      type: 'message',
      id: message.message.ts,
      body: {
        doc: msg
      }
    }, err => {
      if (err) console.error(ELASTIC, "Error editing message", err)
      else console.log(ELASTIC, "Successfully updated message")
    })
  }, 1000)
}

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  let user = rtm.dataStore.getUserById(rtm.activeUserId)
  let team = rtm.dataStore.getTeamById(rtm.activeTeamId)

  console.log(SLACK, 'Connected to', team.name, 'as', user.name)
})

rtm.on(CLIENT_EVENTS.RTM.DISCONNECT, () => {
  console.error(SLACK, 'Disconnected from Slack, exiting')
  process.exit(1)
})

rtm.on(CLIENT_EVENTS.RTM.ATTEMPTING_RECONNECT, () => {
  console.error(SLACK, 'Connection to Slack lost, reconnecting...')
})
