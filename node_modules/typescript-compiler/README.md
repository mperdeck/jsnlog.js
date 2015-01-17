typescript-compiler
===================

Typescript compiler wrapper. Exposes the TypeScript command line compiler to your code.

Installing
-----------------------

    $ npm install typescript-compiler

Usage
-----------------------

Require the compiler...

```javascript
var tsc = require('typescript-compiler');
```

call it like this...

```javascript
tsc.compile(['a.ts', 'b.ts'], ['--out', 'out.js'])
```

or this..

```javascript
var js = tsc.compileString('class TSC { awesome: boolean = true; }')
```

or even this!

```javascript
var result = tsc.compileStrings({
				'ship.ts' : 'module Navy { export class Ship { isSunk: boolean; } }',
				'fleet.ts': '///<reference path="ship.ts" />\n' +
							'module Navy { \n' +
							'export class Fleet { ships: Ship[] } '+
							'}'
			})
```

_Did you notice you can use **///&lt;reference />** tags?_

## Module Interface

**Note:** A `?` indicates an optional parameter

### Common Parameters

All Methods accept the following parameters:

> **tscArgs?** : `string[]`|`string`, <br>
> &nbsp; &nbsp; &nbsp; &nbsp; The same [arguments you can pass to tsc](#tsc-arguments) when you run it from the command line <br>
> **options?** : [`CompilerOptions`], <br>
> &nbsp; &nbsp; &nbsp; &nbsp; Options to be passed to the compiler<br>
> **onError?** : _fn_ ( [`Diagnostic`] )<br>
> &nbsp; &nbsp; &nbsp; &nbsp; A function you want called for each error the compiler encounters.

### Compilation Methods

#### `compile(files, tscArgs?, options?, onError?)`

> **input** : `string`|`string[]`<br>
> &nbsp; &nbsp; &nbsp; &nbsp; The name of the file or an array of file names to compile.<br>
> **returns** [`CompilationResult`]

&nbsp; &nbsp; &nbsp; &nbsp; _Compiles one or many files_

##### &nbsp; &nbsp; &nbsp; &nbsp; Example

> ```javascript
>     tsc.compile(['test/cases/ship.ts', 'test/cases/fleet.ts'],
>     				'-m commonjs -t ES5 --out test/tmp/navy.js');
> ```

#### `compileString(input, tscArgs?, options?, onError?)`

> **input** : [`Map<string>`]|[`StringSource[]`][`StringSource`]|`string[]` <br>
> &nbsp; &nbsp; &nbsp; &nbsp; The source to compile or an array of sources. The source(s) can be passed as strings or [`StringSource`] objects. <br>
> **returns** `string`

&nbsp; &nbsp; &nbsp; &nbsp; _Compiles a string_

##### &nbsp; &nbsp; &nbsp; &nbsp; Example

> ```javascript
> tsc.compileString('module Navy { class Ship { isSunk: boolean; } }')
> ```

#### `compileStrings(input, tscArgs?, options?, onError?)`

> **input** : [`Map<string>`]|[`StringSource`]|`string[]` <br>
> &nbsp; &nbsp; A collection of sources to be compiled.<br>
> **returns** [`CompilationResult`]

&nbsp; &nbsp; &nbsp; &nbsp; Compiles one or many strings

##### &nbsp; &nbsp; &nbsp; &nbsp; Example

> ```javascript
> tsc.compileStrings({
>     "ship.ts"  : 'module Navy { export class Ship { isSunk: boolean; }}',
>     "fleet.ts": '///<reference path="ship.ts" />\n' +
>                 'module Navy { export class Fleet { ships: Ship[] }}'
>    },
>    // tscArgs
>    '--module commonjs -t ES5 --out navy.js',
>    // options (DEPRECATED, will be removed in the next version)
>    null,
>    // onError
>    function(e) { console.log(e) }
> )
> ```


#### TSC arguments

When in doubt about what you can pass in the `tscArgs` param you can run the compiler from the command line to get some help. Every option you see below is accepted as a value for the `tscArgs` array.

```
$ tsc
Version 1.1.0.1
Syntax:   tsc [options] [file ...]

Examples: tsc hello.ts
          tsc --out foo.js foo.ts
          tsc @args.txt

Options:
 -d, --declaration  Generates corresponding '.d.ts' file.
 -h, --help         Print this message.
 --mapRoot          Specifies the location where debugger should locate map files instead of generated locations.
 -m, --module       Specify module code generation: 'commonjs' or 'amd'
 --noImplicitAny    Warn on expressions and declarations with an implied 'any' type.
 --out              Concatenate and emit output to single file.
 --outDir           Redirect output structure to the directory.
 --removeComments   Do not emit comments to output.
 --sourceMap        Generates corresponding '.map' file.
 --sourceRoot       Specifies the location where debugger should locate TypeScript files instead of source locations.
 -t, --target       Specify ECMAScript target version: 'ES3' (default), or 'ES5'
 -v, --version      Print the compiler's version.
 -w, --watch        Watch input files.
 @<file>            Insert command line options and files from a file.
```

[`CompilerOptions`]: https://github.com/theblacksmith/typescript-compiler/wiki/Interfaces#compileroptions
[`Diagnostic`]: https://github.com/theblacksmith/typescript-compiler/wiki/Interfaces#diagnostic
[`CompilationResult`]: https://github.com/theblacksmith/typescript-compiler/wiki/Interfaces#compilationresult
[`StringSource`]: https://github.com/theblacksmith/typescript-compiler/wiki/Interfaces#stringsource-class
[`Map<string>`]: https://github.com/theblacksmith/typescript-compiler/wiki/Interfaces#map
