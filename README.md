# typed-table
The module of Typed Table for JavaScript from Excel Sheet.

[![npm version](https://badge.fury.io/js/typed-table.svg)](http://badge.fury.io/js/typed-table)
[![Build Status](https://travis-ci.org/YusukeHirao/typed-table.svg?branch=1.0.0-alpha)](https://travis-ci.org/YusukeHirao/typed-table)

## Install

```
$ npm i typed-table
```

## How to use

```javascript
var tt = require('typed-table');

var tables = tt.readExcel('data.xlsx');

tables.saveJSON('data.json');
```

Input Excel file

(sheet name: "`sheet1`")

|Number Cell|Boolean Cell|Date Cell| (Label row)
|---|---|---|:---|
|a|b|c| (Key-name row)
|n|b|d| (Typing row)
|`123`|`TRUE`|`1970/1/1 0:00`| (Value rows)
|`456`|`FALSE`|`1980/1/1 0:00`|
|`789`|`TRUE`|`1990/1/1 0:00`|

Output JSON file

```javascript
{
	"sheet1": [
		{
			"a": 123,
			"b": true,
			"c": "1970-01-01T00:00:00.000Z"
		}
		{
			"a": 456,
			"b": false,
			"c": "1980-01-01T00:00:00.000Z"
		}
		{
			"a": 789,
			"b": true,
			"c": "1990-01-01T00:00:00.000Z"
		}
	]
}
```