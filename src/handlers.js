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

  // Creates a new message document
  Elastic.create({
    index: 'messages',
    type: 'message',
    id: message.ts,
    body: {
      doc: message
    }
  })
}

// Handles the mammoth message_changed event
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

    /**
     * If we have a previous message and the current message text is not the same as the previous
     * This is required because certain actions like posting an image link send 2 events, the initial
     *  message and the message_changed event adding the actual picture attachment to the message.
     * If the message texts are the same we can assume this is not actually an edit but an attachment being added
     */
    if (previous && previous.text != msg.text) {
      // Store when the message was edited last
      msg.edited = editedts
      Elastic.bulk({
        body: [{
          update: {
            _index: 'messages',
            _type: 'message',
            _id: ts
          }
        }, {
          /**
           * Script that adds an edit to the edits array on the message. Two requests are required for this.
           * First we update the edits array adding the original message text
           * Then we update the rest of the message with the new text or possibily attachments
           */
          script: {
            file: 'add_edit_array', // ./scripts/add_edit_array.groovy
            params: {
              edit: {
                ts: previous.ts,
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
      // Simply edits the original message adding the new attachment (also overwrites other data if changed (it shouldn't))
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
