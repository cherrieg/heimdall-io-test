import 'isomorphic-fetch'
import config from './config'
const base64 = require('base-64')

export default async (path, filename = 'error-page.html') => {
  const url = `http://sjqaqatmui02:8001/attachments/${base64.encode(encodeURIComponent(path))}/${base64.encode(encodeURIComponent(filename))}`

  const res = await fetch(url)
  const source = await res.text()
  return source
}
