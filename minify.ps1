# Compiles jsnlog.ts into jsnlog.js, and then minifies into jsnlog.min.js

# If the below throws an error, install the compiler: npm install -g typescript
tsc -sourcemap jsnlog.ts

& "C:\Program Files (x86)\Java\jre1.8.0_40\bin\java.exe" -jar "C:\Program Files (x86)\Java\jars\Google Closure Compiler\compiler.jar" --js jsnlog.js --js_output_file=jsnlog.min.js

cd Definitions 
& cmd.exe /c generate.bat
cd ..
