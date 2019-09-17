import 'isomorphic-fetch'
import config from './config'

/**
 * Always get the latest test result of a test
 */
export default async (hashCategory, ownerkey, project) => {
  if (!hashCategory) {
    console.error('Expected to get a hashcategory')
    return {}
  }
  const url = `http://sjqaqatmui02:8001/report-categories/${hashCategory}?latest=true&ownerkey=${ownerkey}&project=${project}`
  const res = await fetch(url)
  const json = await res.json()

  if (!json) throw new Error(`No result for hashCategory ${hashCategory}`)
  return json[0]
}
