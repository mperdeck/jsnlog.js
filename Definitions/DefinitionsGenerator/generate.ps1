# This file generates jsnlog.d.ts out of the other .d.ts files in this directory.
# jsnlog.d.ts is ready to be used on DefinitelyTyped.
#
# jsnlog.d.ts is used in the tests that are mandated by DefinitelyTyped
# Reason that we can't simply use jl.d.ts:
# It contains all interface definitions and the ambient declaration of the JL object.
# However, those interface definitions are imported in jsnlog.ts for type checking purposes as well.
# And importing the ambient JL declaration into jsnlog.ts leads to a TypeScript compile error,
# because it conflicts with the JL declarations in jsnlog.ts itself.
# See
# http://stackoverflow.com/questions/20614746/typescript-module-x-cannot-merge-with-previous-declaration-of-x-in-a-different
# 

Function BuildDefinitionsFile([string]$templateFile, [string]$outputFile)
{
    $copyrightMessage = Get-Content ".\jsnlog.CopyrightMessage.txt" -Raw
    $definitelyTypedHeading = Get-Content ".\jsnlog.DefinitelyTypedHeading.txt" -Raw
    $nonJlInterfaces = Get-Content ".\jsnlog.NonJlInterfaces.txt" -Raw
    $ambientJLDeclaration = Get-Content ".\jsnlog.AmbientJLDeclaration.txt" -Raw
    $jlFunctionExports = Get-Content ".\jsnlog.JlFunctionExports.txt" -Raw
    $exceptionClass = Get-Content ".\jsnlog.ExceptionClass.txt" -Raw
	
    $jlFunctionExportsForInterface = $jlFunctionExports -replace "export function ", ""

    $input = Get-Content $templateFile
	
    $input = $input -replace "__CopyrightMessage__", $copyrightMessage
    $input = $input -replace "__DefinitelyTypedHeading__", $definitelyTypedHeading
    $input = $input -replace "__NonJlInterfaces__", $nonJlInterfaces
    $input = $input -replace "__AmbientJLDeclaration__", $ambientJLDeclaration
    $input = $input -replace "__JlFunctionExports__", $jlFunctionExports
    $input = $input -replace "__JlFunctionExports.ForInterface__", $jlFunctionExportsForInterface
    $input = $input -replace "__ExceptionClass__", $exceptionClass

    $input | Out-File $outputFile
}

Write-Host "Build jl.d.ts"
BuildDefinitionsFile "./jl.d.ts.template" "../jl.d.ts"

Write-Host "Build jsnlog.d.ts"
BuildDefinitionsFile "./jsnlog.d.ts.template" "../jsnlog.d.ts"

Write-Host "Build jsnlog_interfaces.d.ts"
BuildDefinitionsFile "./jsnlog_interfaces.d.ts.template" "../jsnlog_interfaces.d.ts"

cd ..

Write-Host "Run tests, as mandated by DefinitelyTyped"
tsc --noImplicitAny -sourcemap jsnlog-tests.ts

cd DefinitionsGenerator


