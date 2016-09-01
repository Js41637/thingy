const EventEmitter = require('events')
const elasticsearch = require('elasticsearch')

class Elastic extends EventEmitter {
  constructor(host) {
    super()

    this._client = new elasticsearch.Client({
      host: host,
      log: 'error'
    })

    this._init()
  }

  _init() {
    this._client.ping({
      requestTimeout: 30000,
      hello: "elasticsearch"
    }, error => {
      if (error) this.emit('disconnected')
      else {
        this.emit('connected')
      }
    })
  }
}

exports.default = Elastic
module.exports = exports['default']
