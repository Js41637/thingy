const _ = require('lodash')

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
  // Delete this crap
  delete message.team
  delete message.type
  delete message.subtype
  delete message.reply_to
  message.edits = []

  Elastic.create({
    index: 'messages',
    type: 'message',
    id: message.ts,
    body: {
      doc: message
    }
  })
}

const _handleMessageChange = (message, Elastic) => {
  setTimeout(() => {
    const ts = message.message.ts
    const editedts = _.get(message, 'message.edited.ts')
    let msg = message.message
    let previous = message.previous_message

    // Delete things we know won't change and other crap
    delete msg.type
    delete msg.channel
    delete msg.user
    delete msg.subtype
    delete msg.reply_to
    delete msg.edited

    if (previous && previous.text != msg.text) {
      Elastic.bulk({
        body: [{
          update: {
            _index: 'messages',
            _type: 'message',
            _id: ts
          }
        }, {
          script: {
            file: 'add_edit_array',
            params: {
              edit: {
                ts: editedts,
                text: previous.text
              }
            }
          }
        }, {
          update: {
            _index: 'messages',
            _type: 'message',
            _id: ts
          }
        }, {
          doc: msg
        }]
      })
    } else {
      Elastic.update({
        index: 'messages',
        type: 'message',
        id: ts,
        body: {
          doc: msg
        }
      })
    }
  }, 1000)
}

exports.messageHandler = message
