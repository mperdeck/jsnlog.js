__CopyrightMessage__

__DefinitelyTypedHeading__

declare namespace JL {
	__NonJlInterfaces__
	
	// Interface to be used when dependency injecting JSNLog into a class
	interface JSNLog {
		__JlFunctionExports.ForInterface__
		
		(loggerName?: string): JL.JSNLogLogger;
	}
}

// Declaration of JSNLog as the global symbol JL,
// for when jsnlog.js is directly loaded via a script tag

__AmbientJLDeclaration__

declare namespace JL {
	__JlFunctionExports__
	
	__ExceptionClass__
}

// This file is listed in the typings element in the package.json file.
// To make that work, this file must be recognized as a "module".
// For this, the file must have an export statement.
export { JL };
