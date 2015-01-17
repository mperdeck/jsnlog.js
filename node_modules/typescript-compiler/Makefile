build:
	@echo "  Building..."
	@cp src/typescript/bin/lib.* lib/
	@node ./src/typescript/bin/tsc.js -m commonjs -t ES5 src/index.ts --out index.js
	@echo "  Done!"

.PHONY: build
