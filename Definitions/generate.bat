rem This file generates jsnlog.d.ts out of the other .d.ts files in this directory.
rem jsnlog.d.ts is ready to be used on DefinitelyTyped.
rem
rem Reason that jsnlog.d.ts has to be generated:
rem It contains all interface definitions and the ambient declaration of the JL object.
rem However, those interface definitions are imported in jsnlog.ts for type checking purposes as well.
rem And importing the ambient JL declaration into jsnlog.ts leads to a TypeScript compile error,
rem because it conflicts with the JL declarations in jsnlog.ts itself.
rem See
rem http://stackoverflow.com/questions/20614746/typescript-module-x-cannot-merge-with-previous-declaration-of-x-in-a-different
rem 

rem You must use /b (binary), otherwise copy will add a control-z character at the end of the file
copy jsnlog.DefinitelyTypedHeading.txt + jsnlog_interfaces.d.ts + jsnlog.jl.d.ts /b jsnlog.d.ts

rem Run tests, as mandated by DefinitelyTyped

call tsc --noImplicitAny -sourcemap jsnlog-tests.ts



