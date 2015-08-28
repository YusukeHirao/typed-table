"use strict";

var tt = require('../lib/src/TypedTable');

var tables = tt.readExcel('test.xlsx');

console.log(tables[0].toJSON());