import 'isomorphic-fetch'
import config from './config'

export default async (ownerKey, projectName) => {
  const res = await fetch(`http://sjqaqatmui02:8001/projects/${ownerKey}/${projectName}/delete`, { method: 'post' })
  return res
}
