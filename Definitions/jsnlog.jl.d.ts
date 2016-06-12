
// Ambient declaration of the JL object itself

//########## declare var JL: JSNLog.JSNLogStatic;

import JSNLogAppender = JSNLog.JSNLogAppender
import JSNLogAppenderOptions = JSNLog.JSNLogAppenderOptions
import JSNLogAjaxAppender = JSNLog.JSNLogAjaxAppender
import JSNLogAjaxAppenderOptions = JSNLog.JSNLogAjaxAppenderOptions
import JSNLogConsoleAppender = JSNLog.JSNLogConsoleAppender
import JSNLogFilterOptions = JSNLog.JSNLogFilterOptions
import JSNLogLogger = JSNLog.JSNLogLogger
import JSNLogLoggerOptions = JSNLog.JSNLogLoggerOptions
import JSNLogOptions = JSNLog.JSNLogOptions
//######### import JSNLogStatic = JSNLog.JSNLogStatic

declare function JL(loggerName?: string): JSNLogLogger;

declare module JL
{
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

