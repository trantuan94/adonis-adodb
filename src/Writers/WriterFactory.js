'use strict'
const MSAccessWriter = require('./MSAccessWriter')
const MSExcelWriter = require('./MSExcelWriter')
class WriterFactory {
  static createWriter (type) {
    if (type === 'MSExcel') {
      return new MSExcelWriter()
    } else {
      return new MSAccessWriter()
    }
  }
}
module.exports = WriterFactory
