'use strict'
const IMSADODBReader = require('./IMSADODBReader')
const QueryBuilder = require('../QueryBuilder')
const ADODBConnection = require('../Connection')
const Utils = require('../Utils')
class MSExcelReader extends IMSADODBReader {
  constructor () {
    super()
    this.adodbConnection = new ADODBConnection()
    this.queryBuilder = new QueryBuilder('MSExcel')
    this.dataSourcePath = null
  }

  /**
   * FUNC: Create connection to dataSource using Microsoft Driver.
   * @param {String} dataSourcePath The file path of the Access/Excel file.
   */
  async connect (dataSourcePath) {
    try {
      this.dataSourcePath = dataSourcePath
      this.connection = await this.adodbConnection.createConnection(dataSourcePath)
    } catch (err) {
      throw err
    }

    return this
  }

  /**
   * FUNC: Get data from target table/sheet with options conditions
   * @param {String} sheetName The name of sheet in file.
   * @param {Object} options The conditions to get data.
   */
  async readDataFromTable (sheetName, options = {}) {
    let data = null
    if (this.connection) {
      let existTable = await this.existTable(sheetName)
      if (existTable) {
        let queryStr = this.queryBuilder.buildQuery('[' + sheetName + ']', options)
        console.log('query', queryStr)
        data = await this.query(queryStr)
      }
    }

    return data
  }

  /**
   * FUNC: Get list tables/sheets in Access/Excel file.
   * @param {Array|String} tableType The type of table want to get list.
   */
  async getTables (tableType = ['TABLE']) {
    if (typeof tableType === 'string') {
      tableType = [tableType]
    }
    let tables = []
    if (this.connection) {
      let rs = await this.connection.schema(20)
      if (rs && rs.length) {
        rs.forEach((tb) => {
          if (tableType.includes(tb.TABLE_TYPE)) {
            tables.push(tb.TABLE_NAME)
          }
        })
      }
    }

    return tables
  }

  /**
   * FUNC: Count the number of data in table.
   * @param {*} tableName Name of table want to read data.
   * @param {*} options the optional conditions of data want to count.
   */
  async count (tableName, options = {}) {
    let counter = 0
    tableName = Utils.genExcelName(tableName)
    if (this.connection) {
      let queryStr = `SELECT COUNT(*) as total FROM ${tableName}`
      let whereClause = this.queryBuilder.buildWhereFilter(options)
      if (whereClause != '') {
        queryStr += ' WHERE ' + whereClause
      }
      counter = await this.query(queryStr)
      if (counter && counter.length) {
        return counter[0].total
      }
    }

    return counter
  }

  /**
   * FUNC: Check table/Sheet is existed in Access/Excel file or not?
   * @param {String} tableName The table/sheet name want to check.
   */
  async existTable (tableName) {
    let table = []
    if (this.connection) {
      table = await this.connection.schema(20, [null, null, tableName, 'TABLE'])
      if (table && table.length) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  /**
   * FUNC: Get List columns name of a table/sheet.
   * @param {String} tableName The name of table/sheet want to get list column name.
   */
  async getColumns (tableName) {
    console.log('get columns')
    let columns = []
    if (this.connection) {
      let rs = await this.connection.schema(4, [null, null, tableName])
      if (rs && rs.length) {
        rs.forEach((row) => {
          columns.push(row.COLUMN_NAME)
        })
      }
    }

    return columns
  }

  /**
   * FUNC: Get data in the Access/Excel file by using SQL query string.
   * @param {String} queryStr The SQL query string to get data in Access/Excel file.
   */
  async query (queryStr) {
    let result = await this.connection.query(queryStr)

    return result
  }
}
module.exports = MSExcelReader
