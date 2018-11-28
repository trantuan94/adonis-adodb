'use strict'
/**
 * QueryBUilder class to generate query string.
 * @author Tran Tuan
 */
const _ = require('lodash')
const Utils = require('../Utils')
class QueryBuilder {
  constructor (sourceType = 'MSAccess') {
    this.isExcel = sourceType === 'MSExcel'
  }
  /**
   * FUNC: Generate query string.
   * @param {String} tableName The name of table in ADoDB
   * @param {Object} conditions The conditions want to generate query.
   */
  buildQuery (tableName, conditions) {
    tableName = this.isExcel ? Utils.genExcelName(tableName) : tableName
    let sqlMethods = ['count', 'min', 'max', 'avg', 'sum']
    let query = ''
    // select clause
    if (_.has(conditions, '$select')) {
      let selectClause = this._buildSelectClause(conditions.$select)
      query = `${selectClause} FROM ${tableName}`
    } else {
      query = `SELECT * FROM ${tableName}`
    }

    // Where clause
    if (_.has(conditions, '$filters')) {
      let whereClause = this.buildWhereFilter(conditions.$filters)
      if (whereClause !== '') {
        query += ` WHERE ${whereClause}`
      }
    }
    // group by condition
    if (_.has(conditions, '$group')) {
      let groupStr = this._buildGroupByClause(conditions.$group)
      if (groupStr !== '') {
        query += groupStr
      }
    }
    // sort condition
    let sortable = true
    sqlMethods.forEach((method) => {
      if (query.toLowerCase().indexOf(method) !== -1) {
        sortable = false
      }
    })
    if (_.has(conditions, '$sort') && sortable) {
      let sortStr = this._buildSortConditions(conditions.$sort)
      if (sortStr !== '') {
        query += ` ORDER BY ${sortStr}`
      }
    }

    query = query.trim()

    return query
  }

  /**
   * FUNC: Generate where clause of query string.
   * @param {Object} whereCond the conditions to filter.
   */
  buildWhereFilter (whereCond) {
    if (Array.isArray(whereCond)) {
      let queryStr = ''
      for (let cond of whereCond) {
        let str = this.buildWhereFilter(cond)
        if (str !== '') {
          if (str.indexOf(' OR ') !== -1 || str.indexOf(' or ') !== -1) {
            str = `(${str})`
          }
          if (queryStr !== '') {
            queryStr += ` AND ${str}`
          } else {
            queryStr = str
          }
        }
      }

      return queryStr
    } else if (typeof whereCond === 'object' && !Array.isArray(whereCond)) {
      let field = _.keys(whereCond)
      if (field.length === 1) {
        field = field[0]
        if (field === '$or') {
          let queryStr = this._buildOrWhereFilter(whereCond.$or)

          return queryStr
        } else {
          let queryStr = ''
          if (Array.isArray(whereCond[field])) {
            queryStr += (this.isExcel ? Utils.genExcelName(field) : field) + ' IN (' + Utils._arr2SQLString(whereCond[field]) + ")"
          } else if (typeof whereCond[field] === 'object' && whereCond[field] !== null) {
            let operator = _.keys(whereCond[field])
            if (operator.length > 0) {
              operator = operator[0]
              switch (operator) {
                case '$eq':
                  queryStr = (this.isExcel ? Utils.genExcelName(field) : field) + " = '" + whereCond[field][operator] + "'"
                  break
                case '$gt':
                  queryStr = (this.isExcel ? Utils.genExcelName(field) : field) + " > '" + whereCond[field][operator] + "'"
                  break 
                case '$gte':
                  queryStr = (this.isExcel ? Utils.genExcelName(field) : field) + " >= '" + whereCond[field][operator] + "'"
                  break
                case '$lt':
                  queryStr = (this.isExcel ? Utils.genExcelName(field) : field) + " < '" + whereCond[field][operator] + "'"
                  break
                case '$lte':
                  queryStr = (this.isExcel ? Utils.genExcelName(field) : field) + " <= " + whereCond[field][operator] + "'"
                  break
                case '$like':
                  if (whereCond[field][operator].indexOf('%') === -1) {
                    whereCond[field][operator] = '%' + whereCond[field][operator] + '%'
                  }
                  queryStr = (this.isExcel ? Utils.genExcelName(field) : field) + " LIKE '" + whereCond[field][operator] + "'"
                  break
                case '$ne':
                  queryStr = (this.isExcel ? Utils.genExcelName(field) : field) + " != '" + whereCond[field][operator] + "'"
                  break
                case '$dislike':
                  if (whereCond[field][operator].indexOf('%') === -1) {
                    whereCond[field][operator] = '%' + whereCond[field][operator] + '%'
                  }
                  queryStr = (this.isExcel ? Utils.genExcelName(field) : field) + " NOT LIKE '" + whereCond[field][operator] + "'"
                  break
                case '$in':
                  whereCond[field][operator] = Array.isArray(whereCond[field][operator])
                    ? Utils._arr2SQLString(whereCond[field][operator]) : "['" + +whereCond[field][operator] + "']"
                  queryStr = (this.isExcel ? Utils.genExcelName(field) : field) + " IN (" + whereCond[field][operator] + ")"
                  break
                case '$nin':
                  whereCond[field][operator] = Array.isArray(whereCond[field][operator])
                    ? Utils._arr2SQLString(whereCond[field][operator]) : "['" + whereCond[field][operator] + "']"
                  queryStr = (this.isExcel ? Utils.genExcelName(field) : field) + " NOT IN (" + whereCond[field][operator] + ")"
                  break
                case '$isnull':
                  field = this.isExcel ? Utils.genExcelName(field) : field
                  queryStr = `${field} IS NULL`
                  break
                case '$notnull':
                  field = this.isExcel ? Utils.genExcelName(field) : field
                  queryStr = `${field} IS NOT NULL`
                  break
                default: 
                  queryStr = ''
              }
  
              return queryStr
            }
          } else if (typeof whereCond[field] === 'string') {
            queryStr += (this.isExcel ? Utils.genExcelName(field) : field) + " = '" + whereCond[field] + "'"
          } else if (whereCond[field] == null) {
            queryStr += (this.isExcel ? Utils.genExcelName(field) : field) + ' IS NULL'
          }

          return queryStr
        }
      }
    }
  }

  /**
   * FUNC: The generate orWhere clause in where clause.
   * @param {Array|Object} orWhereCond The conditions want generate or where clause
   */
  _buildOrWhereFilter (orWhereCond) {
    if (Array.isArray(orWhereCond)) {
      let queryStr = ''
      for (let cond of orWhereCond) {
        let str = this._buildOrWhereFilter(cond)
        if (str !== '') {
          if (str.indexOf(' AND ') !== -1 || str.indexOf(' and ') !== -1) {
            str = `(${str})`
          }
          if (queryStr !== '') {
            queryStr +=  ` OR ${str}`
          } else {
            queryStr += str
          }
        }
      }

      return queryStr
    } else if (typeof orWhereCond === 'object' && !Array.isArray(orWhereCond)) {
      let queryStr = this.buildWhereFilter(orWhereCond)

      return queryStr
    }
  }

  /**
   * FUNC: Generate select clause in query string to get data from table.
   * @param {Array|Object} selectOpts
   */
  _buildSelectClause (selectOpts) {
    let clause = 'SELECT '
    let sqlMethods = ['count', 'min', 'max', 'avg', 'sum']
    if (Array.isArray(selectOpts)) {
      let addIDField = !this.isExcel
      sqlMethods.forEach((method) => {
        selectOpts.forEach((field) => {
          if (field.toLowerCase().indexOf(method) !== -1) {
            addIDField = false
          }
        })
      })
      selectOpts = selectOpts.map((field) => {
        return field.toLowerCase()
      })
      if (!selectOpts.includes('id') && addIDField) {
        selectOpts.unshift('id')
      }
      clause += selectOpts.toString()
    } else if (typeof selectOpts === 'string') {
      clause += selectOpts
    } else if (typeof selectOpts === 'object' && !Array.isArray(selectOpts)) {
      if (_.has(selectOpts, '$count') && selectOpts.$count !== false) {
        let selectField = '*'
        let alias = 'aggregate'
        if (typeof selectOpts.$count === 'string') {
          selectField = selectOpts.$count.split(',')[0] ? selectOpts.$count.split(',')[0] : '*'
        } else if (typeof selectOpts.$count === 'object' && !Array.isArray(selectOpts.$count)) {
          selectField = _.keys(selectOpts.$count)[0] ? _.keys(selectOpts.$count)[0] : '*'
          alias = selectOpts.$count[selectField] && typeof selectOpts.$count[selectField] === 'string'
            ? selectOpts.$count[selectField] : 'aggregate'
        }
        if (selectField !== '*' && this.isExcel) {
          selectField = Utils.genExcelName(selectField)
        }
        clause += this._buildCountClause(selectField, alias)
      } else {
        if (_.has(selectOpts, '$distinct') && selectOpts.$distinct === true) {
          clause += 'DISTINCT '
        }
        if (_.has(selectOpts, '$visible')) {
          if (typeof selectOpts.$visible === 'string') {
            selectOpts.$visible = selectOpts.$visible.split(',')
          }
          if (Array.isArray(selectOpts.$visible)) {
            let addIDField = !this.isExcel
            selectOpts.$visible = selectOpts.$visible.map((field) => {
              if (typeof field === 'string' && field !== '') {
                return this.isExcel ? Utils.genExcelName[field] : field.toLowerCase()
              } else {
                return ''
              }
            })
            sqlMethods.forEach((method) => {
              selectOpts.$visible.forEach((field) => {
                if (field.indexOf(method) !== -1) {
                  addIDField = false
                }
              })
            })
            if (!selectOpts.$visible.includes('id') && addIDField) {
              selectOpts.$visible.unshift('id')
            }
            clause += selectOpts.$visible.toString()
          } else {
            clause = '*'
          }
        } else {
          clause + '*'
        }
      }
    } else {
      clause += '*'
    }

    return clause
  }

  _buildCountClause (fields = '*', alias = null) {
    let clause = ' COUNT ('
    if (typeof alias !== 'string' && alias !== null) {
      alias = 'aggregate'
    } else {
      alias = alias.trim()
    }
    if (typeof fields === 'string') {
      clause += `${fields}) AS ${alias}`
    }

    return clause
  }

  /**
   * FUNC: Generate groupBy conditions clause in query string.
   * @param {Array|String} groupCond list group by conditions
   * @param {Array|Object} havingCond List filters for groupby clause.
   */
  _buildGroupByClause (groupCond, havingCond = null) {
    if (typeof groupCond === 'string') {
      groupCond = groupCond.split(',')
    }
    let clause = ' GROUP BY '
    if (Array.isArray(groupCond)) {
      groupCond = groupCond.map((cond) => {
        return this.isExcel ? Utils.genExcelName(cond) : cond
      })
      clause += groupCond.toString()
    } else {
      clause = ''
    }

    if (havingCond && clause !== '') {
      let havingStr = this._buildHavingClause(havingCond, groupCond)
      if (havingStr !== '') {
        clause += ` HAVING ${havingStr}`
      }
    }

    return clause
  }
  /**
   * 
   * @param {Array|Object} havingCond list 
   * @param {Array} groupByFields 
   */
  _buildHavingClause (havingCond, groupByFields) {
    let clause = ''
    if (Array.isArray(havingCond)) {
      havingCond.forEach((cond, i) => {
        if (typeof cond === 'object' && cond !== null) {
          let field = _.keys(cond)
          if (field.length) {
            field = this.isExcel ? Utils.genExcelName(field[0]) : field[0]
            if (groupByFields.includes(field)) {
              let str = this.buildWhereFilter(cond)
              if (str !== '') {
                if (str.indexOf(' OR ') || str.indexOf(' or ')) {
                  str = `{${str}}`
                }
                if (clause !== '') {
                  clause = str
                } else {
                  clause += ' AND ' + str
                }
              }
            }
          }
        }
      })

      return clause
    } else if (typeof havingCond === 'object' && havingCond !== null) {
      let fields = _.keys(havingCond)
      fields.forEach((field, i) => {
        field = this.isExcel ? Utils.genExcelName(field) : field
        if (groupByFields.includes(field)) {
          let str = this.buildWhereFilter(havingCond[field])
          if (str !== '') {
            if (str.indexOf(' OR ') || str.includes(' or ')) {
              str = `(${str})`
            }
            if (clause !== '') {
              clause += ` AND ${str}`
            } else {
              clause = str
            }
          }
        }
      })

      return clause
    }
  }

  /**
   * FUNC: Generate orderby condition clause in query string.
   * @param {Array|Object} sortCond The order by conditions
   */
  _buildSortConditions (sortCond) {
    if (Array.isArray(sortCond)) {
      let sortStr = ''
      for (let cond of sortCond) {
        let str = this._buildSortConditions(cond)
        if (str !== '') {
          if (sortStr === '') {
            sortStr = str
          } else {
            sortStr += `, ${str}`
          }
        }
      }

      return sortStr
    } else if (typeof sortCond === 'object') {
      let sortStr = ''
      let fields = _.keys(sortCond)
      fields.forEach((field, i) => {
        field = this.isExcel ? Utils.genExcelName(field) : field
        let sortBy = 'ASC'
        if (sortCond[field] === -1 || sortCond[field] === 'desc') {
          sortBy = 'DESC'
        }
        if (sortStr === '') {
          sortStr = `${field} ${sortBy}`
        } else {
          sortStr += `, ${field} ${sortBy}`
        }
      })

      return sortStr
    }
  }

  /**
   * FUNC: Generate query string to insert data to a table.
   * @param {String} table The name of table want to insert data
   * @param {Array|Object} values Values will be insert to table.
   * @param {Array} fields list fields of table to mapped data with values param.
   */
  insertQuery (table, values, fields = []) {
    table = this.isExcel ? Utils.genExcelName(table) : table
    let query = `INSERT INTO ${table}`
    if (fields.length) {
      if (this.isExcel) {
        let insertFields = fields.map((field) => {
          return Utils.genExcelName(field)
        })
        query += ` (${insertFields.toString()})`
      } else {
        query += ` (${fields.toString()})`
      }
    }
    if (Array.isArray(values)) {
      let insertValStr = ''
      values.forEach((value) => {
        let insertValue = []
        if (fields.length === 0) {
          if (Array.isArray(value)) {
            insertValue = value
          } else if (typeof value === 'object' && value !== null) {
            insertValue = _.values(value)
          }
        } else {
          if (Array.isArray(value)) {
            insertValue = value.map((v, i) => {
              if (i < fields.length) return v
            })
          } else if (typeof value === 'object' && value !== null) {
            fields.forEach((field) => {
              insertValue.push(value[field] || null)
            })
          }
        }
        if (insertValue.length) {
          if (insertValStr === '') {
            insertValStr += '(' + Utitls._arr2SQLString(insertValue) + ')'
          } else {
            insertValStr += ', (' + Utitls._arr2SQLString(insertValue) + ')'
          }
        }
      })
      if (insertValStr !== '') {
        query += ` VALUES (${insertValStr})`
      } else {
        query = ''
      }
    } else if (typeof values === 'object') {
      let insertValue = []
      if (fields.length === 0) {
        insertValue = _.values(values)
      } else {
        let keys = _.keys(values)
        keys.forEach((key) => {
          if (fields.includes(key)) {
            insertValue.push(values[key])
          }
        })
      }
      if (insertValue.length) {
        query += ' VALUES (' + Utils._arr2SQLString(insertValue) + ')'
      } else {
        query = ''
      }
    }

    return query
  }

  /**
   * FUNC: Generate query string to update data to the table rows mapped with conditions.
   * @param {String} table The table name.
   * @param {Object} values update data.
   * @param {Array|Object} conditions The value to generate where clause in update query string.
   */
  updateQuery (table, values, conditions) {
    let query = ''
    let updateValueStr = ''
    if (values && typeof values === 'object' && !Array.isArray(values)) {
      let fields = _.keys(values)
      fields.forEach((field) => {
        values[field] = String(values[field])
        if (updateValueStr !== '') {
          updateValueStr += ', '
        }
        updateValueStr += values[field] !== null
          ? (this.isExcel ? Utils.genExcelName(field) : field) + ` = '${values[field]}'` : (this.isExcel ? Utils.genExcelName(field) : field) + ' = NULL'
      })
    }
    if (updateValueStr !== '') {
      table = this.isExcel ? Utils.genExcelName(table) : table
      query += `UPDATE ${table} SET ${updateValueStr}`
      let whereClause = this.buildWhereFilter(conditions)
      if (whereClause !== '') {
        query += ` WHERE ${whereClause}`
      }
    } else {
      query = ''
    }

    return query
  }

  /**
   * FUNC: Generate query string to delete data rows in a table mapped with conditions.
   * @param {String} table The table's name.
   * @param {*} conditions The value to generate where clause in delete query string.
   */
  deleteQuery (table, conditions) {
    table = this.isExcel ? Utils.genExcelName(table) : table
    let query = `DELETE FROM ${table}`
    let whereClause = this.buildWhereFilter(conditions)
    console.log('where Clause', whereClause)
    if (whereClause !== '') {
      query += ` WHERE ${whereClause}`
    }

    return query
  }
}
module.exports = QueryBuilder
