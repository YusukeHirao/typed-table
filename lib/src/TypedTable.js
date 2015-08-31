var fs = require('fs');
var path = require('path');
var inflection = require('inflection');
var xlsx = require('xlsx');
function readExcel(xlsxFilePath, rowOption) {
    var tables = new TableCollection;
    var filePath;
    if (path.isAbsolute(xlsxFilePath)) {
        filePath = xlsxFilePath;
    }
    else {
        filePath = path.normalize(path.join(process.cwd(), path.dirname(process.argv[process.argv.length - 1]), xlsxFilePath));
    }
    var xlsxFile = xlsx.readFile(filePath, {
        cellFormula: true,
        cellHTML: true,
        cellNF: true,
        callStyles: true,
        cellDates: true,
        sheetStubs: true
    });
    for (var i = 0, l = xlsxFile.SheetNames.length; i < l; i++) {
        var name_1 = xlsxFile.SheetNames[i];
        var table = new Table(xlsxFile.Sheets[name_1], rowOption);
        tables.add(name_1, table);
    }
    return tables;
}
exports.readExcel = readExcel;
var TableCollection = (function () {
    function TableCollection() {
        this._items = [];
        this._names = [];
    }
    TableCollection.prototype.add = function (name, table) {
        this._items.push(table);
        this._names.push(name);
    };
    TableCollection.prototype.item = function (index) {
        var refIndex;
        if (typeof index === 'string') {
            var name_2 = index;
            refIndex = this._names.indexOf(name_2);
        }
        else {
            refIndex = index;
        }
        return this._items[refIndex] || null;
    };
    TableCollection.prototype.each = function (callback) {
        for (var i = 0, l = this._items.length; i < l; i++) {
            var table = this._items[i];
            var name_3 = this._names[i];
            callback.call(this, table, name_3, i);
        }
    };
    TableCollection.prototype.toJSON = function () {
        var result = {};
        this.each(function (table, name, index) {
            result[name] = table.toJSON();
        });
        return result;
    };
    TableCollection.prototype.toJSONStringify = function (replacer, space) {
        if (replacer === void 0) { replacer = null; }
        if (space === void 0) { space = '\t'; }
        return JSON.stringify(this.toJSON(), replacer, space);
    };
    TableCollection.prototype.saveJSON = function (fileName, space) {
        if (space === void 0) { space = '\t'; }
        var filePath = path.normalize(path.join(process.cwd(), path.dirname(process.argv[process.argv.length - 1]), fileName));
        fs.writeFileSync(filePath, this.toJSONStringify());
    };
    return TableCollection;
})();
exports.TableCollection = TableCollection;
var Table = (function () {
    function Table(sheetData, rowOption) {
        if (rowOption === void 0) { rowOption = {}; }
        this._rows = [];
        this._header = [];
        this._types = [];
        var rowNumLabel = rowOption.label !== undefined ? rowOption.label : 0;
        var rowNumHeader = rowOption.header !== undefined ? rowOption.header : 1;
        var rowNumType = rowOption.type !== undefined ? rowOption.type : 2;
        var rowNumDescription = rowOption.description !== undefined ? rowOption.description : null;
        this._range = new Range(sheetData['!ref']);
        var r = this._range.startNRow;
        var rl = this._range.endNRow;
        while (r <= rl) {
            var c = this._range.startNCol;
            var cl = this._range.endNCol;
            var cols = [];
            var rowNum = r - 1;
            while (c <= cl) {
                var id = "" + _getColFormNumber(c) + r;
                var cellData = sheetData[id];
                var cell = void 0;
                if (cellData) {
                    cell = new Cell(cellData, id);
                }
                else {
                    cell = null;
                }
                cols[c] = cell;
                c++;
            }
            switch (rowNum) {
                case rowNumLabel:
                case rowNumDescription: {
                    continue;
                }
                case rowNumHeader: {
                    this._header = cols;
                    break;
                }
                case rowNumType: {
                    this._types = cols;
                    break;
                }
                default: {
                    this._rows[rowNum] = cols;
                }
            }
            r++;
        }
    }
    Table.prototype.toJSON = function () {
        var data = [];
        var allNullFlag = true;
        for (var i = 0, l = this._rows.length; i < l; i++) {
            var row = this._rows[i];
            var cellValues = {};
            for (var i_1 = 0, l_1 = row.length; i_1 < l_1; i_1++) {
                var cell = row[i_1];
                var headerName = void 0;
                var type = void 0;
                var value = void 0;
                if (this._header[i_1]) {
                    headerName = this._header[i_1].value;
                }
                if (this._types[i_1]) {
                    type = ("" + this._types[i_1].value).toLowerCase();
                }
                if (!headerName) {
                    continue;
                }
                if (cell) {
                    value = cell.convertFromType(type);
                }
                else {
                    value = null;
                }
                // 「.」ドット繋ぎのツリー型
                if (headerName.match(/^[a-z][a-z0-9_-]+\./ig)) {
                    var splitName = headerName.split('.');
                    var parentName = inflection.pluralize(splitName[0]);
                    var childName = splitName[1];
                    if (!cellValues[parentName]) {
                        cellValues[parentName] = {};
                    }
                    cellValues[parentName][childName] = value;
                }
                else {
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
    };
    Table.prototype.toJSONStringify = function (replacer, space) {
        if (replacer === void 0) { replacer = null; }
        if (space === void 0) { space = '\t'; }
        return JSON.stringify(this.toJSON(), replacer, space);
    };
    return Table;
})();
exports.Table = Table;
var Sheet = (function () {
    function Sheet(sheetData) {
        this.rows = [];
        this.range = new Range(sheetData['!ref']);
        var r = this.range.startNRow;
        var rl = this.range.endNRow;
        while (r <= rl) {
            var c = this.range.startNCol;
            var cl = this.range.endNCol;
            var cols = [];
            while (c <= cl) {
                var id = "" + _getColFormNumber(c) + r;
                var cellData = sheetData[id];
                var cell = void 0;
                if (cellData) {
                    cell = new Cell(cellData, id);
                }
                else {
                    cell = null;
                }
                cols[c] = cell;
                c++;
            }
            this.rows[r - 1] = cols;
            r++;
        }
    }
    return Sheet;
})();
var Cell = (function () {
    function Cell(xlsxCell, id) {
        this.color = 0x000000;
        this.bgColor = -1;
        this._raw = xlsxCell.v;
        this._val = xlsxCell.w;
        this.type = xlsxCell.t;
        this.numberFormat = xlsxCell.z;
        this.value = this.convertFromType();
        this.id = id;
    }
    Cell.prototype.convertFromType = function (type) {
        var value;
        var origin;
        if (type === undefined || type === '') {
            type = this.type || 'stub';
        }
        if (this.numberFormat === 'General') {
            origin = this._raw;
        }
        else {
            origin = this._val;
            if (this.type === 'n') {
                type = 's';
            }
        }
        switch (type) {
            case 'c':
            case 'color':
            case 'colour': {
                var numericValue = parseFloat(origin);
                if (!isNaN(numericValue)) {
                    value = numericValue > 0 ? numericValue >= 0xFFFFFF ? 0xFFFFFF : Math.floor(numericValue) : 0;
                }
                else if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(origin)) {
                    value = _colorCodeToNumber(origin);
                }
                else {
                    value = this.bgColor;
                }
                break;
            }
            case 'd':
            case 'date':
            case 't':
            case 'time': {
                value = new Date(((+origin - 25569) * 86400 * 1000) || 0);
                break;
            }
            case 'a':
            case 'arr':
            case 'ary':
            case 'array': {
                if (origin === undefined) {
                    return [];
                }
                var values = ("" + origin).split(',');
                value = values.map(function (item, i) {
                    return item.trim();
                });
                break;
            }
            case 'b':
            case 'bool':
            case 'boolean': {
                value = !!origin;
                break;
            }
            case 'i':
            case 'int': {
                var numeric = +origin;
                var interger = Math.floor(numeric);
                value = interger || 0;
                break;
            }
            case 'u':
            case 'uint': {
                var numeric = +origin;
                var interger = Math.floor(numeric);
                value = interger > 0 ? interger : 0;
                break;
            }
            case 'f':
            case 'float':
            case 'n':
            case 'num':
            case 'number': {
                value = +origin;
                break;
            }
            case 's':
            case 'str':
            case 'string': {
                value = origin !== undefined ? "" + origin : '';
                break;
            }
            case 'e': {
                console.warn('Error cell');
                value = null;
                break;
            }
            case 'stub': {
                value = '';
                break;
            }
            default: {
                value = origin;
            }
        }
        return value;
    };
    Cell.prototype.toString = function () {
        return "" + this.valueOf();
    };
    Cell.prototype.valueOf = function () {
        switch (this.type) {
            case 'string': {
                return "" + this.value;
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
    };
    return Cell;
})();
var Range = (function () {
    function Range(ref) {
        if (ref === void 0) { ref = 'A0:A0'; }
        this.startNCol = 0;
        this.startNRow = 0;
        this.endNCol = 0;
        this.endNRow = 0;
        var refSplit = /^([a-z]+)([0-9]+):([a-z]+)([0-9]+)/ig.exec(ref);
        this.startCol = refSplit[1];
        this.startRow = refSplit[2];
        this.endCol = refSplit[3];
        this.endRow = refSplit[4];
        this.startNCol = _getNumberOfCol(refSplit[1]);
        this.startNRow = +refSplit[2];
        this.endNCol = _getNumberOfCol(refSplit[3]);
        this.endNRow = +refSplit[4];
    }
    Range.prototype.toString = function () {
        return "" + this.startCol + this.startRow + ":" + this.endCol + this.endRow;
    };
    return Range;
})();
var _NAME_COLUMN_VALUES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
var _NAME_COLUMN_VALUES_LENGTH = _NAME_COLUMN_VALUES.length;
/**
 * アルファベット形式の列番号を数値に変換
 *
 */
function _getNumberOfCol(r1c1) {
    var num = 0;
    var chars = r1c1.toUpperCase().split('');
    for (var i = 0, l = chars.length; i < l; i++) {
        var c = chars[i];
        var n = _NAME_COLUMN_VALUES.indexOf(c);
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
function _colorCodeToNumber(code) {
    if (code.length === 4) {
        code = code.replace(/^#(.)(.)(.)$/ig, '#$1$1$2$2$3$3');
    }
    return parseInt(code.replace('#', ''), 16);
}
/**
 * 整数値の列番号をアルファベット形式に変換
 */
function _getColFormNumber(num) {
    var s = '';
    var col = 0;
    if (col > 0) {
        num--;
    }
    var mod = num % _NAME_COLUMN_VALUES_LENGTH;
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
