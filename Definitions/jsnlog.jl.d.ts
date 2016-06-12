
// Ambient declaration of the JL object itself

//########## declare var JL: JL.JSNLogStatic;

/***
import JSNLogAppender = JL.JSNLogAppender
import JSNLogAppenderOptions = JL.JSNLogAppenderOptions
import JSNLogAjaxAppender = JL.JSNLogAjaxAppender
import JSNLogAjaxAppenderOptions = JL.JSNLogAjaxAppenderOptions
import JSNLogConsoleAppender = JL.JSNLogConsoleAppender
import JSNLogFilterOptions = JL.JSNLogFilterOptions
import JSNLogLogger = JL.JSNLogLogger
import JSNLogLoggerOptions = JL.JSNLogLoggerOptions
import JSNLogOptions = JL.JSNLogOptions
****/
//######### import JSNLogStatic = JL.JSNLogStatic

declare function JL(loggerName?: string): JL.JSNLogLogger;

