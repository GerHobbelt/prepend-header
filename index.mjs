#!/usr/bin/env node

import process from 'process';
import prependFile from 'prepend-to-js-file';
import GlobFS from 'glob-fs';
const glob = GlobFS({ gitignore: false });
import fs from 'fs';
import path from 'path';
import minimist from 'minimist';
const args = minimist(process.argv.slice(2));
import isGlob from 'is-glob';
import { fileURLToPath } from 'url';
// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appPath = __dirname; // path.dirname(require.main.filename);
import { flatten, readFilePromise } from './utils.mjs';
const flatArgs = flatten(Object.values(args));
const pkg = JSON.parse(fs.readFileSync(path.normalize(path.join(__dirname, 'package.json')), 'utf8'));

if (!flatArgs.length) {
  console.log(
    `
    version: ${ pkg.version /* process.env.npm_package_version */ }
    usage: prepend-header [filepath/globpath] [headerpath]
    example: prepend-header src/**/*.scss header.config.js
  `);
  process.exit(1);
}
const filesOrGlobs = flatArgs.slice(0, flatArgs.length - 1);
const headerPath = flatArgs[flatArgs.length - 1].replace(/[\\]/g, '/');


// https://stackoverflow.com/questions/38946112/es6-import-error-handling
class ImportError extends Error {}

async function loadHeader(headerPath) {
  let h;
  try {
    h = await import(headerPath);
  } catch (e) {
    console.log(`Unable to import module ${headerPath}`, e);
    throw new ImportError(`Unable to import module ${headerPath}: ${e}`);
  }
  return h;
}

function importHeaderJS(headerPath) {
  return new Promise((resolve, reject) => {
    if (path.isAbsolute(headerPath)) {
      headerPath = path.normalize(headerPath).replace(/[\\]/g, '/');
      loadHeader('file://' + headerPath).then((data, err) => {
        console.log('loadHeader ->', {headerPath, data, err});
        if (err) {
          p = `${appPath}/header.config.mjs`;
          p = path.normalize(p).replace(/[\\]/g, '/');
          loadHeader('file://' + p).then((data2, err2) => {
            console.log('loadHeader ->', {p, data2, err2});
            if (err2) {
              console.log(`Unable to prepend, because no valid header javascript file in app root or passed as path. Argument passed: ${headerPath}`);
              //process.exit(1);
              reject(err);   // reject with original error
            } else {
              resolve(data2);
            }
          }).catch((err) => {
            console.error('headerPromise error', err)
            reject(err);
          }).finally(() => {
            console.error('headerPromise final.')
          });
        } else {
          resolve(data);
        }
      }).catch((err) => {
        console.error('headerPromise error', err)
        reject(err);
      }).finally(() => {
        console.error('headerPromise final.')
      });
    } else {
      let p = path.join(process.cwd(), headerPath);
      p = path.normalize(p).replace(/[\\]/g, '/');
      loadHeader('file://' + p).then((data, err) => {
        console.log('loadHeader ->', {p, data, err});
        if (err) {
          p = `${appPath}/header.config.mjs`;
          p = path.normalize(p).replace(/[\\]/g, '/');
          loadHeader('file://' + p).then((data2, err2) => {
            console.log('loadHeader ->', {p, data2, err2});
            if (err2) {
              console.log(`Unable to prepend, because no valid header javascript file in app root or passed as path. Argument passed: ${headerPath}`);
              //process.exit(1);
              reject(err);   // reject with original error
            } else {
              resolve(data2);
            }
          }).catch((err) => {
            console.error('headerPromise error', err)
            reject(err);
          }).finally(() => {
            console.error('headerPromise final.')
          });
        } else {
          resolve(data);
        }
      }).catch((err) => {
        console.error('headerPromise error', err)
        reject(err);
      }).finally(() => {
        console.error('headerPromise final.')
      });
    }
  });
}

let headerPromise = importHeaderJS(headerPath);

const prependHeader = (filePath, text) => {
  console.log('prependHeader...')
  return new Promise((resolve, reject) => {
    // grab headerTxt from global
    console.log('prependFile...')
    prependFile(filePath, text, (data, err) => {
      console.log('prependFile ->', {data, err})
      if (err) {
        console.log('Could not prepend header.');
        reject(err);
      }
      console.log(`repended to ${filePath}`);
      resolve();
    });
  });
};

const conditionallyReadAndPrependHeaderToFile = filePath => {
console.log('conditionallyReadAndPrependHeaderToFile', filePath);

  readFilePromise(filePath).then(output => {
    // don't accidentally double-append.
console.log('output....', output);
    console.log('before headerPromise...')
    headerPromise.then((hdata, herr) => {
      console.log('headerPromise', {hdata, herr})

      let header = hdata.default;

      if (!output.includes(header.match)) {
        console.log(`appending header to ${filePath}.)`)
        prependHeader(filePath, header.text).then((d, e) => {
          console.log('prependHeader ->', {d, e})
        }).catch((err) => {
          console.error('prependHeader error', err)
        }).finally(() => {
          console.error('prependHeader final.')
        });
      } else {
        console.log(`(Header already exists in ${filePath}.)`)
      }
    }).catch((err) => {
      console.error('headerPromise error', err)
    }).finally(() => {
      console.error('headerPromise final.')
    });
  }).catch((err) => {
    console.error('readFilePromise error', err)
  }).finally(() => {
    console.error('readFilePromise final.')
  });

console.log('conditionallyReadAndPrependHeaderToFile END');
};

// all this complex logic to basically check if user is passing a glob (e.g. [src-web/**/*.js])
// or an array of files
// (natural bash globbing e.g  [ 'src-web/thing/thing2/after.scss', 'src-web/thing/thing2/after1.scss'

const isFile = path => {
  return fs.existsSync(path) ? !fs.statSync(path).isDirectory() : false;
};

const getFilesFromGlob = globPattern => {
  try {
    const files = glob.readdirSync(globPattern).filter(isFile);
    return files;
  } catch (err) {
    return [];
  }
};


process.on('unhandledRejection', (reason) => {
    console.log('ERROR: Reason: ' + reason);
});

// so essentially, whether or not the thing has quotes should not matter.
const fileList = filesOrGlobs.filter(isFile);
const globList = filesOrGlobs.filter(isGlob);

if (!filesOrGlobs.length) {
  console.log(
    '--> Missing files argument. Please include a valid file or directory path such as src-web.');
} else {
  // map over all files and prepend the license.
  if (globList.length) {
    const files = flatten(globList.map(getFilesFromGlob));

    if (files.length) {
      files.forEach(conditionallyReadAndPrependHeaderToFile);
    } else {
      console.log('No files from glob found.');
    }
  }
  if (fileList.length) {
    fileList.forEach(conditionallyReadAndPrependHeaderToFile);
  }
}

//process.exit(0);  <-- DO NOT do that here: https://github.com/nodejs/node/issues/22088
process.exitCode = 0;
