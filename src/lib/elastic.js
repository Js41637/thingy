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

  create(what, cb) {
    client.update(Object.assign({}, what, { "doc_as_upsert": true }), (err, resp) => {
      if (err) console.error(ELASTIC, "Error creating document", err)
      else console.log(ELASTIC, "Successfully created document")
      if (cb && typeof cb == 'function') cb(err, resp)
    })
  }

  update(what, cb) {
    client.update(what, (err, resp) => {
      if (err) console.error(ELASTIC, "Error updating document", err)
      else console.log(ELASTIC, "Successfully updated document")
      if (cb && typeof cb == 'function') cb(err, resp)
    })
  }

  search(what, cb) {
    client.search(what, (err, resp) => {
      if (err) console.error(ELASTIC, "Error updating document", err)
      else console.log(ELASTIC, "Successfully updated document")
      if (cb && typeof cb == 'function') cb(err, resp)
    })
  }

  bulk(what, cb) {
    client.bulk(what, (err, resp) => {
      if (err) console.error(ELASTIC, "Error bulking", err)
      else console.log(ELASTIC, "Successfully bulked stuff")
      if (cb && typeof cb == 'function') cb(err, resp)
    })
  }

  get methods() {
    let { create, update, search, bulk } = this
    return { create, update, search, bulk }
  }
}

exports.default = Elastic
module.exports = exports['default']
