import fs from 'fs';

export function flatten(arr) {
  return [].concat(...arr);
}

export function readFilePromise(filePath) {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    } catch (e) {
      reject(e);
    }
  });
}
