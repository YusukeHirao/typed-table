import fs = require('fs');
import path = require('path');
import inflection = require('inflection');
import xlsx = require('xlsx');

export function readExcel (xlsxFilePath: string, rowOption: IRowOption): TableCollection {
	var tables: TableCollection = new TableCollection;
	
	var filePath: string;
	if (path.isAbsolute(xlsxFilePath)) {
		filePath = xlsxFilePath;
	} else {
		filePath = path.normalize(path.join(process.cwd(), path.dirname(process.argv[process.argv.length - 1]), xlsxFilePath));
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
		let table: Table = new Table(xlsxFile.Sheets[name], rowOption);
		tables.add(name, table);
	}
	
	return tables;
}

export class TableCollection {
	
	private _items: Table[] = [];
	private _names: string[] = [];

	constructor () {
	}
	
	public add (name: string, table: Table): void {
		this._items.push(table);
		this._names.push(name);
	}
	
	public item (index: string | number): Table {
		var refIndex: number;
		if (typeof index === 'string') {
			let name: string = index;
			refIndex = this._names.indexOf(name);
		} else {
			refIndex = index;
		}
		return this._items[refIndex] || null;
	}
	
	public each (callback: (table: Table, name: string, index: number) => void): void {
		for (let i: number = 0, l: number = this._items.length; i < l; i++) {
			let table: Table = this._items[i];
			let name: string = this._names[i];
			callback.call(this, table, name, i);
		}
	}

	public toJSON (): any {
		var result: any = {};
		this.each( (table: Table, name: string, index: number): void => {
			result[name] = table.toJSON();
		});
		return result;
	}
	
	public toJSONStringify (replacer: any[] = null, space: string = '\t'): string {
		return JSON.stringify(this.toJSON(), replacer, space);
	}
	
	public saveJSON (fileName: string, space: string = '\t'): void {
		var filePath: string = path.normalize(path.join(process.cwd(), path.dirname(process.argv[process.argv.length - 1]), fileName));
		fs.writeFileSync(filePath, this.toJSONStringify());
	}

}

export class Table {

	private _range: Range;
	private _rows: ValueCell[][] = [];
	private _header: MetaCell[] = [];
	private _types: TypeCell[] = [];

	constructor (sheetData: xlsx.XLSXSheet, rowOption: IRowOption = {}) {
		
		// TODO: メタ情報は値より若い行になければならないことを保証する
		var rowNumLabel: number = rowOption.label !== undefined ? rowOption.label : 0;
		var rowNumHeader: number = rowOption.header !== undefined ? rowOption.header : 1;
		var rowNumType: number = rowOption.type !== undefined ? rowOption.type : 2;
		var rowNumDescription: number = rowOption.description !== undefined ? rowOption.description : null;

		this._range = new Range(sheetData['!ref']);

		let r: number = this._range.startNRow;
		let rl: number = this._range.endNRow;
		
		while (r <= rl) {
			let c: number = this._range.startNCol;
			let cl: number = this._range.endNCol;
			let cols: Cell[] = [];
			let rowNum: number = r - 1;
			let cellRole: CellRole;
			switch (rowNum) {
				case rowNumLabel: {
					cellRole = CellRole.LABEL;
					break;
				}
				case rowNumHeader: {
					cellRole = CellRole.HEADER;
					break;
				}
				case rowNumType: {
					cellRole = CellRole.TYPE;
					break;
				}
				case rowNumDescription: {
					cellRole = CellRole.DESCRIPTION;
					break;
				}
				default: {
					cellRole = CellRole.VALUE;
				}
			}
			while (c <= cl) {
				let id: string = `${_getColFormNumber(c)}${r}`;
				let cellData: xlsx.XLSXCell = <xlsx.XLSXCell> sheetData[id];
				let cell: Cell;
				if (cellData) {
					switch (cellRole) {
						case CellRole.VALUE: {
							let type: CellType = this._types[c].type;
							cell = new ValueCell(cellData, id, type);
							break;
						}
						case CellRole.TYPE: {
							cell = new TypeCell(cellData, id);
							break;
						}
						default: {
							cell = new MetaCell(cellData, id);
						}
					}
				} else {
					cell = null;
				}
				cols[c] = cell;
				c++;
			}
			switch (rowNum) {
				case rowNumLabel:
				case rowNumDescription: {
					break;
				}
				case rowNumHeader: {
					this._header = <MetaCell[]> cols;
					break;
				}
				case rowNumType: {
					this._types = <TypeCell[]> cols;
					break;
				}
				default: {
					this._rows.push(<ValueCell[]> cols);
				}
			}
			r++;
		}

	}
	
	public toJSON (): any[] {
		var data: any[] = [];
		var allNullFlag: boolean = true;
		
		for (let i: number = 0, l: number = this._rows.length; i < l; i++) {
			let row: ValueCell[] = this._rows[i];
			let cellValues: any = {};
			for (let i: number = 0, l: number = row.length; i < l; i++) {
				let cell: ValueCell = row[i];
				let headerName: string;
				let value: string | number | boolean | Date | string[];
				if (this._header[i]) {
					headerName = this._header[i].value;
				}
				if (!headerName) {
					continue;
				}
				if (cell) {
					value = cell.value;
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
	
	public toJSONStringify (replacer: any[] = null, space: string = '\t'): string {
		return JSON.stringify(this.toJSON(), replacer, space);
	}

}

enum CellRole {
	VALUE,
	LABEL,
	HEADER,
	TYPE,
	DESCRIPTION
}

enum CellType {
	STRING,
	NUMBER,
	BOOLEAN,
	DATE,
	COLOR,
	INTEGER,
	UNSIGNED_INTEGER,
	ARRAY,
	ERROR,
	UNKNOWN,
}

export interface IRowOption {
	label?: number;
	header?: number;
	type?: number;
	description?: number;
}

class Cell {
	protected _raw: any;
	protected _val: any;
	public id: string;
	
	constructor (xlsxCell: xlsx.XLSXCell, id: string) {
		this._raw = xlsxCell.v;
		this._val = xlsxCell.w;
		this.id = id;
	}
}

class MetaCell extends Cell {
	public value: string;
	constructor (xlsxCell: xlsx.XLSXCell, id: string) {
		super(xlsxCell, id);
		this.value = `${this._val}`.trim();
	}
}

class TypeCell extends MetaCell {
	public type: CellType;

	static parseType (type: string): CellType {
		var result: CellType;
		switch (type) {
			case 'c':
			case 'color':
			case 'colour': {
				result = CellType.COLOR;
				break;
			}
			case 'd':
			case 'date':
			case 't':
			case 'time': {
				result = CellType.DATE;
				break;
			}
			case 'a':
			case 'arr':
			case 'ary':
			case 'array': {
				result = CellType.ARRAY;
				break;
			}
			case 'b':
			case 'bool':
			case 'boolean': {
				result = CellType.BOOLEAN;
				break;
			}
			case 'i':
			case 'int':
			case 'integer': {
				result = CellType.INTEGER;
				break;
			}
			case 'u':
			case 'uint': {
				result = CellType.UNSIGNED_INTEGER;
				break;
			}
			case 'f':
			case 'float':
			case 'n':
			case 'num':
			case 'number': {
				result = CellType.NUMBER;
				break;
			}
			case 's':
			case 'str':
			case 'string': {
				result = CellType.STRING;
				break;
			}
			case 'e': {
				result = CellType.ERROR;
				break;
			}
			default: {
				result = CellType.UNKNOWN;
			}
		}
		return result;
	}

	constructor (xlsxCell: xlsx.XLSXCell, id: string) {
		super(xlsxCell, id);
		this.type = TypeCell.parseType(this.value);
	}
}

class ValueCell extends Cell {

	static XLSX_DATE_OFFSET = 25568;

	public value: any;
	public type: CellType;
	public numberFormat: string;
	public color: number = 0x000000;
	public bgColor: number = -1;

	constructor (xlsxCell: xlsx.XLSXCell, id: string, type: CellType) {
		
		super(xlsxCell, id);

		var xlsxCellType: CellType = TypeCell.parseType(xlsxCell.t);
		this.numberFormat = xlsxCell.z;

		if (type === CellType.UNKNOWN) {
			if (this.numberFormat !== 'General') {
				this.type = CellType.STRING; 
			} else {
				this.type = xlsxCellType;
			}
		} else {
			this.type = type;
		}
		
		var origin: any;
		if (this.type === CellType.STRING || this.type === CellType.ARRAY) {
			origin = this._val;
		} else {
			origin = this._raw;
		}
		
		this._convert(origin);
		
	}
	
	private _convert (origin: any): void {

		var value: any;

		switch (this.type) {
			case CellType.COLOR: {
				let numericValue = parseFloat(origin);
				if (!isNaN(numericValue)) {
					value = numericValue > 0 ? numericValue >= 0xFFFFFF ? 0xFFFFFF : Math.floor(numericValue) : 0;
				} else if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(origin)) {
					value = _colorCodeToNumber(origin);
				} else {
					value = this.bgColor;
				}
				break;
			}
			case CellType.DATE: {
				let timezone: number = new Date().getTimezoneOffset();
				let days: number = (+origin || 0) - ValueCell.XLSX_DATE_OFFSET;
				let timestamp: number = (days * 24 * 60 + timezone) * 60 * 1000;
				value = new Date(timestamp);
				break;
			}
			case CellType.ARRAY: {
				if (origin === undefined) {
					value = [];
					break;
				}
				let values: string[] = `${origin}`.split(',');
				value = values.map<string>( (item: string, i: number): string => {
					return item.trim();
				});
				break;
			}
			case CellType.BOOLEAN: {
				value = !!origin;
				break;
			}
			case CellType.INTEGER: {
				let numeric: number = +origin;
				let interger: number = Math.floor(numeric);
				value = interger || 0;
				break;
			}
			case CellType.UNSIGNED_INTEGER: {
				let numeric: number = +origin;
				let interger: number = Math.floor(numeric);
				value = interger > 0 ? interger : 0;
				break;
			}
			case CellType.NUMBER: {
				value = +origin;
				break;
			}
			case CellType.STRING: {
				value = origin !== undefined ? `${origin}` : '';
				break;
			}
			case CellType.ERROR: {
				console.warn('Error cell');
				value = null;
				break;
			}
			default: {
				value = origin !== undefined ? origin : '';
			}
		}
		
		this.value = value;
	}
	
	public toString (): string {
		return `${this.valueOf()}`;
	}
	
	public valueOf (): any {
		switch (this.type) {
			case CellType.STRING: {
				return `${this.value}`;
			}
			case CellType.NUMBER: {
				return parseFloat(this.value);
			}
			case CellType.BOOLEAN: {
				return !!this.value;
			}
			case CellType.DATE: {
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

	constructor (ref = 'A0:A0') {

		var refSplit: RegExpExecArray = /^([a-z]+)([0-9]+):([a-z]+)([0-9]+)/ig.exec(ref);

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
	if (code.length === 4) {
		code = code.replace(/^#(.)(.)(.)$/ig, '#$1$1$2$2$3$3');
	}
	return parseInt(code.replace('#', ''), 16);
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
