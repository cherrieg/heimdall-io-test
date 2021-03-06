import 'isomorphic-fetch'
import config from './config'


const serialize = obj => {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

export default async (hashCategory, params = {}) => {
  if (!hashCategory) {
    console.error('Expected to get a hashcategory')
    return {}
  }
  const actualParams = Object.assign({limit: 100}, params)
  const url = `http://sjqaqatmui02:8001/report-categories/${hashCategory}?${serialize(actualParams)}`
  console.log("Cherrie Debug - get report url : " + url)
  const res = await fetch(url)
  const json = await res.json()
  return json
}
