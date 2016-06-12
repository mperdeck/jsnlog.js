
// Ambient declaration of the JL object itself

declare function JL(loggerName?: string): JL.JSNLogLogger;

declare module JL {
	export function setOptions(options: JSNLogOptions): any /*############## : JSNLogStatic */;
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
