'use strict'
const MSAccessReader = require('./MSAccessReader')
const MSExcelReader = require('./MSExcelReader')
class ReaderFactory {
  createReader (type) {
    if (type === 'MSExcel') {
      return new MSExcelReader()
    } else {
      return new MSAccessReader()
    }
  }
}
module.exports = ReaderFactory
