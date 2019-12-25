import { deployAndInvalidate } from '../src/index'

const proc = async () => {
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
      pattern: 'tmp/**',
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
}

proc()
