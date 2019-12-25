# cfs3-publish
Deploy and Invalidation Tool for CloudFront + S3 with npm scripts.

## Install

```
npm install -D cfs3-publish
```

or

```
yarn add -D cfs3-publish
```

## Usage

* S3 and CloudFront

```js
const { deployAndInvalidate } = require('cfs3-publish')
// or import { deployAndInvalidate } from 'cfs3-publish' /* TypeScript */

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
const { deploy } = require('cfs3-publish')

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
const { invalidate } = require('cfs3-publish')

invalidate(
  {
    distributionId,
    paths: ['/*'],
    wait: true
  }
)
```
