const colors = require('colors') // eslint-disable-line

const config = require('../config')
const handlers = require('./handlers')
const SlackClient = require('./lib/slack')
const ElasticClient = require('./lib/elastic')

const ELASTIC = `${'['.grey}${'Elastic'.red}${']'.grey}`
const SLACK = `${'['.grey}${'Slack'.cyan}${']'.grey}`

const Elastic = new ElasticClient(config.host)
const Slack = new SlackClient(config.token, SLACK)

Slack.on('newMessage', function(message) {
  console.log(SLACK, 'Received Message', message)
  handlers.messageHandler(message, Elastic._client)
})

Elastic.on('connected', () => {
  console.log(ELASTIC, 'Connected to Elastic Server')

  //console.log(Elastic.create())
})

Slack.on('connected', ({ self, team }) => {
  console.log(SLACK, 'Connected to', team.name, 'as', self.name)
})

// Shut shit down on Disconnect
Elastic.on('disconnect', () => {
  console.error(ELASTIC, 'Error connecting to Elastic Server, exiting')
  process.exit(0)
})

Slack.on('disconnect', () => {
  console.error(SLACK, 'Disconnected from Slack, restarting instance')
  setTimeout(function() {
    process.exit(1)
  }, 1500)
})