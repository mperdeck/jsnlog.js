/**
* Copyright 2017 Mattijs Perdeck.
*
* This project is licensed under the MIT license.
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/



// Type definitions for JSNLog v2.29.0+
// Project: https://github.com/mperdeck/jsnlog.js
// Definitions by: Mattijs Perdeck <https://github.com/mperdeck>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// -------------------------------
// Full documentation is at 
// http://jsnlog.com
// -------------------------------



declare namespace JL {
		interface JSNLogOptions {
		enabled?: boolean;
		maxMessages?: number;
		defaultAjaxUrl?: string;
		clientIP?: string;
		requestId?: string;
		defaultBeforeSend?: (xhr: XMLHttpRequest) => void;
		serialize?: (object: any) => string;
	}

	interface JSNLogFilterOptions {
		level?: number;
		ipRegex?: string;
		userAgentRegex?: string;
		disallow?: string;
	}

	interface JSNLogLoggerOptions extends JSNLogFilterOptions {
		appenders?: JSNLogAppender[];
		onceOnly?: string[];
	}

	// Base for all appender options types
	interface JSNLogAppenderOptions extends JSNLogFilterOptions {
		sendWithBufferLevel?: number;
		storeInBufferLevel?: number;
		bufferSize?: number;
		batchSize?: number;
		maxBatchSize?: number;
		batchTimeout?: number;
		sendTimeout?: number;
	}

	interface JSNLogAjaxAppenderOptions extends JSNLogAppenderOptions {
		url?: string;
		beforeSend?: (xhr: XMLHttpRequest, json: any) => void;
	}

	interface JSNLogLogger {
		setOptions(options: JSNLogLoggerOptions): JSNLogLogger;

		trace(logObject: any): JSNLogLogger;
		debug(logObject: any): JSNLogLogger;
		info(logObject: any): JSNLogLogger;
		warn(logObject: any): JSNLogLogger;
		error(logObject: any): JSNLogLogger;
		fatal(logObject: any): JSNLogLogger;
		fatalException(logObject: any, e: any): JSNLogLogger;
		log(level: number, logObject: any, e?: any): JSNLogLogger;
	}

    // setOptions and sendBatch have to be optional, so you can use a Winston transport as
    // as a JSNLogAppender
	interface JSNLogAppender {
		setOptions?: (options: JSNLogAppenderOptions) => JSNLogAppender;
        sendBatch?: () => void;
	}

	interface JSNLogAjaxAppender extends JSNLogAppender {
		setOptions?: (options: JSNLogAjaxAppenderOptions) => JSNLogAjaxAppender;
	}

	interface JSNLogConsoleAppender extends JSNLogAppender {
	}

	
	// Interface to be used when dependency injecting JSNLog into a class
	interface JSNLog {
			setOptions(options: JSNLogOptions): void;
	createAjaxAppender(appenderName: string): JSNLogAjaxAppender;
	createConsoleAppender(appenderName: string): JSNLogConsoleAppender;

	getOffLevel(): number;
	getTraceLevel(): number;
	getDebugLevel(): number;
	getInfoLevel(): number;
	getWarnLevel(): number;
	getErrorLevel(): number;
	getFatalLevel(): number;
	getAllLevel(): number;

		
		(loggerName?: string): JL.JSNLogLogger;
	}
}

// Declaration of JSNLog as the global symbol JL,
// for when jsnlog.js is directly loaded via a script tag


// Ambient declaration of the JL function itself
declare function JL(loggerName?: string): JL.JSNLogLogger;


declare namespace JL {
		export function setOptions(options: JSNLogOptions): void;
	export function createAjaxAppender(appenderName: string): JSNLogAjaxAppender;
	export function createConsoleAppender(appenderName: string): JSNLogConsoleAppender;

	export function getOffLevel(): number;
	export function getTraceLevel(): number;
	export function getDebugLevel(): number;
	export function getInfoLevel(): number;
	export function getWarnLevel(): number;
	export function getErrorLevel(): number;
	export function getFatalLevel(): number;
	export function getAllLevel(): number;

	
		export class Exception {
		constructor(data: any, inner?: any);
	}

}

// This file is listed in the typings element in the package.json file.
// To make that work, this file must be recognized as a "module".
// For this, the file must have an export statement.
export { JL };
