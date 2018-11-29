'use strict'
const IMSADODBReader = require('./IMSADODBReader')
const QueryBuilder = require('../QueryBuilder')
const ADODBConnection = require('../Connection')
class MSAccessReader extends IMSADODBReader {
  constructor () {
    super()
    this.queryBuilder = new QueryBuilder()
    this.adodbConnection = new ADODBConnection()
    this.dataSourcePath = null
  }

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
   * FUNC: hàm đọc dữ liệu theo tên bảng.
   * @param {String} tableName Tên bảng trong Access DB.
   * @param {Object} options Điều kiện lọc.
   */
  async readDataFromTable (tableName, options = {}) {
    let data = null
    if (this.connection) {
      let existTable = await this.existTable(tableName)
      if (existTable) {
        let queryStr = this.queryBuilder.buildQuery(tableName, options)
        data = await this.query(queryStr)
      }
    }

    return data
  }

  /**
   * FUNC: Get list tables of Access file.
   * @param {Array|String} tableType type of the table want to get list.Default is ['TABLE']
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
            tables.push(tb)
          }
        })
      }
    }

    return tables
  }

  /**
   * FUNC: Check table is existed in Access file or not?
   * @param {String} tableName 
   * @return {Boolean}
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
   * FUNC: Get List columns name of a table.
   * @param {String} tableName The name of table want to get list column name.
   */
  async getColumns (tableName) {
    let columns = []
    if (this.connection) {
      let rs = await this.connection.schema(4, [null, null, tableName])
      if (rs && rs.length) {
        rs.forEach((row) => {
          columns.push(row.COLUMN_NAME.toLowerCase())
        })
      }
    }

    return columns
  }

  /**
   * FUNC: Count the number of data in table.
   * @param {String} tableName Name of table want to read data.
   * @param {Object} options the optional conditions of data want to count.
   */
  async count (tableName, options = {}) {
    let counter = 0
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
   * FUNC: get data by using SQL query.
   * @param {String} queryStr The SQL query string.
   */
  async query (queryStr) {
    let result = await this.connection.query(queryStr)

    return result
  }
}
module.exports = MSAccessReader
