import 'isomorphic-fetch'
import config from './config'

export default async (id) => {
  const res = await fetch(`http://sjqaqatmui02:8001/reports/${id}`)
  const json = await res.json()
  return json
}
