"use strict";

// import
var chai = require('chai');
chai.use(require('chai-datetime'));
var tt = require('../lib/src/TypedTable');
var assert = chai.assert;

// test

describe('読み込みテスト', function () {

	it('読み込みエラーなし', function () {
		var xlsx = tt.readExcel('origin/xlsx001.xlsx');
		assert.ok(true);
	});

});

describe('JSONテスト', function () {
	it('JSON化した結果が正しい', function () {
		var xlsx = tt.readExcel('origin/xlsx001.xlsx');
		var json = xlsx.toJSON();
		assert.deepEqual(json, {
			sheet001: [
				{
					'a-string': 'abc',
					'b-number': 123
				}
			],
			sheet002: []
		});
	});

	it('JSONでファイル出力した結果が正しい', function () {
		var xlsx = tt.readExcel('origin/xlsx001.xlsx');
		xlsx.saveJSON('output/xlsx001.json');
		var $output = require('./output/xlsx001.json');
		var $diff = require('./validation/xlsx001-v.json');
		assert.deepEqual($output, $diff);
		
	});
	
});

describe('型テスト', function () {
	
	var xlsx = tt.readExcel('origin/xlsx002.xlsx');
	var json = xlsx.toJSON();
	
	it('値が空', function () {
		var row = json.suite[0];
		assert.strictEqual(row.empty, '', '型未定義');
		assert.strictEqual(row.s, '', '文字列型 s');
		assert.strictEqual(row.str, '', '文字列型 str');
		assert.strictEqual(row.string, '', '文字列型 string');
		assert.strictEqual(row.c, -1, '色型 c');
		assert.strictEqual(row.color, -1, '色型 color');
		assert.strictEqual(row.colour, -1, '色型 colour');
		assert.equalTime(row.d, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 time');
		assert.ok(isNaN(row.n), '数値型 n');
		assert.ok(isNaN(row.num), '数値型 num');
		assert.ok(isNaN(row.number), '数値型 number');
		assert.strictEqual(row.i, 0, '整数型 i');
		assert.strictEqual(row.int, 0, '整数型 int');
		assert.strictEqual(row.u, 0, '符号なし整数型 u');
		assert.strictEqual(row.uint, 0, '符号なし整数型 uint');
		assert.ok(isNaN(row.f), '浮動小数点数型 f');
		assert.ok(isNaN(row.float), '浮動小数点数型 float');
		assert.strictEqual(row.b, false, '論理値型 b');
		assert.strictEqual(row.bool, false, '論理値型 bool');
		assert.strictEqual(row.boolean, false, '論理値型 boolean');
		assert.deepEqual(row.a, [], '配列型 a');
		assert.deepEqual(row.arr, [], '配列型 arr');
		assert.deepEqual(row.ary, [], '配列型 ary');
		assert.deepEqual(row.array, [], '配列型 array');
	});

	it('0', function () {
		var row = json.suite[1];
		assert.strictEqual(row.empty, 0, '型未定義');
		assert.strictEqual(row.s, '0', '文字列型 s');
		assert.strictEqual(row.str, '0', '文字列型 str');
		assert.strictEqual(row.string, '0', '文字列型 string');
		assert.strictEqual(row.c, 0, '色型 c');
		assert.strictEqual(row.color, 0, '色型 color');
		assert.strictEqual(row.colour, 0, '色型 colour');
		assert.equalTime(row.d, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 time');
		assert.strictEqual(row.n, 0, '数値型 n');
		assert.strictEqual(row.num, 0, '数値型 num');
		assert.strictEqual(row.number, 0, '数値型 number');
		assert.strictEqual(row.i, 0, '整数型 i');
		assert.strictEqual(row.int, 0, '整数型 int');
		assert.strictEqual(row.u, 0, '符号なし整数型 u');
		assert.strictEqual(row.uint, 0, '符号なし整数型 uint');
		assert.strictEqual(row.f, 0, '浮動小数点数型 f');
		assert.strictEqual(row.float, 0, '浮動小数点数型 float');
		assert.strictEqual(row.b, false, '論理値型 b');
		assert.strictEqual(row.bool, false, '論理値型 bool');
		assert.strictEqual(row.boolean, false, '論理値型 boolean');
		assert.deepEqual(row.a, ['0'], '配列型 a');
		assert.deepEqual(row.arr, ['0'], '配列型 arr');
		assert.deepEqual(row.ary, ['0'], '配列型 ary');
		assert.deepEqual(row.array, ['0'], '配列型 array');
	});

	it('1', function () {
		var row = json.suite[2];
		assert.strictEqual(row.empty, 1, '型未定義');
		assert.strictEqual(row.s, '1', '文字列型 s');
		assert.strictEqual(row.str, '1', '文字列型 str');
		assert.strictEqual(row.string, '1', '文字列型 string');
		assert.strictEqual(row.c, 1, '色型 c');
		assert.strictEqual(row.color, 1, '色型 color');
		assert.strictEqual(row.colour, 1, '色型 colour');
		assert.equalTime(row.d, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 time');
		assert.strictEqual(row.n, 1, '数値型 n');
		assert.strictEqual(row.num, 1, '数値型 num');
		assert.strictEqual(row.number, 1, '数値型 number');
		assert.strictEqual(row.i, 1, '整数型 i');
		assert.strictEqual(row.int, 1, '整数型 int');
		assert.strictEqual(row.u, 1, '符号なし整数型 u');
		assert.strictEqual(row.uint, 1, '符号なし整数型 uint');
		assert.strictEqual(row.f, 1, '浮動小数点数型 f');
		assert.strictEqual(row.float, 1, '浮動小数点数型 float');
		assert.strictEqual(row.b, true, '論理値型 b');
		assert.strictEqual(row.bool, true, '論理値型 bool');
		assert.strictEqual(row.boolean, true, '論理値型 boolean');
		assert.deepEqual(row.a, ['1'], '配列型 a');
		assert.deepEqual(row.arr, ['1'], '配列型 arr');
		assert.deepEqual(row.ary, ['1'], '配列型 ary');
		assert.deepEqual(row.array, ['1'], '配列型 array');
	});
	
	it('3.141592', function () {
		var row = json.suite[3];
		assert.strictEqual(row.empty, 3.141592, '型未定義');
		assert.strictEqual(row.s, '3.141592', '文字列型 s');
		assert.strictEqual(row.str, '3.141592', '文字列型 str');
		assert.strictEqual(row.string, '3.141592', '文字列型 string');
		assert.strictEqual(row.c, 3, '色型 c');
		assert.strictEqual(row.color, 3, '色型 color');
		assert.strictEqual(row.colour, 3, '色型 colour');
		assert.equalTime(row.d, new Date(1900, 0, 3, 3, 23, 53, 549), '日付型 d');
		assert.equalTime(row.date, new Date(1900, 0, 3, 3, 23, 53, 549), '日付型 date');
		assert.equalTime(row.t, new Date(1900, 0, 3, 3, 23, 53, 549), '日付型 t');
		assert.equalTime(row.time, new Date(1900, 0, 3, 3, 23, 53, 549), '日付型 time');
		assert.strictEqual(row.n, 3.141592, '数値型 n');
		assert.strictEqual(row.num, 3.141592, '数値型 num');
		assert.strictEqual(row.number, 3.141592, '数値型 number');
		assert.strictEqual(row.i, 3, '整数型 i');
		assert.strictEqual(row.int, 3, '整数型 int');
		assert.strictEqual(row.u, 3, '符号なし整数型 u');
		assert.strictEqual(row.uint, 3, '符号なし整数型 uint');
		assert.strictEqual(row.f, 3.141592, '浮動小数点数型 f');
		assert.strictEqual(row.float, 3.141592, '浮動小数点数型 float');
		assert.strictEqual(row.b, true, '論理値型 b');
		assert.strictEqual(row.bool, true, '論理値型 bool');
		assert.strictEqual(row.boolean, true, '論理値型 boolean');
		assert.deepEqual(row.a, ['3.141592'], '配列型 a');
		assert.deepEqual(row.arr, ['3.141592'], '配列型 arr');
		assert.deepEqual(row.ary, ['3.141592'], '配列型 ary');
		assert.deepEqual(row.array, ['3.141592'], '配列型 array');
	});

	it('-2000', function () {
		var row = json.suite[4];
		assert.strictEqual(row.empty, -2000, '型未定義');
		assert.strictEqual(row.s, '-2000', '文字列型 s');
		assert.strictEqual(row.str, '-2000', '文字列型 str');
		assert.strictEqual(row.string, '-2000', '文字列型 string');
		assert.strictEqual(row.c, 0, '色型 c');
		assert.strictEqual(row.color, 0, '色型 color');
		assert.strictEqual(row.colour, 0, '色型 colour');
		assert.equalTime(row.d, new Date(1894, 6, 10, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1894, 6, 10, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1894, 6, 10, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1894, 6, 10, 0, 0, 0, 0), '日付型 time');
		assert.strictEqual(row.n, -2000, '数値型 n');
		assert.strictEqual(row.num, -2000, '数値型 num');
		assert.strictEqual(row.number, -2000, '数値型 number');
		assert.strictEqual(row.i, -2000, '整数型 i');
		assert.strictEqual(row.int, -2000, '整数型 int');
		assert.strictEqual(row.u, 0, '符号なし整数型 u');
		assert.strictEqual(row.uint, 0, '符号なし整数型 uint');
		assert.strictEqual(row.f, -2000, '浮動小数点数型 f');
		assert.strictEqual(row.float, -2000, '浮動小数点数型 float');
		assert.strictEqual(row.b, true, '論理値型 b');
		assert.strictEqual(row.bool, true, '論理値型 bool');
		assert.strictEqual(row.boolean, true, '論理値型 boolean');
		assert.deepEqual(row.a, ['-2000'], '配列型 a');
		assert.deepEqual(row.arr, ['-2000'], '配列型 arr');
		assert.deepEqual(row.ary, ['-2000'], '配列型 ary');
		assert.deepEqual(row.array, ['-2000'], '配列型 array');
	});

	it('a', function () {
		var row = json.suite[5];
		assert.strictEqual(row.empty, 'a', '型未定義');
		assert.strictEqual(row.s, 'a', '文字列型 s');
		assert.strictEqual(row.str, 'a', '文字列型 str');
		assert.strictEqual(row.string, 'a', '文字列型 string');
		assert.strictEqual(row.c, -1, '色型 c');
		assert.strictEqual(row.color, -1, '色型 color');
		assert.strictEqual(row.colour, -1, '色型 colour');
		assert.equalTime(row.d, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 time');
		assert.ok(isNaN(row.n), '数値型 n');
		assert.ok(isNaN(row.num), '数値型 num');
		assert.ok(isNaN(row.number), '数値型 number');
		assert.strictEqual(row.i, 0, '整数型 i');
		assert.strictEqual(row.int, 0, '整数型 int');
		assert.strictEqual(row.u, 0, '符号なし整数型 u');
		assert.strictEqual(row.uint, 0, '符号なし整数型 uint');
		assert.ok(isNaN(row.f), '浮動小数点数型 f');
		assert.ok(isNaN(row.float), '浮動小数点数型 float');
		assert.strictEqual(row.b, true, '論理値型 b');
		assert.strictEqual(row.bool, true, '論理値型 bool');
		assert.strictEqual(row.boolean, true, '論理値型 boolean');
		assert.deepEqual(row.a, ['a'], '配列型 a');
		assert.deepEqual(row.arr, ['a'], '配列型 arr');
		assert.deepEqual(row.ary, ['a'], '配列型 ary');
		assert.deepEqual(row.array, ['a'], '配列型 array');
	});

	it('あ', function () {
		var row = json.suite[6];
		assert.strictEqual(row.empty, 'あ', '型未定義');
		assert.strictEqual(row.s, 'あ', '文字列型 s');
		assert.strictEqual(row.str, 'あ', '文字列型 str');
		assert.strictEqual(row.string, 'あ', '文字列型 string');
		assert.strictEqual(row.c, -1, '色型 c');
		assert.strictEqual(row.color, -1, '色型 color');
		assert.strictEqual(row.colour, -1, '色型 colour');
		assert.equalTime(row.d, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 time');
		assert.ok(isNaN(row.n), '数値型 n');
		assert.ok(isNaN(row.num), '数値型 num');
		assert.ok(isNaN(row.number), '数値型 number');
		assert.strictEqual(row.i, 0, '整数型 i');
		assert.strictEqual(row.int, 0, '整数型 int');
		assert.strictEqual(row.u, 0, '符号なし整数型 u');
		assert.strictEqual(row.uint, 0, '符号なし整数型 uint');
		assert.ok(isNaN(row.f), '浮動小数点数型 f');
		assert.ok(isNaN(row.float), '浮動小数点数型 float');
		assert.strictEqual(row.b, true, '論理値型 b');
		assert.strictEqual(row.bool, true, '論理値型 bool');
		assert.strictEqual(row.boolean, true, '論理値型 boolean');
		assert.deepEqual(row.a, ['あ'], '配列型 a');
		assert.deepEqual(row.arr, ['あ'], '配列型 arr');
		assert.deepEqual(row.ary, ['あ'], '配列型 ary');
		assert.deepEqual(row.array, ['あ'], '配列型 array');
	});

	it('😁', function () {
		var row = json.suite[7];
		assert.strictEqual(row.empty, '😁', '型未定義');
		assert.strictEqual(row.s, '😁', '文字列型 s');
		assert.strictEqual(row.str, '😁', '文字列型 str');
		assert.strictEqual(row.string, '😁', '文字列型 string');
		assert.strictEqual(row.c, -1, '色型 c');
		assert.strictEqual(row.color, -1, '色型 color');
		assert.strictEqual(row.colour, -1, '色型 colour');
		assert.equalTime(row.d, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 time');
		assert.ok(isNaN(row.n), '数値型 n');
		assert.ok(isNaN(row.num), '数値型 num');
		assert.ok(isNaN(row.number), '数値型 number');
		assert.strictEqual(row.i, 0, '整数型 i');
		assert.strictEqual(row.int, 0, '整数型 int');
		assert.strictEqual(row.u, 0, '符号なし整数型 u');
		assert.strictEqual(row.uint, 0, '符号なし整数型 uint');
		assert.ok(isNaN(row.f), '浮動小数点数型 f');
		assert.ok(isNaN(row.float), '浮動小数点数型 float');
		assert.strictEqual(row.b, true, '論理値型 b');
		assert.strictEqual(row.bool, true, '論理値型 bool');
		assert.strictEqual(row.boolean, true, '論理値型 boolean');
		assert.deepEqual(row.a, ['😁'], '配列型 a');
		assert.deepEqual(row.arr, ['😁'], '配列型 arr');
		assert.deepEqual(row.ary, ['😁'], '配列型 ary');
		assert.deepEqual(row.array, ['😁'], '配列型 array');
	});

	it('true', function () {
		var row = json.suite[8];
		assert.strictEqual(row.empty, true, '型未定義');
		assert.strictEqual(row.s, 'TRUE', '文字列型 s');
		assert.strictEqual(row.str, 'TRUE', '文字列型 str');
		assert.strictEqual(row.string, 'TRUE', '文字列型 string');
		assert.strictEqual(row.c, -1, '色型 c');
		assert.strictEqual(row.color, -1, '色型 color');
		assert.strictEqual(row.colour, -1, '色型 colour');
		assert.equalTime(row.d, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 time');
		assert.strictEqual(row.n, 1, '数値型 n');
		assert.strictEqual(row.num, 1, '数値型 num');
		assert.strictEqual(row.number, 1, '数値型 number');
		assert.strictEqual(row.i, 1, '整数型 i');
		assert.strictEqual(row.int, 1, '整数型 int');
		assert.strictEqual(row.u, 1, '符号なし整数型 u');
		assert.strictEqual(row.uint, 1, '符号なし整数型 uint');
		assert.strictEqual(row.f, 1, '浮動小数点数型 f');
		assert.strictEqual(row.float, 1, '浮動小数点数型 float');
		assert.strictEqual(row.b, true, '論理値型 b');
		assert.strictEqual(row.bool, true, '論理値型 bool');
		assert.strictEqual(row.boolean, true, '論理値型 boolean');
		assert.deepEqual(row.a, ['TRUE'], '配列型 a');
		assert.deepEqual(row.arr, ['TRUE'], '配列型 arr');
		assert.deepEqual(row.ary, ['TRUE'], '配列型 ary');
		assert.deepEqual(row.array, ['TRUE'], '配列型 array');
	});

	it('false', function () {
		var row = json.suite[9];
		assert.strictEqual(row.empty, false, '型未定義');
		assert.strictEqual(row.s, 'FALSE', '文字列型 s');
		assert.strictEqual(row.str, 'FALSE', '文字列型 str');
		assert.strictEqual(row.string, 'FALSE', '文字列型 string');
		assert.strictEqual(row.c, -1, '色型 c');
		assert.strictEqual(row.color, -1, '色型 color');
		assert.strictEqual(row.colour, -1, '色型 colour');
		assert.equalTime(row.d, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 time');
		assert.strictEqual(row.n, 0, '数値型 n');
		assert.strictEqual(row.num, 0, '数値型 num');
		assert.strictEqual(row.number, 0, '数値型 number');
		assert.strictEqual(row.i, 0, '整数型 i');
		assert.strictEqual(row.int, 0, '整数型 int');
		assert.strictEqual(row.u, 0, '符号なし整数型 u');
		assert.strictEqual(row.uint, 0, '符号なし整数型 uint');
		assert.strictEqual(row.f, 0, '浮動小数点数型 f');
		assert.strictEqual(row.float, 0, '浮動小数点数型 float');
		assert.strictEqual(row.b, false, '論理値型 b');
		assert.strictEqual(row.bool, false, '論理値型 bool');
		assert.strictEqual(row.boolean, false, '論理値型 boolean');
		assert.deepEqual(row.a, ['FALSE'], '配列型 a');
		assert.deepEqual(row.arr, ['FALSE'], '配列型 arr');
		assert.deepEqual(row.ary, ['FALSE'], '配列型 ary');
		assert.deepEqual(row.array, ['FALSE'], '配列型 array');
	});

	it('#f00', function () {
		var row = json.suite[10];
		assert.strictEqual(row.empty, '#f00', '型未定義');
		assert.strictEqual(row.s, '#f00', '文字列型 s');
		assert.strictEqual(row.str, '#f00', '文字列型 str');
		assert.strictEqual(row.string, '#f00', '文字列型 string');
		assert.strictEqual(row.c, 0xFF0000, '色型 c');
		assert.strictEqual(row.color, 0xFF0000, '色型 color');
		assert.strictEqual(row.colour, 0xFF0000, '色型 colour');
		assert.equalTime(row.d, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 time');
		assert.ok(isNaN(row.n), '数値型 n');
		assert.ok(isNaN(row.num), '数値型 num');
		assert.ok(isNaN(row.number), '数値型 number');
		assert.strictEqual(row.i, 0, '整数型 i');
		assert.strictEqual(row.int, 0, '整数型 int');
		assert.strictEqual(row.u, 0, '符号なし整数型 u');
		assert.strictEqual(row.uint, 0, '符号なし整数型 uint');
		assert.ok(isNaN(row.f), '浮動小数点数型 f');
		assert.ok(isNaN(row.float), '浮動小数点数型 float');
		assert.strictEqual(row.b, true, '論理値型 b');
		assert.strictEqual(row.bool, true, '論理値型 bool');
		assert.strictEqual(row.boolean, true, '論理値型 boolean');
		assert.deepEqual(row.a, ['#f00'], '配列型 a');
		assert.deepEqual(row.arr, ['#f00'], '配列型 arr');
		assert.deepEqual(row.ary, ['#f00'], '配列型 ary');
		assert.deepEqual(row.array, ['#f00'], '配列型 array');
	});

	it('#ff0000', function () {
		var row = json.suite[11];
		assert.strictEqual(row.empty, '#ff0000', '型未定義');
		assert.strictEqual(row.s, '#ff0000', '文字列型 s');
		assert.strictEqual(row.str, '#ff0000', '文字列型 str');
		assert.strictEqual(row.string, '#ff0000', '文字列型 string');
		assert.strictEqual(row.c, 0xFF0000, '色型 c');
		assert.strictEqual(row.color, 0xFF0000, '色型 color');
		assert.strictEqual(row.colour, 0xFF0000, '色型 colour');
		assert.equalTime(row.d, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 time');
		assert.ok(isNaN(row.n), '数値型 n');
		assert.ok(isNaN(row.num), '数値型 num');
		assert.ok(isNaN(row.number), '数値型 number');
		assert.strictEqual(row.i, 0, '整数型 i');
		assert.strictEqual(row.int, 0, '整数型 int');
		assert.strictEqual(row.u, 0, '符号なし整数型 u');
		assert.strictEqual(row.uint, 0, '符号なし整数型 uint');
		assert.ok(isNaN(row.f), '浮動小数点数型 f');
		assert.ok(isNaN(row.float), '浮動小数点数型 float');
		assert.strictEqual(row.b, true, '論理値型 b');
		assert.strictEqual(row.bool, true, '論理値型 bool');
		assert.strictEqual(row.boolean, true, '論理値型 boolean');
		assert.deepEqual(row.a, ['#ff0000'], '配列型 a');
		assert.deepEqual(row.arr, ['#ff0000'], '配列型 arr');
		assert.deepEqual(row.ary, ['#ff0000'], '配列型 ary');
		assert.deepEqual(row.array, ['#ff0000'], '配列型 array');
	});

	it('赤', function () {
		var row = json.suite[12];
		assert.strictEqual(row.empty, '赤', '型未定義');
		assert.strictEqual(row.s, '赤', '文字列型 s');
		assert.strictEqual(row.str, '赤', '文字列型 str');
		assert.strictEqual(row.string, '赤', '文字列型 string');
		// assert.strictEqual(row.c, 0xFF0000, '色型 c');
		// assert.strictEqual(row.color, 0xFF0000, '色型 color');
		// assert.strictEqual(row.colour, 0xFF0000, '色型 colour');
		assert.strictEqual(row.c, -1, '色型 c');
		assert.strictEqual(row.color, -1, '色型 color');
		assert.strictEqual(row.colour, -1, '色型 colour');
		assert.equalTime(row.d, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1899, 11, 31, 0, 0, 0, 0), '日付型 time');
		assert.ok(isNaN(row.n), '数値型 n');
		assert.ok(isNaN(row.num), '数値型 num');
		assert.ok(isNaN(row.number), '数値型 number');
		assert.strictEqual(row.i, 0, '整数型 i');
		assert.strictEqual(row.int, 0, '整数型 int');
		assert.strictEqual(row.u, 0, '符号なし整数型 u');
		assert.strictEqual(row.uint, 0, '符号なし整数型 uint');
		assert.ok(isNaN(row.f), '浮動小数点数型 f');
		assert.ok(isNaN(row.float), '浮動小数点数型 float');
		assert.strictEqual(row.b, true, '論理値型 b');
		assert.strictEqual(row.bool, true, '論理値型 bool');
		assert.strictEqual(row.boolean, true, '論理値型 boolean');
		assert.deepEqual(row.a, ['赤'], '配列型 a');
		assert.deepEqual(row.arr, ['赤'], '配列型 arr');
		assert.deepEqual(row.ary, ['赤'], '配列型 ary');
		assert.deepEqual(row.array, ['赤'], '配列型 array');
	});

	it('1900/1/1 0:00', function () {
		var row = json.suite[13];
		assert.strictEqual(row.empty, '1900/1/1 0:00', '型未定義');
		assert.strictEqual(row.s, '1900/1/1 0:00', '文字列型 s');
		assert.strictEqual(row.str, '1900/1/1 0:00', '文字列型 str');
		assert.strictEqual(row.string, '1900/1/1 0:00', '文字列型 string');
		assert.strictEqual(row.c, 1, '色型 c');
		assert.strictEqual(row.color, 1, '色型 color');
		assert.strictEqual(row.colour, 1, '色型 colour');
		assert.equalTime(row.d, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 d');
		assert.equalTime(row.date, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 date');
		assert.equalTime(row.t, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 t');
		assert.equalTime(row.time, new Date(1900, 0, 1, 0, 0, 0, 0), '日付型 time');
		assert.strictEqual(row.n, 1, '数値型 n');
		assert.strictEqual(row.num, 1, '数値型 num');
		assert.strictEqual(row.number, 1, '数値型 number');
		assert.strictEqual(row.i, 1, '整数型 i');
		assert.strictEqual(row.int, 1, '整数型 int');
		assert.strictEqual(row.u, 1, '符号なし整数型 u');
		assert.strictEqual(row.uint, 1, '符号なし整数型 uint');
		assert.strictEqual(row.f, 1, '浮動小数点数型 f');
		assert.strictEqual(row.float, 1, '浮動小数点数型 float');
		assert.strictEqual(row.b, true, '論理値型 b');
		assert.strictEqual(row.bool, true, '論理値型 bool');
		assert.strictEqual(row.boolean, true, '論理値型 boolean');
		assert.deepEqual(row.a, ['1900/1/1 0:00'], '配列型 a');
		assert.deepEqual(row.arr, ['1900/1/1 0:00'], '配列型 arr');
		assert.deepEqual(row.ary, ['1900/1/1 0:00'], '配列型 ary');
		assert.deepEqual(row.array, ['1900/1/1 0:00'], '配列型 array');
	});

});


