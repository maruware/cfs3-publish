/* eslint-env jest */

import { deployS3 } from '../src/s3'

test('deployS3', async () => {
  const bucket = process.env.BUCKET
  if (!bucket) {
    throw new Error('undefinded BUCKET')
  }
  const tasks = await deployS3({
    pattern: '__tests__/**',
    params: {
      Bucket: bucket
    }
  })
  await tasks.run()
})
