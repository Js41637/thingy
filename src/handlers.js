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

  // Delete this crap
  delete body.team
  delete body.type
  delete body.subtype
  delete body.reply_to

  Elastic.create({
    index: 'messages',
    type: 'message',
    id: body.ts,
    body
  })
}

const _handleMessageChange = (message, Elastic) => {
  setTimeout(() => {
    let msg = message.message

    // Delete things we know won't change and other crap
    delete msg.type
    delete msg.channel
    delete msg.user
    delete msg.subtype
    delete msg.reply_to

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
    })
  }, 1000)
}

exports.messageHandler = message
