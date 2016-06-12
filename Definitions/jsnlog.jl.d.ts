
// Ambient declaration of the JL object itself

//########## declare var JL: JL.JSNLogStatic;

import JSNLogAppender = JL.JSNLogAppender
import JSNLogAppenderOptions = JL.JSNLogAppenderOptions
import JSNLogAjaxAppender = JL.JSNLogAjaxAppender
import JSNLogAjaxAppenderOptions = JL.JSNLogAjaxAppenderOptions
import JSNLogConsoleAppender = JL.JSNLogConsoleAppender
import JSNLogFilterOptions = JL.JSNLogFilterOptions
import JSNLogLogger = JL.JSNLogLogger
import JSNLogLoggerOptions = JL.JSNLogLoggerOptions
import JSNLogOptions = JL.JSNLogOptions
//######### import JSNLogStatic = JL.JSNLogStatic

declare function JL(loggerName?: string): JSNLogLogger;

declare module JL
{
	export function setOptions(options: JSNLogOptions): any /*############## : JSNLogStatic */;
	export function createAjaxAppender(appenderName: string): JSNLogAjaxAppender;
	export function createConsoleAppender(appenderName: string): JSNLogConsoleAppender;

	export class Exception {
//		constructor(data: any);
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

