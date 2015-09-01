var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
        // TODO: メタ情報は値より若い行になければならないことを保証する
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
            var cellRole = void 0;
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
                var id = "" + _getColFormNumber(c) + r;
                var cellData = sheetData[id];
                var cell = void 0;
                if (cellData) {
                    switch (cellRole) {
                        case CellRole.VALUE: {
                            var type = this._types[c].type;
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
                    break;
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
                    this._rows.push(cols);
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
                var value = void 0;
                if (this._header[i_1]) {
                    headerName = this._header[i_1].value;
                }
                if (!headerName) {
                    continue;
                }
                if (cell) {
                    value = cell.value;
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
var CellRole;
(function (CellRole) {
    CellRole[CellRole["VALUE"] = 0] = "VALUE";
    CellRole[CellRole["LABEL"] = 1] = "LABEL";
    CellRole[CellRole["HEADER"] = 2] = "HEADER";
    CellRole[CellRole["TYPE"] = 3] = "TYPE";
    CellRole[CellRole["DESCRIPTION"] = 4] = "DESCRIPTION";
})(CellRole || (CellRole = {}));
var CellType;
(function (CellType) {
    CellType[CellType["STRING"] = 0] = "STRING";
    CellType[CellType["NUMBER"] = 1] = "NUMBER";
    CellType[CellType["BOOLEAN"] = 2] = "BOOLEAN";
    CellType[CellType["DATE"] = 3] = "DATE";
    CellType[CellType["COLOR"] = 4] = "COLOR";
    CellType[CellType["INTEGER"] = 5] = "INTEGER";
    CellType[CellType["UNSIGNED_INTEGER"] = 6] = "UNSIGNED_INTEGER";
    CellType[CellType["ARRAY"] = 7] = "ARRAY";
    CellType[CellType["ERROR"] = 8] = "ERROR";
    CellType[CellType["UNKNOWN"] = 9] = "UNKNOWN";
})(CellType || (CellType = {}));
var Cell = (function () {
    function Cell(xlsxCell, id) {
        this._raw = xlsxCell.v;
        this._val = xlsxCell.w;
        this.id = id;
    }
    return Cell;
})();
var MetaCell = (function (_super) {
    __extends(MetaCell, _super);
    function MetaCell(xlsxCell, id) {
        _super.call(this, xlsxCell, id);
        this.value = ("" + this._val).trim();
    }
    return MetaCell;
})(Cell);
var TypeCell = (function (_super) {
    __extends(TypeCell, _super);
    function TypeCell(xlsxCell, id) {
        _super.call(this, xlsxCell, id);
        this.type = TypeCell.parseType(this.value);
    }
    TypeCell.parseType = function (type) {
        var result;
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
    };
    return TypeCell;
})(MetaCell);
var ValueCell = (function (_super) {
    __extends(ValueCell, _super);
    function ValueCell(xlsxCell, id, type) {
        _super.call(this, xlsxCell, id);
        this.color = 0x000000;
        this.bgColor = -1;
        var xlsxCellType = TypeCell.parseType(xlsxCell.t);
        this.numberFormat = xlsxCell.z;
        if (type === CellType.UNKNOWN) {
            if (this.numberFormat !== 'General') {
                this.type = CellType.STRING;
            }
            else {
                this.type = xlsxCellType;
            }
        }
        else {
            this.type = type;
        }
        var origin;
        if (this.type === CellType.STRING || this.type === CellType.ARRAY) {
            origin = this._val;
        }
        else {
            origin = this._raw;
        }
        this._convert(origin);
    }
    ValueCell.prototype._convert = function (origin) {
        var value;
        switch (this.type) {
            case CellType.COLOR: {
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
            case CellType.DATE: {
                var timezone = new Date().getTimezoneOffset();
                var days = (+origin || 0) - ValueCell.XLSX_DATE_OFFSET;
                var timestamp = (days * 24 * 60 + timezone) * 60 * 1000;
                value = new Date(timestamp);
                break;
            }
            case CellType.ARRAY: {
                if (origin === undefined) {
                    value = [];
                    break;
                }
                var values = ("" + origin).split(',');
                value = values.map(function (item, i) {
                    return item.trim();
                });
                break;
            }
            case CellType.BOOLEAN: {
                value = !!origin;
                break;
            }
            case CellType.INTEGER: {
                var numeric = +origin;
                var interger = Math.floor(numeric);
                value = interger || 0;
                break;
            }
            case CellType.UNSIGNED_INTEGER: {
                var numeric = +origin;
                var interger = Math.floor(numeric);
                value = interger > 0 ? interger : 0;
                break;
            }
            case CellType.NUMBER: {
                value = +origin;
                break;
            }
            case CellType.STRING: {
                value = origin !== undefined ? "" + origin : '';
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
    };
    ValueCell.prototype.toString = function () {
        return "" + this.valueOf();
    };
    ValueCell.prototype.valueOf = function () {
        switch (this.type) {
            case CellType.STRING: {
                return "" + this.value;
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
    };
    ValueCell.XLSX_DATE_OFFSET = 25568;
    return ValueCell;
})(Cell);
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
