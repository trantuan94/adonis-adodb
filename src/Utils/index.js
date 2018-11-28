'use strict'
class Utils {
  static _arr2SQLString (arr) {
    let str = ''
    arr.forEach((ele, i) => {
      if (arr.length <= 1) {
        str = ele
      } else {
        if (str !== '') {
          str += ele !== null ? `, '${ele}'` : `, NULL`
        } else {
          str += ele !== null ? `'${ele}'` : 'NULL'
        }
      }
    })

    return str
  }

  static genExcelName (name) {
    let firstSquareExp = /^\[.+$/
    let lastSquareExp = /^.+\]$/
    if (!firstSquareExp.test(name)) {
      name = `[${name}`
    }
    if (!lastSquareExp.test(name)) {
      name = `${name}]`
    }

    return name
  }
}
module.exports = Utils
