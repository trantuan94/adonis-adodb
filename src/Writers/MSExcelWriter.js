'use strict'
const IMSADODBWriter = require('./IMSADODBWriter')
const ADODBConnection = require('../Connection')
const QueryBuilder = require('../QueryBuilder')
const _ = require('lodash')
const Utils = require('../Utils')
class MSExcelWriter extends IMSADODBWriter {
  constructor () {
    super()
    this.adodbConnection = new ADODBConnection()
    this.queryBuilder = new QueryBuilder('MSExcel')
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

  async insert (tableName, data) {
    try {
      if (this.connection) {
        let existTable = await this.existTable(tableName)
        if (existTable) {
          let tableColumns = await this.getColumns(tableName)
          if (tableColumns) {
            let insertQuery = this.queryBuilder.insertQuery(tableName, data, tableColumns)
            console.log('insertQuery', insertQuery)
            if (insertQuery !== '') {
              let result = await this.connection.execute(insertQuery)

              return result
            }
          }
        }
      }

      return null
    } catch (err) {
      throw err
    }
  }

  async update (tableName, data, conditions) {
    throw new Error('This package not support update rows feature for MS Excel.')
  }

  async delete (tableName, conditions) {
    throw new Error('This package not support delete rows feature for MS Excel.')
  }

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
          columns.push(row.COLUMN_NAME)
        })
      }
    }

    return columns
  }
}
module.exports = MSExcelWriter
