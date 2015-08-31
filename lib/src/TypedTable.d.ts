import xlsx = require('xlsx');
export declare function readExcel(xlsxFilePath: string, rowOption: IRowOption): TableCollection;
export declare class TableCollection {
    private _items;
    private _names;
    constructor();
    add(name: string, table: Table): void;
    item(index: string | number): Table;
    each(callback: (table: Table, name: string, index: number) => void): void;
    toJSON(): any;
    toJSONStringify(replacer?: any[], space?: string): string;
    saveJSON(fileName: string, space?: string): void;
}
export declare class Table {
    private _range;
    private _rows;
    private _header;
    private _types;
    constructor(sheetData: xlsx.XLSXSheet, rowOption?: IRowOption);
    toJSON(): any[];
    toJSONStringify(replacer?: any[], space?: string): string;
}
export interface IRowOption {
    label?: number;
    header?: number;
    type?: number;
    description?: number;
}
