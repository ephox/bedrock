import { assert } from 'chai';
import * as fc from 'fast-check';
import { describe, it } from 'mocha';
import { generateImports } from '../../../main/ts/bedrock/compiler/Imports';

const validPolyfills = [ 'ArrayBuffer', 'Map', 'Object', 'Promise', 'Set', 'Symbol', 'TypedArray', 'WeakMap', 'WeakSet' ];

const convertPolyfillName = (name: string) => {
  return name.slice(0, 1).toLowerCase() +
    name.slice(1).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
};

const withGenerateFilenames = (useRequire: boolean, extension: string, test: (imports: string, filenames: string[]) => void) => {
  fc.assert(fc.property(fc.array(fc.hexaString(1, 20), 50), (filenames) => {
    const filepaths = filenames.map((name) => `/${name}.${extension}`);
    const imports = generateImports(useRequire, `/scratch.${extension}`, filepaths, []);
    test(imports, filenames);
  }));
};

describe('Imports.generateImports', () => {
  context('TypeScript', () => {
    it('should include the specified test files (require)', () => {
      withGenerateFilenames(true, 'ts', (imports, filenames) => {
        filenames.forEach((filename) => {
          assert.include(imports, `
__currentTestFile = "/${filename}.ts";
require("${filename}");
addTest("/${filename}.ts");`
          );
        });
      });
    });

    it('should include the specified test files (import)', () => {
      withGenerateFilenames(false, 'ts', (imports, filenames) => {
        filenames.forEach((filename) => {
          assert.include(imports, `
__currentTestFile = "/${filename}.ts";
import "${filename}";
addTest("/${filename}.ts");`
          );
        });
      });
    });
  });

  context('JavaScript', () => {
    it('should include the specified test files (require)', () => {
      withGenerateFilenames(true, 'js', (imports, filenames) => {
        filenames.forEach((filename) => {
          assert.include(imports, `
__currentTestFile = "/${filename}.js";
require("${filename}");
addTest("/${filename}.js");`
          );
        });
      });
    });

    it('should include the specified test files (import)', () => {
      withGenerateFilenames(false, 'js', (imports, filenames) => {
        filenames.forEach((filename) => {
          assert.include(imports, `
__currentTestFile = "/${filename}.js";
import "${filename}";
addTest("/${filename}.js");`
          );
        });
      });
    });
  });

  it('should include an error catcher for imports', () => {
    const imports = generateImports(true, '/scratch.ts', [], []);
    assert.include(imports, 'window.addEventListener(\'error\', importErrorHandler);');
    assert.include(imports, 'window.removeEventListener(\'error\', importErrorHandler);');
  });

  it('should include the specified polyfills (require)', () => {
    fc.assert(fc.property(fc.array(fc.constantFrom(...validPolyfills)), (polyfills) => {
      const imports = generateImports(true, '/scratch.ts', [], polyfills);

      polyfills.forEach((polyfill) => {
        assert.include(imports, `require('core-js/es/${convertPolyfillName(polyfill)}');`);
      });
    }));
  });

  it('should include the specified polyfills (import)', () => {
    fc.assert(fc.property(fc.array(fc.constantFrom(...validPolyfills)), (polyfills) => {
      const imports = generateImports(false, '/scratch.ts', [], polyfills);

      polyfills.forEach((polyfill) => {
        assert.include(imports, `import 'core-js/es/${convertPolyfillName(polyfill)}';`);
      });
    }));
  });
});
