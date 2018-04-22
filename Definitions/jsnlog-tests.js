/// <reference path="jsnlog.d.ts" />
// ----------------------------------------------------------
// JL
var offLevel = JL.getOffLevel();
var traceLevel = JL.getTraceLevel();
var debugLevel = JL.getDebugLevel();
var infoLevel = JL.getInfoLevel();
var warnLevel = JL.getWarnLevel();
var errorLevel = JL.getErrorLevel();
var fatalLevel = JL.getFatalLevel();
var allLevel = JL.getAllLevel();
function specialSerialize(object) {
    return '';
}
JL.setOptions({
    enabled: true,
    maxMessages: 5,
    defaultAjaxUrl: '/jsnlog.logger',
    clientIP: '0.0.0.0',
    requestId: 'a reuest id',
    defaultBeforeSend: null,
    serialize: specialSerialize
});
// ----------------------------------------------------------
// Exception
var e = new JL.Exception("i is too small!");
// ----------------------------------------------------------
// Ajax Appender
var ajaxAppender1 = JL.createAjaxAppender('ajaxAppender');
ajaxAppender1.setOptions({
    level: 5000,
    ipRegex: 'a regex',
    userAgentRegex: 'a user agent string',
    disallow: 'regex matching suppressed messages',
    sendWithBufferLevel: 5000,
    storeInBufferLevel: 2000,
    bufferSize: 10,
    batchSize: 2,
    url: '/jsnlog.logger',
    beforeSend: null
});
ajaxAppender1.sendBatch();
// ----------------------------------------------------------
// Console Appender
var consoleAppender1 = JL.createConsoleAppender('consoleAppender');
consoleAppender1.setOptions({
    level: 5000,
    ipRegex: 'a regex',
    userAgentRegex: 'a user agent string',
    disallow: 'regex matching suppressed messages',
    sendWithBufferLevel: 5000,
    storeInBufferLevel: 2000,
    bufferSize: 10,
    batchSize: 2
});
consoleAppender1.sendBatch();
// ----------------------------------------------------------
// Loggers
var logger1 = JL('mylogger');
var exception = {};
logger1.trace('log message').debug({ x: 1, y: 2 });
logger1.info(function () { return 5; });
logger1.warn('log message');
logger1.error('log message');
logger1.fatal('log message');
logger1.fatalException('log message', exception);
logger1.log(4000, 'log message', exception);
logger1.setOptions({
    level: 5000,
    ipRegex: 'a regex',
    userAgentRegex: 'a user agent string',
    disallow: 'regex matching suppressed messages',
    appenders: [ajaxAppender1, consoleAppender1],
    onceOnly: ['regex1', 'regex2']
});
//# sourceMappingURL=jsnlog-tests.js.map