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

Reader function

|      Function Name           |                  Parameters         |                        Examples                  |               
| ---------------------------- | ----------------------------------- | ------------------------------------------------ |
|   readDataFromTable          | tableName: String (required)        |                                                  |
|                              | conditions: Object (optional)       |  await reader.readDataFromTable('customers', {   |
|                              |                                     |    $filters: [                                   |
|                              |                                     |      ...                                         |
|                              |                                     |    ],                                            |
|                              |                                     |    $select: {                                    |
|                              |                                     |      $visible: [                                 |
|                              |                                     |        ...                                       |
|                              |                                     |      ],                                          |
|                              |                                     |      $distinct: true                             |
|                              |                                     |      $count: '*'                                 |
|                              |                                     |    },                                            |
|                              |                                     |   $group: [                                      |
|                              \                                     |       ...                                        |
|                              |                                     |    ],                                            |
|                              |                                     |    $having: {                                    |
|                              |                                     |      ...                                         |
|                              |                                     |    },                                            |
|                              |                                     |    $sort: {                                      |
|                              |                                     |      ...                                         |
|                              |                                     |    }                                             |
|                              |                                     |  })                                              |
|                              |                                     |                                                  |
| ---------------------------- | ----------------------------------- | ------------------------------------------------ |
|                              |                                     |                                                  |
|   count                      |                                     |                                                  |
