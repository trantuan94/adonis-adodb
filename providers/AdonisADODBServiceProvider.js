'use strict'
/*
 * adonis-adodb
 *
 * (c) Tran Tuan <tran.van.tuan@mqsolutions.com.vn>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
const { ServiceProvider } = require('@adonisjs/fold')
class AdonisADODBServiceProvider extends ServiceProvider {
  register () {
    this.app.bind('Adonis/Addons/AdonisADODBReader', () => require('../src/Readers/ReaderFactory'))
    this.app.bind('Adonis/Addons/AdonisADODBWriter', () => require('../src/Writers/WriterFactory'))
    this.app.alias('Adonis/Addons/AdonisADODBReader', 'ADODBReader')
    this.app.alias('Adonis/Addons/AdonisADODBWriter', 'ADODBWriter')
  }
}
module.exports = AdonisADODBServiceProvider
