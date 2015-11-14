# JSNLog.js

JSNLog.js is a tiny (2kb min+gz) JavaScript logging library. 
* It has lots of options to reduce the amount of log data, so you get only the data you need.
* It sends log data to the server where you can store it.

Details and documentation:
[js.jsnlog.com](http://www.jsnlog.com)

License:
[MIT](https://raw.githubusercontent.com/mperdeck/jsnlog.js/master/License)

# Integrate with server side logging

* [JSNLog for .Net](http://www.jsnlog.com) - Combines jsnlog.js with a .Net handler to automatically store client side log data in your server side logs. Supports Log4net, Nlog, Elmah, Common.Logging. Also lets you configure client side loggers in your web.config.
* [JSNLog for PHP](http://php.jsnlog.com/) - PHP handler that receives log data from JSNLog.js and stores it on the server.
* [JSNLog for Node.js](http://nodejs.jsnlog.com) - Use jsnlog.js on both the client and the server. Client side log messages are sent to the server where they are stored in your server side logs. Supports Winston transports.
* [Open an issue]() if you want to build a server side handler for another language.

