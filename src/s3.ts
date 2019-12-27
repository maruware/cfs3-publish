import glob from 'glob'
import { promisify } from 'util'
import { join, relative } from 'path'
import Listr, { ListrTask } from 'listr'
import { S3 } from 'aws-sdk'
import { createReadStream, lstatSync } from 'fs'

import keyBy from 'lodash.keyby'
import { calcMd5FromStream } from './utils/md5'
import { getContentType } from './utils/mime'

const globAsync = promisify(glob)

const resolveObjectKey = (cwd: string, base: string, filename: string) => {
  return relative(join(cwd, base), filename)
}

type FileDef = { name: string; key: string; md5: string }

const uploadFile = async (s3: S3, file: FileDef, params: DeployArgsParams) => {
  const body = createReadStream(file.name)
  const contentType = getContentType(file.name)

  const upload = new S3.ManagedUpload({
    params: {
      Key: file.key,
      Body: body,
      ContentType: contentType,
      Metadata: {
        md5: file.md5
      },
      ...params
    },
    service: s3
  })
  upload.send()
  return upload.promise()
}

const deleteRemovedObjects = async (
  s3: S3,
  bucket: string,
  files: FileDef[],
  continuationToken?: string
): Promise<void> => {
  const keyToFile = keyBy(files, 'key')
  const r = await s3
    .listObjectsV2({ Bucket: bucket, ContinuationToken: continuationToken })
    .promise()
  if (r.Contents && r.Contents.length > 0) {
    const deleteTargets: { Key: string }[] = []
    r.Contents.forEach(content => {
      const key = content.Key
      if (key && !keyToFile[key]) {
        // removed object
        deleteTargets.push({ Key: key })
      }
    })

    if (deleteTargets.length > 0) {
      await s3
        .deleteObjects({
          Bucket: bucket,
          Delete: { Objects: deleteTargets }
        })
        .promise()
    }
  }

  if (r.IsTruncated) {
    return deleteRemovedObjects(s3, bucket, files, r.NextContinuationToken)
  }
}

export type DeployArgsParams = Omit<S3.PutObjectRequest, 'Key' | 'Body'>

export type DeployArgs = {
  pattern: string
  base?: string
  config?: S3.ClientConfiguration
  params: Omit<S3.PutObjectRequest, 'Key' | 'Body'>
  deleteRemoved?: boolean
}

export const deployTask = async ({
  pattern,
  config,
  params,
  deleteRemoved = true,
  ...rest
}: DeployArgs) => {
  let base: string = ''
  if (rest.base) {
    base = rest.base
  } else {
    const r = pattern.split('/')
    if (r.length > 0) {
      base = r[0]
    }
  }
  const cwd = process.cwd()

  const s3 = new S3({ ...config, computeChecksums: true })
  const bucket = params.Bucket
  const filenames = await globAsync(pattern)
  const files = await Promise.all(
    filenames
      .filter(file => lstatSync(file).isFile())
      .map(async file => ({
        name: file,
        key: resolveObjectKey(cwd, base, file),
        md5: await calcMd5FromStream(file),
        size: lstatSync(file).size
      }))
  )
  const tasks: ListrTask<any>[] = files.map(
    (file): ListrTask<any> => {
      return {
        title: `Upload ${file.key}`,
        skip: async () => {
          try {
            const r = await s3
              .headObject({ Key: file.key, Bucket: bucket })
              .promise()
            if (r.ETag === `"${file.md5}"`) return true
            // Large file can not be compare ETag. So compare file size.
            if (r.Metadata && r.Metadata.md5 === file.md5) return true
            return false
          } catch {
            return false
          }
        },
        task: async () => {
          return uploadFile(s3, file, params)
        }
      }
    }
  )

  if (deleteRemoved) {
    tasks.push({
      title: 'Delete removed files',
      task: () => {
        return deleteRemovedObjects(s3, bucket, files)
      }
    })
  }
  return new Listr(tasks, { concurrent: true })
}
