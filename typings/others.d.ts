declare module "xlsx" {
	export var version: string;
	export function read ();
	export function readFile (filePath: string, option: any): XLSX;
	export function write ();
	export function writeFile ();
	export var utils: XLSXUitls;
	export var SSF: XLSXSSF;

	export interface XLSXUitls {
		encode_col (): any;
		encode_row (): any;
		encode_cell (): any;
		encode_range (): any;
		decode_col (): any;
		decode_row (): any;
		split_cell (): any;
		decode_cell (): any;
		decode_range (): any;
		format_cell (): any;
		get_formulae (): any;
		make_csv (): any;
		make_json (): any;
		make_formulae (): any;
		sheet_to_csv (): any;
		sheet_to_json (): any;
		sheet_to_formulae (): any;
		sheet_to_row_object_array (): any;
	}

	export interface XLSXSSF {
		version: string;
		opts: any[]; // 要調査
		_general_int (): any;
		_general_num (): any;
		_general (): any;
		parse_date_code (): any;
		_split (): any;
		_eval (): any;
		_table: string[];
		load (): any;
		format (): any;
		get_table (): any;
		load_table (): any;
	}

	export class XLSX {
		/**
		 * Directory
		 */
		Directory: Directory;

		/**
		 * Workbook
		 */
		Workbook: Workbook;

		/**
		 * TODO
		 */
		Props;

		/**
		 * TODO
		 */
		Custprops;

		/**
		 * TODO
		 */
		Deps;

		/**
		 * Sheets
		 */
		Sheets: XLSXSheets;

		/**
		 * SheetNames
		 */
		SheetNames: string[];

		Strings: XLSXStrings;

		Styles: XLSXStyles;

		Themes: XLSXThemes;

		SSF: XLSLInstanceSSF;
	}

	interface Directory {
		workbooks: string[];
		sheets: string[];
		themes: string[];
		styles: string[];
		coreprops: string[];
		extprops: string[];
		custprops: string[];
		strs: string[];
		comments: string[];
		vba: string[];
		TODO: string[];
		rels: string[];
		xmlns: string;
		calcchain: string;
		sst: string;
		style: string;
		defaults: DirectoryDefaults;
	}

	interface DirectoryDefaults {
		xml: string;
		rels: string;
	}

	interface Workbook {
		AppVersion: WorkbookAppVersion;
		WBProps; // TODO
		WBView; // TODO
		Sheets; // TODO
		CalcPr; // TODO
		xmlns: string;
	}

	interface WorkbookAppVersion {
		appName: string;
		lastEdited: string;
		lowestEdited: string;
		rupBuild: string;
	}

	interface XLSXSheets {
		[ sheetName: string ]: XLSXSheet;
	}

	interface XLSXSheet {
		"!ref": string;
		[ cellNumber: number ]: XLSXCell;
	}
	
	interface XLSXCell {
		/**
		 * cell type: b Boolean, n Number, e error, s String, d Date
		 */
		t: string;
		
		/**
		 * raw value
		 */
		v: string | number | boolean;
		
		/**
		 * rich text encoding
		 */
		r?: string;
		
		/**
		 * refer
		 */
		f?: string;
		
		/**
		 * HTML rendering of the rich text
		 */
		h?: string;
		
		/**
		 * formatted text
		 */
		w: string;
		
		/**
		 * format
		 */
		z: string;
		
		/**
		 * Comment
		 */
		c: XLSXCellComment;
		
		/**
		 * hyperlink object
		 */
		l?: XLSXCellLinkInfo;
	}
	
	interface XLSXCellComment {
		a: string;
		t: string;
		r: string;
		h: string;
	}
	
	interface XLSXCellLinkInfo {
		ref: string;
		id: string;
		Target: string;
		Rel: XLSXCellLinkInfoRel;
	}
	
	interface XLSXCellLinkInfoRel {
		Type: string;
		Target: string;
		Id: string;
		TargetMode: string;
	}

	interface XLSXStrings {
		[ index: number ]: XLSXString;
		Count: string;
		Unique: string;
	}

	interface XLSXString {
		t: string;
		r: string;
		h: string;
	}

	interface XLSXStyles {
		NumberFmt: string[];
		Fills: XLSXStyleFill[]; // TODO
		CellXf: XLSXCellXf[]; // TODO
	}

	interface XLSXThemes {
		// undefined
	}

	interface XLSLInstanceSSF {
		[ index: string ]: string;
	}
	
	interface XLSXStyleFill {
		patternType: string;
		fgColor?: XLSXStyleFillFgColor;
		bgColor?: XLSXStyleFillBgColor
	}
	
	interface XLSXStyleFillFgColor {
		rgb: string;
	}
	
	interface XLSXStyleFillBgColor {
		indexed: number;
	}
	
	interface XLSXCellXf {
		numFmtId: number;
		fontId: string;
		fillId: number;
		borderId: string;
		xfId: string;
		applyNumberFormat?: string;
		applyFont?: string;
		applyBorder?: string;
		applyAlignment?: string;
	}
}