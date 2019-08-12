import 'isomorphic-fetch'
import config from './config'

export default async (ownerKey) => {
  const res = await fetch(`http://sjqaqatmui02:8001/projects/${ownerKey}`)
  const json = await res.json()
  return json
}
