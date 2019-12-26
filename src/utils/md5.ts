import crypto from 'crypto'
import { createReadStream } from 'fs'

export const calcMd5FromStream = (filePath: string) => {
  return new Promise<string>((resolve, reject) => {
    const readStream = createReadStream(filePath)
    const md5hash = crypto.createHash('md5')
    md5hash.setEncoding('base64')
    readStream.pipe(md5hash)
    readStream.on('end', () => {
      resolve(md5hash.read())
    })
    readStream.on('error', e => {
      reject(e)
    })
  })
}
