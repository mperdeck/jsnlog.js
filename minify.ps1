# Compiles jsnlog.ts into jsnlog.js, and then minifies into jsnlog.min.js

Write-Host "------ jsnlog.js/minify.ps1 -------"

# If the below throws an error, install the compiler: npm install -g typescript
tsc -sourcemap jsnlog.ts

& java.exe -jar "C:\Program Files (x86)\Java\jars\Google Closure Compiler\compiler.jar" --js jsnlog.js --js_output_file=jsnlog.min.js

cd Definitions 
& cmd.exe /c generate.bat
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
	
	Copy-Item $jsnlogJsVersionFilePath $jsnlogJsPath

    Write-Host "Copied $jsnlogJsVersionFilePath to $jsnlogJsPath"
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
