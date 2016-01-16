rem Compiles jsnlog.ts into jsnlog.js, and then minifies into jsnlog.min.js
rem Updates all copies of the jsnlog.* files in for example JSNLog.TestSite.

Powershell.exe -executionpolicy remotesigned -File minify.ps1

