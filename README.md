# cfs3-publish

Deploy and Invalidation Tool for CloudFront + S3 with npm scripts.

![ttyrec](https://user-images.githubusercontent.com/1129887/71441736-11ea8e80-2746-11ea-953e-2c21511037c6.gif)


## Install

```
npm install -D cfs3-publish
```

or

```
yarn add -D cfs3-publish
```

## Usage

* S3 and CloudFront (using ENV)

```js
const { deployAndInvalidate } = require('cfs3-publish')
// or import { deployAndInvalidate } from 'cfs3-publish' /* TypeScript */

deployAndInvalidate(
  {
    pattern: 'dist/**',
    params: {
      Bucket: bucket,
      'Cache-Control': 'max-age=300, no-transform, public'
    }
  },
  {
    distributionId,
    paths: ['/*'],
    wait: true
  }
)
```

* S3 and CloudFront (setting Access Key)

```js
const { deployAndInvalidate } = require('cfs3-publish')
// or import { deployAndInvalidate } from 'cfs3-publish' /* TypeScript */

deployAndInvalidate(
  {
    pattern: 'dist/**',
    config: {
      accessKeyId: 'YOUR_KEY',
      secretAccessKey: 'YOUR_SECRET'
    },
    params: {
      Bucket: bucket
    }
  },
  {
    distributionId,
    config: {
      accessKeyId: 'YOUR_KEY',
      secretAccessKey: 'YOUR_SECRET'
    },
    paths: ['/*'],
    wait: true
  }
)
```

* Delete old files

```js
const { deployAndInvalidate } = require('cfs3-publish')

deployAndInvalidate(
  {
    pattern: 'dist/**',
    params: {
      Bucket: bucket,
      'Cache-Control': 'max-age=300, no-transform, public'
    },
    deleteRemoved: true,
    deleteProtectionPatterns: [
      'json/**',
      'videos/**'
    ]
  },
  {
    distributionId,
    paths: ['/*'],
    wait: true
  }
)
```

* S3 Only

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

* CloudFront Invalidation only

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
