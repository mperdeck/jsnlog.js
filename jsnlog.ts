/// <reference path="Definitions/jsnlog_interfaces.d.ts"/>

import JSNLogAppender = JL.JSNLogAppender
import JSNLogAppenderOptions = JL.JSNLogAppenderOptions
import JSNLogAjaxAppender = JL.JSNLogAjaxAppender
import JSNLogAjaxAppenderOptions = JL.JSNLogAjaxAppenderOptions
import JSNLogConsoleAppender = JL.JSNLogConsoleAppender
import JSNLogFilterOptions = JL.JSNLogFilterOptions
import JSNLogLogger = JL.JSNLogLogger
import JSNLogLoggerOptions = JL.JSNLogLoggerOptions
import JSNLogOptions = JL.JSNLogOptions

// Ambient definition of XDomainRequest (only used with IE8 and 9), to prevent TypeScript compiler "name not found" error.
declare class XDomainRequest
{
	open(method: string, url: string);
}

function JL(loggerName?: string): JSNLogLogger
{
    // If name is empty, return the root logger
    if (!loggerName)
    {
        return JL.__;
    }

    // Implements Array.reduce. JSNLog supports IE8+ and reduce is not supported in that browser.
    // Same interface as the standard reduce, except that 
    if (!Array.prototype.reduce)
    {
        Array.prototype.reduce = function (callback: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any, initialValue?: any)
        {
            var previousValue = initialValue;
            for (var i = 0; i < this.length; i++)
            {
                previousValue = callback(previousValue, this[i], i, this);
            }

            return previousValue;
        };
    }

    var accumulatedLoggerName = '';
    var logger: JL.Logger = ('.' + loggerName).split('.').reduce(
        function (prev: JL.Logger, curr: string, idx: number, arr: string[])
        {
            // if loggername is a.b.c, than currentLogger will be set to the loggers
            // root   (prev: JL, curr: '')
            // a      (prev: JL.__, curr: 'a')
            // a.b    (prev: JL.__.__a, curr: 'b')
            // a.b.c  (prev: JL.__.__a.__a.b, curr: 'c')

            // Note that when a new logger name is encountered (such as 'a.b.c'),
            // a new logger object is created and added as a property to the parent ('a.b').
            // The root logger is added as a property of the JL object itself.

            // It is essential that the name of the property containing the child logger
            // contains the full 'path' name of the child logger ('a.b.c') instead of
            // just the bit after the last period ('c').
            // This is because the parent inherits properties from its ancestors.
            // So if the root has a child logger 'c' (stored in a property 'c' of the root logger),
            // then logger 'a.b' has that same property 'c' through inheritance.

            // The names of the logger properties start with __, so the root logger 
            // (which has name ''), has a nice property name '__'.              

            // accumulatedLoggerName evaluates false ('' is falsy) in first iteration when prev is the root logger.
            // accumulatedLoggerName will be the logger name corresponding with the logger in currentLogger.
            // Keep in mind that the currentLogger may not be defined yet, so can't get the name from
            // the currentLogger object itself. 
            if (accumulatedLoggerName)
            {
                accumulatedLoggerName += '.' + curr;
            } else
            {
                accumulatedLoggerName = curr;
            }

            var currentLogger = prev['__' + accumulatedLoggerName];

            // If the currentLogger (or the actual logger being sought) does not yet exist, 
            // create it now.
            if (currentLogger === undefined)
            {

                // Set the prototype of the Logger constructor function to the parent of the logger
                // to be created. This way, __proto of the new logger object will point at the parent.
                // When logger.level is evaluated and is not present, the JavaScript runtime will 
                // walk down the prototype chain to find the first ancestor with a level property.
                //
                // Note that prev at this point refers to the parent logger.

                JL.Logger.prototype = prev;

                currentLogger = new JL.Logger(accumulatedLoggerName);
                prev['__' + accumulatedLoggerName] = currentLogger;
            }

            return currentLogger;
        }, JL.__);

    return logger;
}

module JL
{

    export var enabled: boolean;
    export var maxMessages: number;
    export var defaultAjaxUrl: string;
    export var clientIP: string;
    export var defaultBeforeSend: any;
    export var serialize: any;

    // Initialise requestId to empty string. If you don't do this and the user
    // does not set it via setOptions, then the JSNLog-RequestId header will
    // have value "undefined", which doesn't look good in a log.
    //
    // Note that you always want to send a requestId as part of log requests,
    // otherwise the server side component doesn't know this is a log request
    // and may create a new request id for the log request, causing confusion
    // in the log.
    export var requestId: string = '';

    // Number uniquely identifying every log entry within the request.
    export var entryId: number = 0;

    // Allow property injection of these classes, to enable unit testing
    export var _createXMLHttpRequest = function () { return new XMLHttpRequest(); };
    export var _getTime = function () { return (new Date).getTime(); };
    export var _console = console;

    /**
    Copies the value of a property from one object to the other.
    This is used to copy property values as part of setOption for loggers and appenders.

    Because loggers inherit property values from their parents, it is important never to
    create a property on a logger if the intent is to inherit from the parent.

    Copying rules:
    1) if the from property is undefined (for example, not mentioned in a JSON object), the
       to property is not affected at all.
    2) if the from property is null, the to property is deleted (so the logger will inherit from
       its parent).
    3) Otherwise, the from property is copied to the to property.
    */
    function copyProperty(propertyName: string, from: any, to: any): void
    {
        if (from[propertyName] === undefined) { return; }
        if (from[propertyName] === null) { delete to[propertyName]; return; }
        to[propertyName] = from[propertyName];
    }

    /**
    Returns true if a log should go ahead.
    Does not check level.

    @param filters
        Filters that determine whether a log can go ahead.
    */
    function allow(filters: JSNLogFilterOptions): boolean
    {
        // If enabled is not null or undefined, then if it is false, then return false
        // Note that undefined==null (!)
        if (!(JL.enabled == null))
        {
            if (!JL.enabled) { return false; }
        }

        // If the regex contains a bug, that will throw an exception.
        // Ignore this, and pass the log item (better too much than too little).

        try
        {
            if (filters.userAgentRegex)
            {
                if (!new RegExp(filters.userAgentRegex).test(navigator.userAgent)) { return false; }
            }
        } catch (e) { }

        try
        {
            if (filters.ipRegex && JL.clientIP)
            {
                if (!new RegExp(filters.ipRegex).test(JL.clientIP)) { return false; }
            }
        } catch (e) { }

        return true;
    }

    /**
    Returns true if a log should go ahead, based on the message.

    @param filters
        Filters that determine whether a log can go ahead.

    @param message
        Message to be logged.
    */
    function allowMessage(filters: JSNLogFilterOptions, message: string): boolean
    {
        // If the regex contains a bug, that will throw an exception.
        // Ignore this, and pass the log item (better too much than too little).

        try
        {
            if (filters.disallow)
            {
                if (new RegExp(filters.disallow).test(message)) { return false; }
            }
        } catch (e) { }

        return true;
    }

    // If logObject is a function, the function is evaluated (without parameters)
    // and the result returned.
    // Otherwise, logObject itself is returned.
    function stringifyLogObjectFunction(logObject: any): any
    {
        if (typeof logObject == "function") 
        {
            if (logObject instanceof RegExp)
            {
                return logObject.toString();
            }
            else
            {
                return logObject();
            }
        }

        return logObject;
    }

    class StringifiedLogObject
    {
        // * msg - 
        //      if the logObject is a scalar (after possible function evaluation), this is set to
        //      string representing the scalar. Otherwise it is left undefined.
        // * meta -
        //      if the logObject is an object (after possible function evaluation), this is set to
        //      that object. Otherwise it is left undefined.
        // * finalString -
        //      This is set to the string representation of logObject (after possible function evaluation),
        //      regardless of whether it is an scalar or an object. An object is stringified to a JSON string.
        //      Note that you can't call this field "final", because as some point this was a reserved
        //      JavaScript keyword and using final trips up some minifiers.
        constructor(public msg?: string, public meta?: any, public finalString?: string) { }
    }

    // Takes a logObject, which can be 
    // * a scalar
    // * an object
    // * a parameterless function, which returns the scalar or object to log.
    // Returns a stringifiedLogObject
    function stringifyLogObject(logObject: any): StringifiedLogObject
    {
        // Note that this works if logObject is null.
        // typeof null is object.
        // JSON.stringify(null) returns "null".

        var actualLogObject = stringifyLogObjectFunction(logObject);
        var finalString;

        // Note that typeof actualLogObject should not be "function", because that has 
        // been resolved with stringifyLogObjectFunction.

        switch (typeof actualLogObject)
        {
            case "string":
                return new StringifiedLogObject(actualLogObject, null, actualLogObject);
            case "number":
                finalString = actualLogObject.toString(); 
                return new StringifiedLogObject(finalString, null, finalString);
            case "boolean":
                finalString = actualLogObject.toString(); 
                return new StringifiedLogObject(finalString, null, finalString);
            case "undefined":
                return new StringifiedLogObject("undefined", null, "undefined");
            case "object":
                if ((actualLogObject instanceof RegExp) ||
                    (actualLogObject instanceof String) ||
                    (actualLogObject instanceof Number) ||
                    (actualLogObject instanceof Boolean))
                {
                    finalString = actualLogObject.toString();
                    return new StringifiedLogObject(finalString, null, finalString);
                }
                else
                {
                    if (typeof JL.serialize === 'function') {
                        finalString = JL.serialize.call(this, actualLogObject);
                    } else {
                        finalString = JSON.stringify(actualLogObject);
                    }

                    return new StringifiedLogObject(null, actualLogObject, finalString);
                }
            default:
                return new StringifiedLogObject("unknown", null, "unknown");
        }
    }

    export function setOptions(options: JSNLogOptions): void
    {
        copyProperty("enabled", options, this);
        copyProperty("maxMessages", options, this);
        copyProperty("defaultAjaxUrl", options, this);
        copyProperty("clientIP", options, this);
        copyProperty("requestId", options, this);
        copyProperty("defaultBeforeSend", options, this);
        copyProperty("serialize", options, this);
        return this;
    }

    export function getAllLevel(): number { return -2147483648; }
    export function getTraceLevel(): number { return 1000; }
    export function getDebugLevel(): number { return 2000; }
    export function getInfoLevel(): number { return 3000; }
    export function getWarnLevel(): number { return 4000; }
    export function getErrorLevel(): number { return 5000; }
    export function getFatalLevel(): number { return 6000; }
    export function getOffLevel(): number { return 2147483647; }

    function levelToString(level: number): string
    {
        if (level <= 1000) { return "trace"; }
        if (level <= 2000) { return "debug"; }
        if (level <= 3000) { return "info"; }
        if (level <= 4000) { return "warn"; }
        if (level <= 5000) { return "error"; }
        return "fatal";
    }

    // ---------------------

    export class Exception
    {
        public name: string;
        public message: string;

        // data replaces message. It takes not just strings, but also objects and functions, just like the log function.
        // internally, the string representation is stored in the message property (inherited from Error)
        //
        // inner: inner exception. Can be null or undefined. 
        constructor(data: any, public inner?: any)
        {
            this.name = "JL.Exception";
            this.message = stringifyLogObject(data).finalString;
        }
    }

    // Derive Exception from Error (a Host object), so browsers
    // are more likely to produce a stack trace for it in their console.
    //
    // Note that instanceof against an object created with this constructor
    // will return true in these cases:
    // <object> instanceof JL.Exception);
    // <object> instanceof Error);

    Exception.prototype = <any>new Error();

    // ---------------------

    export class LogItem
    {
        // l: level
        // m: message
        // n: logger name
        // t (timeStamp) is number of milliseconds since 1 January 1970 00:00:00 UTC
        // u: number uniquely identifying this entry for this request.
        //
        // Keeping the property names really short, because they will be sent in the
        // JSON payload to the server.
        constructor(public l: number, public m: string,
            public n: string, public t: number, public u: number) { }
    }

    function newLogItem(levelNbr: number, message: string, loggerName: string): LogItem {
        JL.entryId++;
        return new LogItem(levelNbr, message, loggerName, JL._getTime(), JL.entryId);
    }

    // ---------------------

    interface ITimer {
        id: any;
    }

    function clearTimer(timer: ITimer): void {
        if(timer.id) {
            clearTimeout(timer.id);
            timer.id = null;
        }
    }

    function setTimer(timer: ITimer, timeoutMs: number, callback: () => void): void {
        var that = this;
        if(!timer.id) {
            timer.id = setTimeout(function () {
                // use call to ensure that the this as used inside sendBatch when it runs is the
                // same this at this point.
                callback.call(that);
            }, timeoutMs);
        }
    }

    export class Appender implements JSNLogAppender, JSNLogFilterOptions
    {
        public level: number = JL.getTraceLevel();
        public ipRegex: string;
        public userAgentRegex: string;
        public disallow: string;

        // set to super high level, so if user increases level, level is unlikely to get 
        // above sendWithBufferLevel
        private sendWithBufferLevel: number = 2147483647;

        private storeInBufferLevel: number = -2147483648;
        private bufferSize: number = 0; // buffering switch off by default
        private batchSize: number = 1;
        private maxBatchSize: number = 20;
        private batchTimeout: number = 2147483647;
        private sendTimeout: number = 5000;

        // Holds all log items with levels higher than storeInBufferLevel 
        // but lower than level. These items may never be sent.
        private buffer: LogItem[] = [];

        // Holds all items that we do want to send, until we have a full
        // batch (as determined by batchSize).
        private batchBuffer: LogItem[] = [];

        // Holds the id of the timer implementing the batch timeout.
        // Can be null.
        // This is an object, so it can be passed to a method that updated the timer variable.
        private batchTimeoutTimer: ITimer = { id: null };

        // Holds the id of the timer implementing the send timeout.
        // Can be null.
        private sendTimeoutTimer: ITimer = { id: null };

        // Number of log items that has been skipped due to batch buffer at max size,
        // since appender creation or since creation of the last "skipped" warning log entry.
        private nbrLogItemsSkipped: number = 0;

        // Will be 0 if no log request is outstanding at the moment.
        // Otherwise the number of log items in the outstanding request.
        private nbrLogItemsBeingSent: number = 0;

        // sendLogItems takes an array of log items. It will be called when
        // the appender has items to process (such as, send to the server).
        // sendLogItems will call successCallback after the items have been successfully sent.
        //
        // Note that after sendLogItems returns, the appender may truncate
        // the LogItem array, so the function has to copy the content of the array
        // in some fashion (eg. serialize) before returning.

        constructor(
            public appenderName: string,
            public sendLogItems: (logItems: LogItem[], successCallback: () => void) => void)
        {
        }

        private addLogItemsToBuffer(logItems: LogItem[]): void {

            // If the batch buffer has reached its maximum limit, 
            // skip the log item and increase the "skipped items" counter.
            if (this.batchBuffer.length >= this.maxBatchSize) {
                this.nbrLogItemsSkipped += logItems.length;
                return;
            }

            // If maxMessages is not null or undefined, then decrease it by the batch size.
            // This can result in a negative maxMessages.
            // Note that undefined==null (!)
            //
            // Note that we may be sending more messages than the maxMessages limit allows,
            // if we stored trace messages. Rationale is the buffer for trace messages is limited,
            // and if we cut off at exactly maxMessages, we'd also loose the high severity message
            // that caused the trace messages to be sent (unless we cater for this specifically, which
            // is more complexity).
            //
            // If there are multiple appenders sending the same message, maxMessage will be decreased
            // by each appender for the same message. This is:
            // 1) only appenders know whether a message will actually be sent (based on storeInBufferLevel),
            //    so the loggers couldn't do this update;
            // 2) if you have multiple appenders hitting the same server, this may be what you want.
            //
            // In most cases there is only 1 appender, so this then doesn't matter.

            if (!(JL.maxMessages == null)) {
                if (JL.maxMessages < 1) { return; }

                JL.maxMessages -= logItems.length;
            }

            this.batchBuffer = this.batchBuffer.concat(logItems);

            // If this is the first item in the buffer, set the timer
            // to ensure it will be sent within the timeout period.
            // If it is not the first item, leave the timer alone so to not to 
            // increase the timeout for the first item.
            //
            // To determine if this is the first item, look at the timer variable.
            // Do not look at the buffer lenght, because we also put items in the buffer
            // via a concat (bypassing this function).
            //
            // The setTimer method only sets the timer if it is not already running.

            var that = this;
            setTimer(this.batchTimeoutTimer, this.batchTimeout, function () {
                that.sendBatch.call(that);
            });
        };

        private batchBufferHasOverdueMessages(): boolean {
            for (let i: number = 0; i < this.batchBuffer.length; i++) {
                let messageAgeMs: number = JL._getTime() - this.batchBuffer[i].t;
                if (messageAgeMs > this.batchTimeout) { return true; }
            }

            return false;
        }

        // Returns true if no more message will ever be added to the batch buffer,
        // but the batch buffer has messages now - so if there are not enough to make up a batch,
        // and there is no batch timeout, then they will never be sent. This is especially important if 
        // maxMessages was reached while jsnlog.js was retrying sending messages to the server.
        private batchBufferHasStrandedMessage(): boolean {
            return (!(JL.maxMessages == null)) && (JL.maxMessages < 1) && (this.batchBuffer.length > 0);
        }

        private sendBatchIfComplete(): void {
            if ((this.batchBuffer.length >= this.batchSize) ||
                this.batchBufferHasOverdueMessages() ||
                this.batchBufferHasStrandedMessage()) {
                this.sendBatch();
            }
        }

        private onSendingEnded(): void {
            clearTimer(this.sendTimeoutTimer);
            this.nbrLogItemsBeingSent = 0;
            this.sendBatchIfComplete();
        }

        public setOptions(options: JSNLogAppenderOptions): JSNLogAppender
        {
            copyProperty("level", options, this);
            copyProperty("ipRegex", options, this);
            copyProperty("userAgentRegex", options, this);
            copyProperty("disallow", options, this);
            copyProperty("sendWithBufferLevel", options, this);
            copyProperty("storeInBufferLevel", options, this);
            copyProperty("bufferSize", options, this);
            copyProperty("batchSize", options, this);
            copyProperty("maxBatchSize", options, this);
            copyProperty("batchTimeout", options, this);
            copyProperty("sendTimeout", options, this);

            if (this.bufferSize < this.buffer.length) { this.buffer.length = this.bufferSize; }

            if (this.maxBatchSize < this.batchSize) {
                throw new JL.Exception({
                    "message": "maxBatchSize cannot be smaller than batchSize",
                    "maxBatchSize": this.maxBatchSize,
                    "batchSize": this.batchSize
                });
            }

            return this;
        }

        /**
        Called by a logger to log a log item.
        If in response to this call one or more log items need to be processed
        (eg., sent to the server), this method calls this.sendLogItems
        with an array with all items to be processed.

        Note that the name and parameters of this function must match those of the log function of
        a Winston transport object, so that users can use these transports as appenders.
        That is why there are many parameters that are not actually used by this function.

        level - string with the level ("trace", "debug", etc.) Only used by Winston transports.
        msg - human readable message. Undefined if the log item is an object. Only used by Winston transports.
        meta - log object. Always defined, because at least it contains the logger name. Only used by Winston transports.
        callback - function that is called when the log item has been logged. Only used by Winston transports.
        levelNbr - level as a number. Not used by Winston transports.
        message - log item. If the user logged an object, this is the JSON string.  Not used by Winston transports.
        loggerName: name of the logger.  Not used by Winston transports.
        */
        public log(
            level: string, msg: string, meta: any, callback: () => void,
            levelNbr: number, message: string, loggerName: string): void
        {
            var logItem: LogItem;

            if (!allow(this)) { return; }
            if (!allowMessage(this, message)) { return; }

            if (levelNbr < this.storeInBufferLevel)
            {
                // Ignore the log item completely
                return;
            }

            logItem = newLogItem(levelNbr, message, loggerName);

            if (levelNbr < this.level)
            {
                // Store in the hold buffer. Do not send.
                if (this.bufferSize > 0)
                {
                    this.buffer.push(logItem);

                    // If we exceeded max buffer size, remove oldest item
                    if (this.buffer.length > this.bufferSize)
                    {
                        this.buffer.shift();
                    }
                }

                return;
            }

            // Want to send the item

            this.addLogItemsToBuffer([logItem]);

            if (levelNbr >= this.sendWithBufferLevel) {
                // Want to send the contents of the buffer.
                //
                // Send the buffer AFTER sending the high priority item.
                // If you were to send the high priority item after the buffer,
                // if we're close to maxMessages or maxBatchSize,
                // then the trace messages in the buffer could crowd out the actual high priority item.
                if (this.buffer.length)
                {
                    this.addLogItemsToBuffer(this.buffer);
                    this.buffer.length = 0;
                }
            }

            this.sendBatchIfComplete();
        };

        // Processes the batch buffer
        //
        // Make this public, so it can be called from outside the library,
        // when the page is unloaded.
        public sendBatch(): void
        {
            // Do not clear the batch timer if you don't go ahead here because
            // a send is already in progress. Otherwise the messages that were stopped from going out
            // may get ignored because the batch timer never went off.

            if (this.nbrLogItemsBeingSent > 0) {
                return;
            }

            clearTimer(this.batchTimeoutTimer);

            if (this.batchBuffer.length == 0)
            {
                return;
            }

            // Decided at this point to send contents of the buffer

            this.nbrLogItemsBeingSent = this.batchBuffer.length;

            var that = this;
            setTimer(this.sendTimeoutTimer, this.sendTimeout, function () {
                that.onSendingEnded.call(that);
            });

            this.sendLogItems(this.batchBuffer, function () {
                // Log entries have been successfully sent to server

                // Remove the first (nbrLogItemsBeingSent) items in the batch buffer, because they are the ones
                // that were sent.
                that.batchBuffer.splice(0, that.nbrLogItemsBeingSent);

                // If items had to be skipped, add a WARN message
                if (that.nbrLogItemsSkipped > 0) {
                    that.batchBuffer.push(
                        newLogItem(getWarnLevel(),
                            "Lost " + that.nbrLogItemsSkipped + " messages while connection with the server was down. Reduce lost messages by increasing the ajaxAppender option maxBatchSize.",
                            that.appenderName));
                    that.nbrLogItemsSkipped = 0;
                }

                that.onSendingEnded.call(that);
            });
        }
    }

    // ---------------------

    export class AjaxAppender extends Appender implements JSNLogAjaxAppender
    {
        private url: string;
        private beforeSend: any;
        private xhr: XMLHttpRequest;

        public setOptions(options: JSNLogAjaxAppenderOptions): JSNLogAjaxAppender
        {
            copyProperty("url", options, this);
            copyProperty("beforeSend", options, this);
            super.setOptions(options);
            return this;
        }

        public sendLogItemsAjax(logItems: LogItem[], successCallback: () => void): void
        {
            // JSON.stringify is only supported on IE8+
            // Use try-catch in case we get an exception here.
            //
            // The "r" field is now obsolete. When writing a server side component, 
            // read the HTTP header "JSNLog-RequestId"
            // to get the request id.
            //
            // The .Net server side component
            // now uses the JSNLog-RequestId HTTP Header, because this allows it to
            // detect whether the incoming request has a request id.
            // If the request id were in the json payload, it would have to read the json
            // from the stream, interfering with normal non-logging requests.
            //
            // To see what characters you can use in the HTTP header, visit:
            // http://stackoverflow.com/questions/3561381/custom-http-headers-naming-conventions/3561399#3561399
            //
            // It needs this ability, so users of NLog can set a requestId variable in NLog
            // before the server side component tries to log the client side log message
            // through an NLog logger.
            // Unlike Log4Net, NLog doesn't allow you to register an object whose ToString()
            // is only called when it tries to log something, so the requestId has to be 
            // determined right at the start of request processing.
            try
            {
                // If a request is in progress, abort it.
                // Otherwise, it may call the success callback, which will be very confusing.
                // It may also stop the inflight request from resulting in a log at the server.

                var xhrState = this.xhr.readyState;
                if ((xhrState != 0) && (xhrState != 4)) {
                    this.xhr.abort();
                }

                // Only determine the url right before you send a log request.
                // Do not set the url when constructing the appender.
                //
                // This is because the server side component sets defaultAjaxUrl
                // in a call to setOptions, AFTER the JL object and the default appender
                // have been created. 

                var ajaxUrl: string = "/jsnlog.logger";

                // This evaluates to true if defaultAjaxUrl is null or undefined
                if (!(JL.defaultAjaxUrl == null))
                {
                    ajaxUrl = JL.defaultAjaxUrl;
                }

                if (this.url)
                {
                    ajaxUrl = this.url;
                }

                this.xhr.open('POST', ajaxUrl);
                this.xhr.setRequestHeader('Content-Type', 'application/json');
                this.xhr.setRequestHeader('JSNLog-RequestId', JL.requestId);

                var that = this;
                this.xhr.onreadystatechange = function () {

                    // On most browsers, if the request fails (eg. internet is gone),
                    // it will set xhr.readyState == 4 and xhr.status != 200 (0 if request could not be sent) immediately.
                    // However, Edge and IE will not change the readyState at all if the internet goes away while waiting
                    // for a response.

                    if ((that.xhr.readyState == 4) && (that.xhr.status >= 200 && that.xhr.status < 300)) {
                        successCallback();
                    }
                };

                var json: any = {
                    r: JL.requestId,
                    lg: logItems
                };

                // call beforeSend callback
                // first try the callback on the appender
                // then the global defaultBeforeSend callback
                if (typeof this.beforeSend === 'function') {
                    this.beforeSend.call(this, this.xhr, json);
                } else if (typeof JL.defaultBeforeSend === 'function') {
                    JL.defaultBeforeSend.call(this, this.xhr, json);
                }

                var finalmsg = JSON.stringify(json);

                this.xhr.send(finalmsg);
            } catch (e) { }
        }

        constructor(appenderName: string)
        {
            super(appenderName, AjaxAppender.prototype.sendLogItemsAjax);

            this.xhr = JL._createXMLHttpRequest();
        }
    }

    // ---------------------

    export class ConsoleAppender extends Appender implements JSNLogConsoleAppender
    {

        private clog(logEntry: string)
        {
            JL._console.log(logEntry);
        }

        private cerror(logEntry: string)
        {
            if (JL._console.error)
            {
                JL._console.error(logEntry);
            } else
            {
                this.clog(logEntry);
            }
        }

        private cwarn(logEntry: string)
        {
            if (JL._console.warn)
            {
                JL._console.warn(logEntry);
            } else
            {
                this.clog(logEntry);
            }
        }

        private cinfo(logEntry: string)
        {
            if (JL._console.info)
            {
                JL._console.info(logEntry);
            } else
            {
                this.clog(logEntry);
            }
        }

        // IE11 has a console.debug function. But its console doesn't have 
        // the option to show/hide debug messages (the same way Chrome and FF do),
        // even though it does have such buttons for Error, Warn, Info.
        //
        // For now, this means that debug messages can not be hidden on IE.
        // Live with this, seeing that it works fine on FF and Chrome, which
        // will be much more popular with developers.
        private cdebug(logEntry: string)
        {
            if (JL._console.debug)
            {
                JL._console.debug(logEntry);
            } else
            {
                this.cinfo(logEntry);
            }
        }

        public sendLogItemsConsole(logItems: LogItem[], successCallback: () => void): void
        {
            try
            {
                if (!JL._console) { return; }

                var i;
                for (i = 0; i < logItems.length; ++i)
                {
                    var li = logItems[i];
                    var msg = li.n + ": " + li.m;

                    // Only log the timestamp if we're on the server
                    // (window is undefined). On the browser, the user
                    // sees the log entry probably immediately, so in that case
                    // the timestamp is clutter.
                    if (typeof window === 'undefined')
                    {
                        msg = new Date(li.t) + " | " + msg;
                    }

                    if (li.l <= JL.getDebugLevel())
                    {
                        this.cdebug(msg);
                    } else if (li.l <= JL.getInfoLevel())
                    {
                        this.cinfo(msg);
                    } else if (li.l <= JL.getWarnLevel())
                    {
                        this.cwarn(msg);
                    } else
                    {
                        this.cerror(msg);
                    }
                }
            } catch (e)
            {
            }

            successCallback();
        }

        constructor(appenderName: string)
        {
            super(appenderName, ConsoleAppender.prototype.sendLogItemsConsole);
        }
    }

    // --------------------

    export class Logger implements JSNLogLogger, JSNLogFilterOptions
    {
        public appenders: Appender[];

        // Array of strings with regular expressions. Used to stop duplicate messages.
        // If a message matches a regex
        // that has been matched before, that message will not be sent.
        public onceOnly: string[];

        public level: number;
        public userAgentRegex: string;
        public ipRegex: string;
        public disallow: string;

        // Used to remember which regexes in onceOnly have been successfully 
        // matched against a message. Index into this array is same as index
        // in onceOnly of the corresponding regex.
        // When a regex has never been matched, the corresponding entry in this
        // array is undefined, which is falsey.
        private seenRegexes: boolean[];

        constructor(public loggerName: string)
        {
            // Create seenRexes, otherwise this logger will use the seenRexes
            // of its parent via the prototype chain.
            this.seenRegexes = [];
        }

        public setOptions(options: JSNLogLoggerOptions): JSNLogLogger
        {
            copyProperty("level", options, this);
            copyProperty("userAgentRegex", options, this);
            copyProperty("disallow", options, this);
            copyProperty("ipRegex", options, this);
            copyProperty("appenders", options, this);
            copyProperty("onceOnly", options, this);

            // Reset seenRegexes, in case onceOnly has been changed.
            this.seenRegexes = [];

            return this;
        }

        // Turns an exception into an object that can be sent to the server.
        private buildExceptionObject(e: any): any
        {
            var excObject: any = {};

            if (e.stack) { excObject.stack = e.stack; } else { excObject.e = e; }
            if (e.message) { excObject.message = e.message; }
            if (e.name) { excObject.name = e.name; }
            if (e.data) { excObject.data = e.data; }
            if (e.inner) { excObject.inner = this.buildExceptionObject(e.inner); }

            return excObject;
        }

        // Logs a log item.
        // Parameter e contains an exception (or null or undefined).
        //
        // Reason that processing exceptions is done at this low level is that
        // 1) no need to spend the cpu cycles if the logger is switched off
        // 2) fatalException takes both a logObject and an exception, and the logObject
        //    may be a function that should only be executed if the logger is switched on.
        //
        // If an exception is passed in, the contents of logObject is attached to the exception
        // object in a new property logData.
        // The resulting exception object is than worked into a message to the server.
        //
        // If there is no exception, logObject itself is worked into the message to the server.
        public log(level: number, logObject: any, e?: any): JSNLogLogger
        {
            var i: number = 0;
            var compositeMessage: StringifiedLogObject;
            var excObject: any;

            // If we can't find any appenders, do nothing
            if (!this.appenders) { return this; }

            if (((level >= this.level)) && allow(this))
            {
                if (e) 
                {
                    excObject = this.buildExceptionObject(e);
                    excObject.logData = stringifyLogObjectFunction(logObject);
                }
                else
                {
                    excObject = logObject;
                }

                compositeMessage = stringifyLogObject(excObject);

                if (allowMessage(this, compositeMessage.finalString))
                {

                    // See whether message is a duplicate

                    if (this.onceOnly)
                    {
                        i = this.onceOnly.length - 1;
                        while (i >= 0)
                        {
                            if (new RegExp(this.onceOnly[i]).test(compositeMessage.finalString))
                            {
                                if (this.seenRegexes[i])
                                {
                                    return this;
                                }

                                this.seenRegexes[i] = true;
                            }

                            i--;
                        }
                    }

                    // Pass message to all appenders

                    // Note that these appenders could be Winston transports
                    // https://github.com/flatiron/winston

                    compositeMessage.meta = compositeMessage.meta || {};

                    // Note that if the user is logging an object, compositeMessage.meta will hold a reference to that object.
                    // Do not add fields to compositeMessage.meta, otherwise the user's object will get that field out of the blue.

                    i = this.appenders.length - 1;
                    while (i >= 0)
                    {
                        this.appenders[i].log(
                            levelToString(level), compositeMessage.msg, compositeMessage.meta, function () { },
                            level, compositeMessage.finalString, this.loggerName);
                        i--;
                    }
                }
            }

            return this;
        }

        public trace(logObject: any): JSNLogLogger { return this.log(getTraceLevel(), logObject); }
        public debug(logObject: any): JSNLogLogger { return this.log(getDebugLevel(), logObject); }
        public info(logObject: any): JSNLogLogger { return this.log(getInfoLevel(), logObject); }
        public warn(logObject: any): JSNLogLogger { return this.log(getWarnLevel(), logObject); }
        public error(logObject: any): JSNLogLogger { return this.log(getErrorLevel(), logObject); }
        public fatal(logObject: any): JSNLogLogger { return this.log(getFatalLevel(), logObject); }
        public fatalException(logObject: any, e: any): JSNLogLogger { return this.log(getFatalLevel(), logObject, e); }
    }

    export function createAjaxAppender(appenderName: string): JSNLogAjaxAppender
    {
        return new AjaxAppender(appenderName);
    }

    export function createConsoleAppender(appenderName: string): JSNLogConsoleAppender
    {
        return new ConsoleAppender(appenderName);
    }

    // -----------------------
    // In the browser, the default appender is the AjaxAppender.
    // Under nodejs (where there is no "window"), use the ConsoleAppender instead.
    // 
    // Do NOT create an AjaxAppender object if you are not on a browser (that is, window is not defined).
    // That would try to create an XmlHttpRequest object, which will crash outside a browser.

    var defaultAppender: Appender = new ConsoleAppender("");
    if (typeof window !== 'undefined')
    {
        defaultAppender = new AjaxAppender("");
    }

    // Create root logger
    //
    // Note that this is the parent of all other loggers.
    // Logger "x" will be stored at
    // JL.__.x
    // Logger "x.y" at
    // JL.__.x.y
    export var __ = new JL.Logger("");
    JL.__.setOptions(
        {
            level: JL.getDebugLevel(),
            appenders: [defaultAppender]
        });
}
    
// Support CommonJS module format 

declare var exports: any;
if (typeof exports !== 'undefined')
{
    exports.JL = JL;
}

// Support AMD module format

var define: any;
if (typeof define == 'function' && define.amd)
{
    define('jsnlog', [], function () {
        return JL;
    });
}

// If the __jsnlog_configure global function has been
// created, call it now. This allows you to create a global function
// setting logger options etc. inline in the page before jsnlog.js
// has been loaded.

if (typeof __jsnlog_configure == 'function') { __jsnlog_configure(JL); }

// Create onerror handler to log uncaught exceptions to the server side log, but only if there 
// is no such handler already.
// Must use "typeof window" here, because in NodeJs, window is not defined at all, so cannot refer to window in any way.

if (typeof window !== 'undefined' && !window.onerror) {
    window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
        // Send object with all data to server side log, using severity fatal, 
        // from logger "onerrorLogger"
        JL("onerrorLogger").fatalException({
            "msg": "Uncaught Exception",
            "errorMsg": errorMsg, "url": url,
            "line number": lineNumber, "column": column
        }, errorObj);

        // Tell browser to run its own error handler as well   
        return false;
    }
}

// Deal with unhandled exceptions thrown in promises
if (typeof window !== 'undefined' && !(<any>window).onunhandledrejection) {
    (<any>window).onunhandledrejection = function (event) {

        // Send object with all data to server side log, using severity fatal, 
        // from logger "onerrorLogger"
        JL("onerrorLogger").fatalException({
            "msg": "unhandledrejection",
            "errorMsg": event.reason ? event.reason.message : null
        }, event.reason);
    };
}


