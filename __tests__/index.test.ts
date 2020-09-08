/* eslint-env jest */

import { deployAndInvalidate } from '../src/index'
import { statSync, createWriteStream, writeFileSync } from 'fs'

const createLargeFile = async () => {
  const path = 'tmp/large.txt'
  try {
    statSync(path)
    return
  } catch {
    const largeFile = createWriteStream(path)
    for (let i = 0; i < 1024 * 1024 * 80; i++) {
      const r = largeFile.write('a')
      if (!r) {
        await new Promise(resolve => largeFile.once('drain', resolve))
      }
    }
    largeFile.end()
  }
}

test('deployAndInvalidate', async () => {
  const bucket = process.env.BUCKET
  if (!bucket) {
    throw new Error('undefinded BUCKET')
  }
  const distributionId = process.env.CF_DISTRIBUTION_ID
  if (!distributionId) {
    throw new Error('undefined CF_DISTRIBUTION_ID')
  }

  // create large file
  await createLargeFile()
  writeFileSync('tmp/small.txt', 'small')

  await deployAndInvalidate(
    {
      pattern: 'tmp/**',
      params: {
        Bucket: bucket
      },
      deleteRemoved: true
      // deleteProtectionPatterns: ['json/**']
    },
    {
      distributionId,
      paths: ['/*'],
      wait: false
    }
  )
})
