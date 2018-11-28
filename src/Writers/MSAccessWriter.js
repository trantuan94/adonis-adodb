'use strict'
const IMSADODBWriter = require('./IMSADODBWriter')
const ADODBConnection = require('../Connection')
const QueryBuilder = require('../QueryBuilder')
const _ = require('lodash')
class MSAccessWriter extends IMSADODBWriter {
  constructor () {
    super()
    this.adodbConnection = new ADODBConnection()
    this.queryBuilder = new QueryBuilder()
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
            let insertColumns = _.pull(tableColumns, 'id')
            console.log('insert col', insertColumns)
            let insertQuery = this.queryBuilder.insertQuery(tableName, data, insertColumns)
            if (insertQuery !== '') {
              console.log('insert query', insertQuery)
              let result = await this.connection.execute(insertQuery)

              return result
            } else {
              console.log('not have value to insert')
              return null
            }
          } else {
            console.log('not found columns', tableColumns)
          }
        } else {
          console.log('not found table')
        }
        return null
      } else {
        console.log('not create connection')
        return null
      }
    } catch (err) {
      throw err
    }
  }

  async update (tableName, data, conditions) {
    try {
      if (this.connection) {
        let updateQuery = this.queryBuilder.updateQuery(tableName, data, conditions)
        if (updateQuery) {
          let result = await this.connection.execute(updateQuery)

          return result
        }
      }

      return null
    } catch (err) {
      throw err
    }
  }

  async delete (tableName, conditions) {
    try {
      if (this.connection) {
        let updateQuery = this.queryBuilder.deleteQuery(tableName, conditions)
        if (updateQuery) {
          let result = await this.connection.execute(updateQuery)

          return result
        }
      }

      return null
    } catch (err) {
      throw err
    }
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
          columns.push(row.COLUMN_NAME.toLowerCase())
        })
      }
    }

    return columns
  }
}
module.exports = MSAccessWriter
