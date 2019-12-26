import mime from 'mime-types'

export const getContentType = (filename: string) => {
  var mimeType = mime.lookup(filename) || 'application/octet-stream'
  var charset = mime.charset(mimeType)

  return charset ? mimeType + '; charset=' + charset.toLowerCase() : mimeType
}
