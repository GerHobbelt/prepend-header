# Prepend custom text to file(s) based on specified globbing pattern.

## Set-up:

1. Install locally: `npm install prepend-header --save-dev`
2. create a `header.js` that looks something like:
```js
const year = new Date().getFullYear();
const text = `/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation ${year}. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

`;

const match = 'Reserved';
module.exports = {
  text,
  match,
};

```
3. Run in command line: `npx <GLOB> <HEADERPATH>`

###  Example(s):
  - `prepend-header src-web/**/*.js '../../header.js'  (all js files matching glob)`.
  - `prepend-header src-web/after.js '../../header.js'  (single file)`

Successful Output should look like:
```
[FILES from src-web/**/*]
Prepended to src-web/after1.js
Prepended to src-web/foo/after2.js
Prepended to src-web/foo/after3.js
```
