import fs = require('fs');
import path = require('path');
import inflection = require('inflection');
import xlsx = require('xlsx');

export function readExcel (xlsxFilePath: string, rowOption: IRowOption): Table[] {
	var tables: Table[] = [];
	
	var filePath: string;
	if (path.isAbsolute(xlsxFilePath)) {
		filePath = xlsxFilePath;
	} else {
		filePath = path.normalize(path.join(path.dirname(process.argv[1]), xlsxFilePath));
	}
	
	var xlsxFile: xlsx.XLSX = xlsx.readFile(filePath, {
		cellFormula: true,
		cellHTML: true,
		cellNF: true,
		callStyles: true,
		cellDates: true,
		sheetStubs: true
	});
	
	for (let i: number = 0, l: number = xlsxFile.SheetNames.length; i < l; i++) {
		let name: string = xlsxFile.SheetNames[i];
		let sheet: Sheet = new Sheet(xlsxFile.Sheets[name]);
		let table: Table = new Table(sheet.rows, rowOption);
		tables.push(table);
	}
	
	return tables;
}

export class Table {

	static CHAR_CODE_A = 64;
	static CHAR_CODE_Z = 90;

	private _rows: Cell[][] = [];
	private _header: Cell[] = [];
	private _types: Cell[] = [];

	constructor (rows: any[][], rowOption: IRowOption = {}) {
		
		var _rows: Cell[][] = <Cell[][]> rows;
		
		var rowNumLabel: number = rowOption.label !== undefined ? rowOption.label : 0;
		var rowNumHeader: number = rowOption.header !== undefined ? rowOption.header : 1;
		var rowNumType: number = rowOption.type !== undefined ? rowOption.type : 2;
		var rowNumDescription: number = rowOption.description !== undefined ? rowOption.description : null;
		
		var i: number = 0;
		var l: number = _rows.length;
		for (; i < l; i++) {
			let cols: Cell[] = _rows[i];
			switch (i) {
				case rowNumLabel:
				case rowNumDescription: {
					continue;
				}
				case rowNumHeader: {
					this._header = cols.slice(0);
					break;
				}
				case rowNumType: {
					this._types = cols.slice(0);
					break;
				}
				default: {
					this._rows.push(cols.slice(0));
				}
			}
			cols = null;
		}
		_rows = null;
		
	}
	
	public toJSON (): any[] {
		var data: any[] = [];
		var allNullFlag: boolean = true;
		
		for (let i: number = 0, l: number = this._rows.length; i < l; i++) {
			let row = this._rows[i];
			let cellValues = {};
			for (let i: number = 0, l: number = row.length; i < l; i++) {
				let cell: Cell = row[i];
				let headerName: string;
				let type: string = 'stub';
				let value: string | number | boolean | Date | string[];
				if (this._header[i]) {
					headerName = this._header[i].value;
				}
				if (this._types[i]) {
					type = `${this._types[i].value}`.toLowerCase() || 'stub';
				}
				if (!headerName) {
					continue;
				}
				if (cell) {
					value = cell.convertFromType(type);
				} else {
					value = null;
				}
				// 「.」ドット繋ぎのツリー型
				if (headerName.match(/^[a-z][a-z0-9_-]+\./ig)) {
					let splitName: string[] = headerName.split('.');
					let parentName: string = inflection.pluralize(splitName[0]);
					let childName: string = splitName[1];
					if (!cellValues[parentName]) {
						cellValues[parentName] = {};
					}
					cellValues[parentName][childName] = value;
				} else {
					cellValues[headerName] = value;
				}
				
				if (value !== null && allNullFlag) {
					allNullFlag = false;
				}
			}
			if (!allNullFlag) {
				data.push(cellValues);
			}
			allNullFlag = true;
		}
		
		return data;
	}
	
	public toJSONStringify (replacer?: any[], space: string = '\t'): string {
		return JSON.stringify(this.toJSON(), replacer, space);
	}

}

export interface IRowOption {
	label?: number;
	header?: number;
	type?: number;
	description?: number;
}
	
class Sheet {
	
	public range: Range;
	public rows: Cell[][] = [];
	
	constructor (sheetData: xlsx.XLSXSheet) {
		
		this.range = new Range(sheetData['!ref']);

		let r: number = this.range.startNRow;
		let rl: number = this.range.endNRow;
		
		while (r <= rl) {
			let c: number = this.range.startNCol;
			let cl: number = this.range.endNCol;
			let cols: Cell[] = [];
			while (c < cl) {
				let id: string = `${_getColFormNumber(c)}${r}`;
				let cellData: xlsx.XLSXCell = <xlsx.XLSXCell> sheetData[id];
				let cell: Cell;
				if (cellData) {
					cell = new Cell(cellData);
				} else {
					cell = null;
				}
				cols[c] = cell;
				c++;
			}
			this.rows[r - 1] = cols;
			r++;
		}
		
	}
	
}

class Cell {

	static typing (xlsxCell: xlsx.XLSXCell): string {
		return 'string';
	}

	private _raw: any = null;
	public value: any = null;
	public type: string = '';
	public numberFormat: string = '';
	public color: number = 0x000000;
	public bgColor: number = -1;

	constructor (xlsxCell: xlsx.XLSXCell) {
		
		this._raw = xlsxCell.v;
		this.type = xlsxCell.t;
		this.numberFormat = xlsxCell.z;
		
		this.value = this.convertFromType(this.type);

	}
	
	public convertFromType (type: string): any {

		var value: any;

		switch (type) {
			case 'stub': {
				value = '';
				break;
			}
			case 'c':
			case 'color':
			case 'colour': {
				if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(this._raw)) {
					value = _colorCodeToNumber(this._raw);
				} else {
					value = this.bgColor;
				}
				break;
			}
			case 'd':
			case 'date':
			case 't':
			case 'time': {
				value = new Date(((+this._raw - 25569) * 86400 * 1000) || 0);
				break;
			}
			case 'a':
			case 'arr':
			case 'ary':
			case 'array': {
				if (this._raw === undefined) {
					return [];
				}
				let values: string[] = `${this._raw}`.split(',');
				value = values.map<string>( (item: string, i: number): string => {
					return item.trim();
				});
				break;
			}
			case 'b':
			case 'bool':
			case 'boolean': {
				value = !!this._raw;
				break;
			}
			case 'i':
			case 'int': {
				value = isNaN(this._raw) ? 0 : parseInt(this._raw, 10);
				break;
			}
			case 'u':
			case 'uint': {
				value = this._raw > 0 ? parseInt(this._raw, 10) : 0;
				break;
			}
			case 'f':
			case 'float':
			case 'n':
			case 'number': {
				value = parseFloat(this._raw);
				break;
			}
			case 's':
			case 'str':
			case 'string': {
				value = this._raw !== undefined ? `${this._raw}` : '';
				break;
			}
			default: {
				// TODO: 型推論
				value = this._raw;
			}
		}
		
		return value;
	}
	
	public toString (): string {
		return `${this.valueOf()}`;
	}
	
	public valueOf (): any {
		switch (this.type) {
			case 'string': {
				return `${this.value}`;
			}
			case 'number': {
				return parseFloat(this.value);
			}
			case 'number': {
				return parseFloat(this.value);
			}
			case 'boolean': {
				return !!this.value;
			}
			case 'Date': {
				return new Date(parseFloat(this.value));
			}
		}
	}
	
}

class Range {
	
	public startCol: string;
	public startRow: string;
	public endCol: string;
	public endRow: string;

	public startNCol: number = 0;
	public startNRow: number = 0;
	public endNCol: number = 0;
	public endNRow: number = 0;

	public ref;

	constructor (ref) {

		var refSplit: RegExpExecArray =/^([a-z]+)([0-9]+):([a-z]+)([0-9]+)/ig.exec(ref);

		this.startCol = refSplit[1];
		this.startRow = refSplit[2];
		this.endCol = refSplit[3];
		this.endRow = refSplit[4];

		this.startNCol = _getNumberOfCol(refSplit[1]);
		this.startNRow = +refSplit[2];
		this.endNCol = _getNumberOfCol(refSplit[3]);
		this.endNRow = +refSplit[4];
		
	}

	public toString (): string {
		return `${this.startCol}${this.startRow}:${this.endCol}${this.endRow}`;
	}
}

const _NAME_COLUMN_VALUES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const _NAME_COLUMN_VALUES_LENGTH = _NAME_COLUMN_VALUES.length;
/**
 * アルファベット形式の列番号を数値に変換
 *  
 */
function _getNumberOfCol (r1c1: string): number {
	var num: number = 0;
	var chars: string[] = r1c1.toUpperCase().split('');
	for (let i: number = 0, l: number = chars.length; i < l; i++) {
		let c: string = chars[i];
		let n: number = _NAME_COLUMN_VALUES.indexOf(c)
		if (i < l - 1) {
			n = n + 1;
		}
		num = num * 26 + n;
	}
	return num;
}

/**
 * #RRGGBB形式のカラーコードを数値に変換する
 */
function _colorCodeToNumber(code: string): number {
	return parseInt(code.replace(/#/, ''), 16);
}

/**
 * 整数値の列番号をアルファベット形式に変換
 */
function _getColFormNumber (num: number): string {
	var s: string = '';
	var col: number = 0;
	if (col > 0) {
		num--;
	}
	var mod: number = num % _NAME_COLUMN_VALUES_LENGTH;
	s = _NAME_COLUMN_VALUES[mod] + s;
	num = Math.floor(num / _NAME_COLUMN_VALUES_LENGTH);
	col++;
	while (num > 0) {
		if (col > 0) {
			num--;
		}
		mod = num % _NAME_COLUMN_VALUES_LENGTH;
		s = _NAME_COLUMN_VALUES[mod] + s;
		num = Math.floor(num / _NAME_COLUMN_VALUES_LENGTH);
		col++;
	}
	return s;
}