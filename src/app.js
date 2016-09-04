const readline = require('readline')
const config = require('../config')
const handlers = require('./handlers')
const SlackClient = require('./lib/slack')
const ElasticClient = require('./lib/elastic')
const { SLACK, ELASTIC } = require('./helpers').logging

const Elastic = new ElasticClient(config.host)
const Slack = new SlackClient(config.token, SLACK)

Slack.on('newMessage', function(message) {
  console.log(SLACK, 'Received Message', message)
  handlers.messageHandler(message, Elastic.methods)
})

Elastic.on('connected', () => {
  console.log(ELASTIC, 'Connected to Elastic Server')
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
  setTimeout(() => {
    process.exit(1)
  }, 1500)
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('line', (input) => {
  Elastic.search({
    index: 'messages',
    q: input
  }, (err, resp) => {
    console.log(err, "Hits", resp.hits.total, resp.hits.hits)
  })
})
