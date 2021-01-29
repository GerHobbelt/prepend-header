import fs from 'fs';

export function flatten(arr) {
  return [].concat(...arr);
}

export function readFilePromise(filePath) {
  console.log('readFilePromise', filePath)
  return new Promise((resolve, reject) => {
    console.log('readFile', filePath)
    try {
      fs.readFile(filePath, 'utf8', (err, data) => {
        console.log('readFile:', {data, err})
        if (err) reject(err);
        resolve(data);
      });
    } catch (e) {
      console.log(e)
    }
    console.log('...')
  });
}
