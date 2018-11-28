'use strict'
class IMSADODBWriter {
  constructor () {
    this.connection = null
    this.dataSourcePath = null
  }

  async connect (dataSourcePath) {
    throw new Error('This connect method must be implement on subclass.') 
  }

  async insert (tableName, data) {
    throw new Error('this writeData() function must be implement on subclass.')
  }
 
  async update (tableName, data, conditions) {
    throw new Error('this writeData() function must be implement on subclass.')
  }

  async delete (tableName, conditions) {
    throw new Error('this writeData() function must be implement on subclass.')
  }
}
module.exports = IMSADODBWriter
