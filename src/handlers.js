const colors = require('colors') // eslint-disable-line
const ELASTIC = `${'['.grey}${'Elastic'.red}${']'.grey}`

const message = (message, Elastic) => {
  if (!message.subtype) message.subtype = 'message_normal'
  switch (message.subtype) {
    case 'message_normal':
      return _handleNormalMessage(message, Elastic)
    case 'message_changed':
      return _handleMessageChange(message, Elastic)
    default:
      return console.log("Unknown message type", message.subtype)
  }
}

const _handleNormalMessage = (message, Elastic) => {
  let body = message
  delete body.team
  delete body.type
  Elastic.create({
    index: 'messages',
    type: 'message',
    id: body.ts,
    body
  }, (err, resp) => _handleResp('Create', err, resp))
}

const _handleMessageChange = (message, Elastic) => {
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

    Elastic.update({
      index: 'messages',
      type: 'message',
      id: message.message.ts,
      body: {
        doc: msg
      }
    }, (err, resp) => _handleResp('Update', err, resp))
  }, 1000)
}

const _handleResp = (type, err) => {
  if (err) console.error(ELASTIC, type, "Error", err)
  else console.log(ELASTIC, type, "Success")
}

exports.messageHandler = message
