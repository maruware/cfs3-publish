# cfs3-deploy
Deploy Tool for CloudFront + S3 with npm scripts.

## Install

```
npm install -D cfs3-deploy
```

or

```
yarn add -D cfs3-deploy
```

## Usage

* S3 and CloudFront

```js
const { deployAndInvalidate } = require('cfs3-deploy')
// or import { deployAndInvalidate } from 'cfs3-deploy' /* TypeScript */

deployAndInvalidate(
  {
    pattern: 'dist/**',
    params: {
      Bucket: bucket
    }
  },
  {
    distributionId,
    paths: ['/*'],
    wait: true
  }
)
```

* S3

```js
const { deploy } = require('cfs3-deploy')

deploy(
  {
    pattern: 'dist/**',
    params: {
      Bucket: bucket
    }
  }
)
```

* CloudFront

```js
const { invalidate } = require('cfs3-deploy')

invalidate(
  {
    distributionId,
    paths: ['/*'],
    wait: true
  }
)
```
