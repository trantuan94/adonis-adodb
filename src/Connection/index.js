'use strict'
const ADODB = require('node-adodb')
const fs = require('fs-extra')

class ADODBConnection {
  async createConnection (dataSourcePath, passwd = null) {
    try {
      let connString = await this._genConnectionString(dataSourcePath, passwd)
      if (connString) {
        let connection = ADODB.open(connString)

        return connection
      } else {
        return null
      }
    } catch (err) {
      throw err
    }
  }

  /**
   * Private
   * FUNC: Generate connection string for each Access DB format.
   * @param {String} dataSourcePath the full path to Access file.
   */
  async _genConnectionString (dataSourcePath, passwd = null) {
    let sourceExist = await this._validateDataSource(dataSourcePath)
    if (sourceExist) {
      let provider = 'Provider=Microsoft.ACE.OLEDB.12.0;'
      if (dataSourcePath.endsWith('.mdb')) { // Access 2002-2003
        if (passwd !== null) {
          return `${provider}Data Source=${dataSourcePath};Jet OLEDB:Database Password=${passwd};`
        } else {
          return `${provider}Data Source=${dataSourcePath};`
        }
      } else if (dataSourcePath.endsWith('.accdb')) { // Access 2007 and later.
        if (passwd !== null) {
          return `${provider}Data Source=${dataSourcePath};Jet OLEDB:Database Password=${passwd};`
        } else {
          return `${provider}Data Source=${dataSourcePath};Persist Security Info=False;`
        }
      } else if (dataSourcePath.endsWith('.xls')) { // Excel 2002-2003
        return `${provider}Data Source=${dataSourcePath};Extended Properties="Excel 8.0;HDR=YES";`
      } else if (dataSourcePath.endsWith('.xlsx')) { // Excel 2007 and later.
        return `${provider}Data Source=${dataSourcePath};Extended Properties="Excel 12.0 Xml;HDR=YES;IMEX=1";`
      } else {
        throw new Error('Invalid format of data source file.')
      }
    } else {
      throw new Error('Invalid data source path.')
    }
  }

  /**
   * Private
   * FUNC: Check the existence of Access file.
   * @param {String} dataSourcePath The file path of Access file.
   */
  async _validateDataSource (dataSourcePath) {
    let formats = ['.mdb', '.accdb', '.xls', '.xlsx']
    let validFormat = false
    for (let i = 0;  i < formats.length; i++) {
      if (dataSourcePath.endsWith(formats[i])) {
        validFormat = true
      }
    }
    if (validFormat) {
      let existed = await fs.pathExists(dataSourcePath)
  
      return existed
    } else {
      throw new Error('Invalid format of data source file.')
    }
  }
}
module.exports = ADODBConnection
