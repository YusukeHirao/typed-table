// Generated by CoffeeScript 1.9.1
var CHAR_CODE_A, CHAR_CODE_Z, Cell, NAME_COLUMN_VALUES, NAME_COLUMN_VALUES_LENGTH, Range, Sheet, TypedTable, _colorCodeToNumber, _getColFormNumber, _getNumberOfCol, fs, xlsx;

fs = require('fs');

xlsx = require('xlsx');

CHAR_CODE_A = 64;

CHAR_CODE_Z = 90;

NAME_COLUMN_VALUES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

NAME_COLUMN_VALUES_LENGTH = NAME_COLUMN_VALUES.length;

_getNumberOfCol = function(r1c1) {
  var c, i, k, len, n, num, s;
  num = 0;
  s = r1c1.toUpperCase().split('');
  for (i = k = 0, len = s.length; k < len; i = ++k) {
    c = s[i];
    n = NAME_COLUMN_VALUES.indexOf(c);
    if (1 !== 0 || i < s.length - 1) {
      n++;
    }
    num = num * 26 + n;
  }
  return num;
};

_getColFormNumber = function(num) {
  var col, mod, s;
  s = '';
  col = 0;
  if (1 !== 0 || col > 0) {
    num--;
  }
  mod = num % NAME_COLUMN_VALUES_LENGTH;
  s = NAME_COLUMN_VALUES[mod] + s;
  num = Math.floor(num / NAME_COLUMN_VALUES_LENGTH);
  col++;
  while (num > 0) {
    if (1 !== 0 || col > 0) {
      num--;
    }
    mod = num % NAME_COLUMN_VALUES_LENGTH;
    s = NAME_COLUMN_VALUES[mod] + s;
    num = Math.floor(num / NAME_COLUMN_VALUES_LENGTH);
    col++;
  }
  return s;
};

_colorCodeToNumber = function(code) {
  return parseInt(code.replace(/#/, ''), 16);
};

Range = (function() {
  Range.prototype.startCol = null;

  Range.prototype.startRow = null;

  Range.prototype.endCol = null;

  Range.prototype.endRow = null;

  Range.prototype.startNCol = 0;

  Range.prototype.startNRow = 0;

  Range.prototype.endNCol = 0;

  Range.prototype.endNRow = 0;

  function Range(ref) {
    var refSplit;
    refSplit = /^([a-z]+)([0-9]+):([a-z]+)([0-9]+)/ig.exec(ref);
    this.startCol = refSplit[1];
    this.startRow = refSplit[2];
    this.endCol = refSplit[3];
    this.endRow = refSplit[4];
    this.startNCol = _getNumberOfCol(refSplit[1]);
    this.startNRow = +refSplit[2];
    this.endNCol = _getNumberOfCol(refSplit[3]);
    this.endNRow = +refSplit[4];
  }

  Range.prototype.toString = function() {
    return "" + this.startCol + this.startRow + ":" + this.endCol + this.endRow;
  };

  return Range;

})();

Cell = (function() {
  Cell.prototype.value = null;

  Cell.prototype.type = null;

  Cell.prototype.format = '';

  Cell.prototype.color = 0x000000;

  Cell.prototype.bgColor = -1;

  function Cell(value1, type1, format, color, bgColor) {
    this.value = value1;
    this.type = type1;
    this.format = format;
    this.color = color != null ? color : 0x000000;
    this.bgColor = bgColor != null ? bgColor : -1;
  }

  return Cell;

})();

Sheet = (function() {
  Sheet.prototype.range = null;

  Sheet.prototype.cells = null;

  function Sheet(sheetData) {
    var c, cellData, cellValue, cl, col, id, r, rl;
    this.cells = [];
    this.range = new Range(sheetData['!ref']);
    r = this.range.startNRow;
    rl = this.range.endNRow;
    while (r <= rl) {
      c = this.range.startNCol;
      cl = this.range.endNCol;
      col = [];
      while (c <= cl) {
        id = "" + (_getColFormNumber(c)) + r;
        cellData = sheetData[id];
        if (cellData) {
          cellValue = new Cell(cellData.v, cellData.t, cellData.f);
          if (cellData.s) {
            cellValue.bgColor = parseInt(cellData.s.fgColor.rgb, 16);
          }
        } else {
          cellValue = null;
        }
        col[c - 1] = cellValue;
        c++;
      }
      this.cells[r - 1] = col;
      r++;
    }
  }

  return Sheet;

})();

TypedTable = (function() {
  TypedTable.cells = null;

  TypedTable.header = null;

  TypedTable.types = null;

  function TypedTable(cells, rowOption) {
    var HEADER_ROW_NUM, LABEL_ROW_NUM, TYPE_ROW_NUM, cell, i, k, len;
    rowOption = rowOption || {};
    LABEL_ROW_NUM = rowOption.label || 0;
    HEADER_ROW_NUM = rowOption.header || 1;
    TYPE_ROW_NUM = rowOption.type || 2;
    this.cells = [];
    for (i = k = 0, len = cells.length; k < len; i = ++k) {
      cell = cells[i];
      switch (i) {
        case LABEL_ROW_NUM:
          continue;
        case HEADER_ROW_NUM:
          this.header = cell;
          break;
        case TYPE_ROW_NUM:
          this.types = cell;
          break;
        default:
          this.cells.push(cell);
      }
    }
  }

  TypedTable.prototype.toJSON = function() {
    var arr, cell, cellValues, childName, data, headerName, i, item, j, k, keyName, keyNameSplit, l, len, len1, parentName, ref1, row, type, value;
    data = [];
    ref1 = this.cells;
    for (i = k = 0, len = ref1.length; k < len; i = ++k) {
      row = ref1[i];
      cellValues = {};
      for (j = l = 0, len1 = row.length; l < len1; j = ++l) {
        cell = row[j];
        headerName = this.header[j].value;
        type = this.types[j].value;
        if (headerName) {
          keyName = headerName.trim().replace(/\s/gm, ' ');
          keyName = new Jaco(keyName).toNarrow().toWideKatakana().toString();
          value = (function() {
            if (cell) {
              switch (String(type).toLowerCase()) {
                case 'c':
                case 'color':
                case 'colour':
                  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(cell.value)) {
                    return _colorCodeToNumber(cell.value);
                  } else {
                    return cell.bgColor;
                  }
                  break;
                case 'd':
                case 'date':
                case 't':
                case 'time':
                  return new Date((+cell.value - 25569) * 86400 * 1000 || 0);
                case 'a':
                case 'arr':
                case 'ary':
                case 'array':
                  return arr = (function() {
                    var len2, m, ref2, results;
                    ref2 = ('' + cell.value).split(',');
                    results = [];
                    for (m = 0, len2 = ref2.length; m < len2; m++) {
                      item = ref2[m];
                      if (item !== '') {
                        results.push(item.trim());
                      }
                    }
                    return results;
                  })();
                case 'b':
                case 'bool':
                case 'boolean':
                  return !!cell.value;
                case 'n':
                case 'num':
                case 'number':
                  return +cell.value;
                default:
                  return ('' + cell.value).replace(/\r/, '');
              }
            } else {
              return null;
            }
          })();
          if (keyName.match(/^[a-z][a-z0-9_-]+--/ig)) {
            keyNameSplit = keyName.split(/--/);
            parentName = keyNameSplit[0] + 's';
            childName = keyNameSplit[1];
            if (cellValues[parentName] == null) {
              cellValues[parentName] = {};
            }
            cellValues[parentName][childName] = value;
          } else {
            cellValues[keyName] = value;
          }
        }
      }
      data.push(cellValues);
    }
    return data;
  };

  TypedTable.prototype.toJSONStringify = function(replacer, space) {
    return JSON.stringify(this.toJSON(), replacer, space);
  };

  TypedTable.prototype.saveJSONFile = function(fileName, space) {
    var json;
    if (space == null) {
      space = '	';
    }
    json = this.toJSONStringify(null, '	');
    fs.writeFileSync(fileName, json);
  };

  TypedTable.readExcel = function(xlsxFile, rowOption) {
    var file, name, sheets;
    file = xlsx.readFile(xlsxFile, {
      cellStyles: true,
      cellNF: true
    });
    sheets = (function() {
      var k, len, ref1, results;
      ref1 = file.SheetNames;
      results = [];
      for (k = 0, len = ref1.length; k < len; k++) {
        name = ref1[k];
        results.push(new Sheet(file.Sheets[name]));
      }
      return results;
    })();
    return new Table(sheets[0].cells, rowOption);
  };

  return TypedTable;

})();