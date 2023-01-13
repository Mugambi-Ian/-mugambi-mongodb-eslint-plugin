# mugambi mongodb eslint plugin
#### Installation

To install run the following command in your project root

```shell

npm i https://github.com/Mugambi-Ian/mugambi-mongodb-eslint-plugin

```

and add the following  lines to your `.eslintrc.json` file
```json
 "plugins": ["@mugambi-mongodb",...],
  "rules": {
    "@mugambi-mongodb/check-wrong-comparison": "error"
```

#### Logic

- This rule(s) were written to help prevent the comparing of two ObjectId classes using the === operator.

- This rule(s) have been tested for assignment expressions and if statements.

Example (TS)

``` ts

import {ObjectId} from 'mongodb';

type test = ObjectId | false | null;
let x: test = new ObjectId();
let y: test = new ObjectId();
let a = false;

a = x === y; //trigger error
if (x === y) {//trigger error
  console.log('error');
}

a = x.equals(y);
if (x.equals(y)) {
  console.log('safe');
}

x = null;

a = x === y; //trigger error
if (x === y) { //trigger error
  console.log('error');
}

x = new ObjectId();
y = false;

a = x === y; //trigger error
if (x === y) {//trigger error
  console.log('error');
}

y = x;

a = x === y; //trigger error
if (x === y) {//trigger error
  console.log('error');
}

a = x.equals(y);
if (x.equals(y)) {
  console.log('safe');
}

console.log(a);
```

#### Known Issues

Currently, the rule will be enforced for variables initialized from a class with the name ObjectId. 

The targeted behavior would be to ensure that only mongoDb ObjectId variables would enforce this.


