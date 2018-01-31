# Compiles jsnlog.ts into jsnlog.js, and then minifies into jsnlog.min.js
#
# This script has dependencies on the other projects in the JSNLog ecosystem. So it is not widely useful.
# To compile your jsnlog.ts file, use TypeScript compiler. To minify the .js file, you could use google closure compiler, or any other uglifier.

Write-Host "------ jsnlog.js/minify.ps1 -------"

# Delete generated files. That way, if compilation/minification goes wrong, you'll know about it.
If (Test-Path "jsnlog.js"){ Remove-Item "jsnlog.js" }
If (Test-Path "jsnlog.js.map"){ Remove-Item "jsnlog.js.map" }
If (Test-Path "jsnlog.min.js"){ Remove-Item "jsnlog.min.js" }

# If the below throws an error, install the compiler: npm install -g typescript
tsc jsnlog.ts

# Remove the /// file include near the top of jsnlog.js
# If you don't, Visual Studio generates warnings that the defintion file is missing
cd C:\Dev\JSNLog\jsnlog.js
Get-Content jsnlog.js | Where { $_ -notmatch "^///" } | Set-Content jsnlog.cleaned.js -Encoding ASCII
del jsnlog.js
ren jsnlog.cleaned.js jsnlog.js

# You can find the google closure compiler at
# https://github.com/google/closure-compiler
& java.exe -jar "C:\Utils\closure-compiler-v20170423.jar" --js jsnlog.js --js_output_file=jsnlog.min.js --create_source_map jsnlog.js.map


# Add header with version number and copyright notice.
cat versionheading.txt, jsnlog.js | sc jsnlog.js.temp
del jsnlog.js
ren jsnlog.js.temp jsnlog.js

cat versionheading.txt, jsnlog.min.js | sc jsnlog.min.js.temp
del jsnlog.min.js
ren jsnlog.min.js.temp jsnlog.min.js


cd Definitions/DefinitionsGenerator 
& cmd.exe /c generate.bat
cd ..
cd ..

# ------------------------------------------------
# Copy newly created jsnlog.* files to where ever copies of these files are being used

# Takes the path to a jsnlog.js file or jsnlog.js.map or jsnlog.min.js
# Overwrites these files from the jsnlog.js project directory.
# $jsnlogJsPath is the full path to a jsnlog.js or jsnlog.min.js or jsnlog.js.map file
Function CopyFromJsnlogJs([string]$jsnlogJsPath)
{
	# Get file path inside the jsnlog.js project  
	$jsnlogJsVersionFilePath = [System.IO.Path]::GetFileName($jsnlogJsPath)
	
	if ($jsnlogJsPath -ne $PSScriptRoot)
	{
		Copy-Item $jsnlogJsVersionFilePath $jsnlogJsPath
		Write-Host "Copied $jsnlogJsVersionFilePath to $jsnlogJsPath"
	}
}

# Visit all jsnlog...js files in the D:\dev\JSNLog directory (that is, the current parent directory)
# and its sub directories, and overwrite with the versions from jsnlog.js.
# Some directories with node_modules have names that are too long to deal with for PowerShell. You can't filter them out in the get-childitem, because the
# filter itself throws the "too long path" exception. So catch the exceptions in an $err variable and then process them.
get-childitem '..' -recurse -force -ErrorAction SilentlyContinue -ErrorVariable err | ?{((($_ -Match "jsnlog.min.js") -Or ($_ -Match "jsnlog.js") -Or ($_ -Match "jsnlog.js.map")) -And -Not (($_.FullName -Match "Background") -Or ($_.FullName -Match '\\jsnlog.js\\')))} | ForEach-Object { CopyFromJsnlogJs $_.FullName }
foreach ($errorRecord in $err)
{
	if (!($errorRecord.Exception -is [System.IO.PathTooLongException]))
	{
		Write-Error -ErrorRecord $errorRecord
	}
}

Write-Host "-----------------------------------"
