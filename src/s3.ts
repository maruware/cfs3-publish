import glob from 'glob'
import { promisify } from 'util'
import { join, relative } from 'path'
import Listr, { ListrTask } from 'listr'
import { S3 } from 'aws-sdk'
import { createReadStream, lstatSync } from 'fs'
import mime from 'mime-types'

const globAsync = promisify(glob)

const resolveObjectKey = (cwd: string, base: string, filename: string) => {
  return relative(join(cwd, base), filename)
}

const uploadFile = async (
  s3: S3,
  file: string,
  key: string,
  params: DeployArgsParams
) => {
  const body = createReadStream(file)
  const contentType = mime.contentType(file) || undefined
  const upload = new S3.ManagedUpload({
    params: {
      Key: key,
      Body: body,
      ContentType: contentType,
      ...params
    },
    service: s3
  })
  upload.send()
  return upload.promise()
}

export type DeployArgsParams = Omit<S3.PutObjectRequest, 'Key' | 'Body'>

export type DeployArgs = {
  pattern: string
  base?: string
  config?: S3.ClientConfiguration
  params: Omit<S3.PutObjectRequest, 'Key' | 'Body'>
}

export const deployTask = async ({
  pattern,
  config,
  params,
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

  const s3 = new S3(config)
  const bucket = params.Bucket
  let files = await globAsync(pattern)
  files = files.filter(file => lstatSync(file).isFile())
  const tasks: ListrTask<any>[] = files.map(
    (file): ListrTask<any> => {
      const key = resolveObjectKey(cwd, base, file)
      return {
        title: `Upload ${key}`,
        skip: async () => {
          try {
            await s3.headObject({ Key: key, Bucket: bucket }).promise()
            return true
          } catch {
            return false
          }
        },
        task: async () => {
          return uploadFile(s3, file, key, params)
        }
      }
    }
  )
  return new Listr(tasks, { concurrent: true })
}
