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
		traceContextProvider?: () => JSNLogTraceContext;
	}

	interface JSNLogTraceContext {
		traceId: string;
		spanId: string;
		parentSpanId?: string;
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

		trace(logObject: any, traceContext?: JSNLogTraceContext): JSNLogLogger;
		debug(logObject: any, traceContext?: JSNLogTraceContext): JSNLogLogger;
		info(logObject: any, traceContext?: JSNLogTraceContext): JSNLogLogger;
		warn(logObject: any, traceContext?: JSNLogTraceContext): JSNLogLogger;
		error(logObject: any, traceContext?: JSNLogTraceContext): JSNLogLogger;
		fatal(logObject: any, traceContext?: JSNLogTraceContext): JSNLogLogger;
		fatalException(logObject: any, e: any, traceContext?: JSNLogTraceContext): JSNLogLogger;
		log(level: number, logObject: any, e?: any, traceContext?: JSNLogTraceContext): JSNLogLogger;
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

}


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
