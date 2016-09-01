const EventEmitter = require('events')
const elasticsearch = require('elasticsearch')
const ELASTIC = require('../helpers').logging.ELASTIC

var client

class Elastic extends EventEmitter {
  constructor(host) {
    super()

    client = new elasticsearch.Client({
      host: host,
      log: 'error'
    })

    this._init()
  }

  _init() {
    client.ping({
      requestTimeout: 30000,
      hello: "elasticsearch"
    }, error => {
      if (error) this.emit('disconnected')
      else {
        this.emit('connected')
      }
    })
  }

  create(what) {
    client.create(what, err => {
      if (err) console.error(ELASTIC, "Error creating document", err)
      else console.log(ELASTIC, "Successfully created document")
    })
  }

  update(what) {
    client.update(what, err => {
      if (err) console.error(ELASTIC, "Error updating document", err)
      else console.log(ELASTIC, "Successfully updated document")
    })
  }

  search(what) {
    console.log(what)
  }

  get methods() {
    return { create: this.create, update: this.update, search: this.search }
  }
}

exports.default = Elastic
module.exports = exports['default']
