'use strict'
class IMSADODBReader {
  constructor () {
    this.connection = null
  }

  /**
   * FUNC: Create connection to dataSource using Microsoft Driver.
   * @param {String} dataSourcePath The file path of the Access/Excel file.
   */
  async connect (dataSourcePath) {
    throw new Error('The subclass must be implement this "connect" method')
  }

  /**
   * FUNC: Get data from target table/sheet with options conditions
   * @param {String} target The name of table or sheet in file.
   * @param {Object} options The conditions to get data.
   */
  async readDataFromTable (target, options = {}) {
    throw new Error('The subclass must be implement this "readData" method')
  }

  /**
   * FUNC: Get list tables/sheets in Access/Excel file.
   * @param {Array|String} tableType The type of table want to get list.
   */
  async getTables (tableType) {
    throw new Error('The subclass must be implement this "getTables" method')
  }

  /**
   * FUNC: Count the number of data in table.
   * @param {*} tableName Name of table want to read data.
   * @param {*} options the optional conditions of data want to count.
   */
  async count (tableName, options = {}) {
    throw new Error('The subclass must be implement this "count" method')
  }

  /**
   * FUNC: Check table/Sheet is existed in Access/Excel file or not?
   * @param {String} tableName The table/sheet name want to check.
   */
  async existTable (tableName) {
    throw new Error('The subclass must be implement this "existTable()" method')
  }

  /**
   * FUNC: Get List columns name of a table/sheet.
   * @param {String} tableName The name of table/sheet want to get list column name.
   */
  async getColumns (tableName) {
    throw new Error('The subclass must be implement this "getColumns()" method')
  }

  /**
   * FUNC: Get data in the Access/Excel file by using SQL query string.
   * @param {String} queryStr The SQL query string to get data in Access/Excel file.
   */
  async query (queryStr) {
    throw new Error('The subclass must be implement this "getColumns()" method')
  }
}
module.exports = IMSADODBReader
