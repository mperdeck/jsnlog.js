
// Ambient declaration of the JL function itself
declare function JL(loggerName?: string): JL.JSNLogLogger;

// Definitions that need to be kept out of the main module definition,
// because otherwise during compilation of jsnlog.ts it complains that you can't 
// overload ambient declarations with non-ambient declarations.

declare module JL {
	export function setOptions(options: JSNLogOptions): void;
	export function createAjaxAppender(appenderName: string): JSNLogAjaxAppender;
	export function createConsoleAppender(appenderName: string): JSNLogConsoleAppender;

	export class Exception {
		constructor(data: any, inner?: any);
	}
	
	export function getOffLevel(): number;
	export function getTraceLevel(): number;
	export function getDebugLevel(): number;
	export function getInfoLevel(): number;
	export function getWarnLevel(): number;
	export function getErrorLevel(): number;
	export function getFatalLevel(): number;
	export function getAllLevel(): number;
}
