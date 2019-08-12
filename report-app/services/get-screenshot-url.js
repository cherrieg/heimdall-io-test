const base64 = require('base-64')
import config from './config'

// Notice the double encoding. It's because of gin-gonic
export default (path, filename) => `http://sjqaqatmui02:8001/screenshots/${base64.encode(encodeURIComponent(path))}/${base64.encode(encodeURIComponent(filename))}`
