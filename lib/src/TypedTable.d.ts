export declare function readExcel(xlsxFilePath: string, rowOption: IRowOption): Table[];
export declare class Table {
    static CHAR_CODE_A: number;
    static CHAR_CODE_Z: number;
    private _rows;
    private _header;
    private _types;
    constructor(rows: any[][], rowOption?: IRowOption);
    toJSON(): any[];
    toJSONStringify(replacer?: any[], space?: string): string;
}
export interface IRowOption {
    label?: number;
    header?: number;
    type?: number;
    description?: number;
}
