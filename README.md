# Adonis-adodb
Adonis-ADODB package provide some function to work with ADoDB on Windows based on node-adodb package.This package support some feature for:
- Access file (.mdb, .accdb): connect, select, insert, update, delete data.
- Excel file (.xls, .xlsx): connect and select data.
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
