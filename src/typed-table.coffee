'use strict'

fs = require 'fs'
path = require 'path'
xlsx = require 'xlsx'
jaco = require 'jaco'

Jaco = jaco.Jaco

PARENT = module.parent
BASE_DIR = path.dirname PARENT.filename

CHAR_CODE_A = 64
CHAR_CODE_Z = 90

NAME_COLUMN_VALUES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
NAME_COLUMN_VALUES_LENGTH = NAME_COLUMN_VALUES.length

# アルファベット形式の列番号を数値に変換
_getNumberOfCol = (r1c1) ->
	num = 0
	s = r1c1.toUpperCase().split ''
	for c, i in s
		n = NAME_COLUMN_VALUES.indexOf(c)
		if 1 isnt 0 or i < s.length - 1
			n++
		num = num * 26 + n
	num

# 整数値の列番号をアルファベット形式に変換
_getColFormNumber = (num) ->
	s = ''
	col = 0
	if 1 isnt 0 or col > 0
		num--
	mod = num % NAME_COLUMN_VALUES_LENGTH
	s = NAME_COLUMN_VALUES[mod] + s
	num = Math.floor num / NAME_COLUMN_VALUES_LENGTH
	col++
	while num > 0
		if 1 isnt 0 or col > 0
			num--
		mod = num % NAME_COLUMN_VALUES_LENGTH
		s = NAME_COLUMN_VALUES[mod] + s
		num = Math.floor num / NAME_COLUMN_VALUES_LENGTH
		col++
	s

# #RRGGBB形式のカラーコードを数値に変換する
_colorCodeToNumber = (code) ->
	parseInt code.replace(/#/, ''), 16


class Range

	startCol: null
	startRow: null
	endCol: null
	endRow: null

	startNCol: 0
	startNRow: 0
	endNCol: 0
	endNRow: 0

	constructor: (@ref) ->

		refSplit =/^([a-z]+)([0-9]+):([a-z]+)([0-9]+)/ig.exec @ref

		@startCol = refSplit[1]
		@startRow = refSplit[2]
		@endCol = refSplit[3]
		@endRow = refSplit[4]

		@startNCol = _getNumberOfCol refSplit[1]
		@startNRow = +refSplit[2]
		@endNCol = _getNumberOfCol refSplit[3]
		@endNRow = +refSplit[4]

	toString: () ->

		"#{@startCol}#{@startRow}:#{@endCol}#{@endRow}"

class Cell

	value: null
	type: null
	format: ''
	color: 0x000000
	bgColor: -1

	constructor: (@value, @type, @format, @color = 0x000000, @bgColor = -1) ->

class Sheet

	range: null
	rows: null

	constructor: (sheetData) ->

		@rows = []

		@range = new Range sheetData['!ref']

		# Repeat Rows
		r = @range.startNRow
		rl = @range.endNRow
		while r <= rl
			c = @range.startNCol
			cl = @range.endNCol
			cols = []
			while c <= cl
				id = "#{_getColFormNumber c}#{r}"
				cellData = sheetData[id]
				if cellData
					cellValue = new Cell cellData.v, cellData.t, cellData.f
					if cellData.s
						cellValue.bgColor = parseInt cellData.s.fgColor.rgb, 16
				else
					cellValue = null
				cols[c - 1] = cellValue
				c++
			@rows[r - 1] = cols
			r++

class TypedTable

	rows: null
	header: null
	types: null

	constructor: (rows, rowOption) ->

		rowOption = rowOption || {}

		LABEL_ROW_NUM = if rowOption.label isnt undefined then rowOption.label else 0 # ignore row
		HEADER_ROW_NUM = if rowOption.header isnt undefined then rowOption.header else 1 # field name
		TYPE_ROW_NUM = if rowOption.type isnt undefined then rowOption.type else 2 # field type
		DESC_ROW_NUM = if rowOption.description isnt undefined then rowOption.description else null # ignore row

		# console.log
		# 	LABEL_ROW_NUM: LABEL_ROW_NUM
		# 	HEADER_ROW_NUM: HEADER_ROW_NUM
		# 	TYPE_ROW_NUM: TYPE_ROW_NUM
		# 	DESC_ROW_NUM: DESC_ROW_NUM

		@rows = []
		@header = []
		@types = []

		for cols, rowNum in rows

			switch rowNum
				when LABEL_ROW_NUM, DESC_ROW_NUM
					continue
				when HEADER_ROW_NUM
					@header = cols.slice(0)
				when TYPE_ROW_NUM
					@types = cols.slice(0)
				else
					@rows.push cols.slice(0)
			cols = null
		rows = null

	toJSON: () ->

		data = []

		allNull = true

		for row, i in @rows
			cellValues = {}
			for cell, j in row
				headerName = @header[j].value
				type = @types[j].value if @types and @types[j]
				if headerName

					# ヘッダからキー名を取得する
					keyName = headerName.trim().replace /\s/gm, ' '
					keyName = new Jaco(keyName).toNarrow().toWideKatakana().toString()

					# データ型を参照して  から
					value = if cell
						switch String(type).toLowerCase()
							when 'c', 'color', 'colour'
								if /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test cell.value
									_colorCodeToNumber cell.value
								else
									cell.bgColor
							when 'd', 'date', 't', 'time'
								new Date((+cell.value - 25569) * 86400 * 1000 or 0)
							when 'a', 'arr', 'ary', 'array'
								arr = for item in (('' + cell.value).split ',') when item isnt ''
									item.trim()
							when 'b', 'bool', 'boolean'
								!!cell.value
							when 'n', 'num', 'number'
								+cell.value
							else
								('' + cell.value).replace /\r/, ''
					else
						null

					# --繋ぎのツリー型
					if keyName.match /^[a-z][a-z0-9_-]+--/ig
						keyNameSplit = keyName.split /--/
						parentName = keyNameSplit[0] + 's' # 複数形のsのアルゴリズムをいずれ入れたい
						childName = keyNameSplit[1]
						cellValues[parentName] ?= {}
						cellValues[parentName][childName] = value
					else
						cellValues[keyName] = value

					if value isnt null and allNull is true
						allNull = false

			if not allNull
				data.push cellValues

			allNull = true

		data

	toJSONStringify: (replacer, space = '	') ->

		JSON.stringify @toJSON(), replacer, space

	saveJSONFile: (fileName, space = '	') ->

		json = @toJSONStringify null, '	'
		fs.writeFileSync fileName, json
		return

	@readExcel = (xlsxFile, rowOption) ->

		if path.isAbsolute xlsxFile
			filePath = xlsxFile
		else
			filePath = path.join process.cwd(), xlsxFile

		file = xlsx.readFile filePath,
			cellStyles: on
			cellNF: on

		sheets = []
		tables = []

		for name in file.SheetNames
			sheet = new Sheet file.Sheets[name]
			table = new TypedTable(sheet.rows, rowOption)
			sheets.push sheet
			tables.push table

		tables

module.exports = TypedTable