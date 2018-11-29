# Adonis-adodb
Adonis-ADODB package provide some features to work with ADODB on Windows.

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

> :pray: This repository is base on node-adodb and only work on Windows, install Microsoft ACE OLEDB 12.0

This package support some feature for:
- Access file (.mdb, .accdb): connect, select, insert, update, delete data.
- Excel file (.xls, .xlsx): connect and select data.
## Node/OS Target

This repo/branch is supposed to run fine on Windows 7/8/8.1/10 platforms and targets `Node.js >=8.10`

## Installation:
```
npm install adonis-adodb
```
## Configuration:
Add following row to start/app.js file in your project at providers array:
```js
const providers = [
  // ...
  'adonis-adodb/providers/AdonisADODBServiceProvider'
]
```
## Usage:
This package provide Reader and Writer class to read and write data from file.
### Reader

> Read Data:
Use readDataFromTable(tableName, conditions) function:
```js
const ADODBReader = use('ADODBReader')
//...
async read (filePath) {
    let reader = null
    if (filePath.endsWith('.mdb') || filePath.endsWith('.accdb')) {
        reader = ADODBReader.createReader()
        await reader.connect(filePath)
    } else if (filePath.endsWith('.xls') || filePath.endsWith('.xlsx')) {
        reader = ADODBReader.createReader('MSExcel')
        await reader.connect(filePath)
    }
    // Read data
    let data = await reader.readDataFromTable('customers', {
        $select: ['code', 'name'], // Array| Object -> Sql: SELECT code,name FROM customers.
        $filters: [ // Array or Object
            {
                $or: [
                    {name: {$like: 'Customer'}}, // name LIKE '%Customer%'
                    {code: {$dislike: '2%'}} // code NOT LIKE '2%'
                ]
            }, // sql clause: (name LIKE '%Customer%' OR code NOT LIKE '2%')
            {status: {$eq: 1}} // supported operator:$eq, $ne, $like, $in, $nin, $gt, $gte, $lt, $lte, $dislike, 
        ], // sql: WHERE status = '1' AND (name LIKE '%Customer%' OR code NOT LIKE '2%')
        $sort: { // Array|Object
            code: 'desc' // 1/-1 /'asc' / 'desc'
        } // Sql clause: // ORDER BY code DESC
    })
    // SqL query: SELECT code,name FROM customers WHERE status = '1' AND (name LIKE '%Customer%' 
    // OR code NOT LIKE '2%') ORDER BY code DESC
    
}
```
> Count data in table:
Use count (tableName, conditions) function:
```js
    let data = reader.count('products', {
        status: {$eq: 1} // support same $filters property in conditions parameter of readDataFromTable function.
    })
```
### Writer
> Create - Update, Delete data by Writer
```js
const ADODBWriter = use('ADODBWriter')
// ...
async changeData () {
    let writer = null
    if (filePath.endsWith('.mdb') || filePath.endsWith('.accdb')) {
        writer = ADODBWriter.createWriter()
        await writer.connect(filePath)
    } else if (filePath.endsWith('.xls') || filePath.endsWith('.xlsx')) { // Not support update / delete on Excel file.
        writer = ADODBWriter.createWriter('MSExcel')
        await writer.connect(filePath)
    }
    
    // Insert data
    if (writer) {
        await writer.insert('products', [
            {
                code: '0001',
                name: 'Product 1',
                status: 1
            },
            {
                code: '0002',
                name: 'Product 2',
                status: 0
            }
        ]) // INSERT INTO products (code, name, status) VALUES (('0001', 'Product 1', '1'), ('0002', 'Product 2', '0'))
        
        // Update data (only support Access file.
        await writer.update('products', {
            status: 1 // update status 0 -> 1
        }, {
            code: '0002' with product has code = '0002'
        }) // UPDATE products SET status = 1 WHERE code = '0002'
        
        // Delete data (Only support Access file.
        await writer.delete('products', {code: '0001'}) // DELETE FROM products WHERE code = '0001'
    }
}
```

