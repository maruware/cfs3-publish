/* eslint-env jest */

import { deploy, invalidate, deployAndInvalidate } from '../src/index'

test('deploy', async () => {
  const bucket = process.env.BUCKET
  if (!bucket) {
    throw new Error('undefinded BUCKET')
  }
  await deploy({
    pattern: '__tests__/**',
    params: {
      Bucket: bucket
    }
  })
})

test('invalidate', async () => {
  const distributionId = process.env.CF_DISTRIBUTION_ID
  if (!distributionId) {
    throw new Error('undefined CF_DISTRIBUTION_ID')
  }
  await invalidate({
    distributionId,
    paths: ['/*'],
    wait: false
  })
})

test('deployAndInvalidate', async () => {
  const bucket = process.env.BUCKET
  if (!bucket) {
    throw new Error('undefinded BUCKET')
  }
  const distributionId = process.env.CF_DISTRIBUTION_ID
  if (!distributionId) {
    throw new Error('undefined CF_DISTRIBUTION_ID')
  }

  await deployAndInvalidate(
    {
      pattern: '__tests__/**',
      params: {
        Bucket: bucket
      }
    },
    {
      distributionId,
      paths: ['/*'],
      wait: false
    }
  )
})
