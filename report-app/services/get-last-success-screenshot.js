import 'isomorphic-fetch'
import config from './config'

export default async (deviceType, hashid) => {
    // eslint-disable-next-line no-undef
    const res = await fetch(`http://sjqaqatmui02:8001/screenshot-categories/${hashid}?device=${deviceType}`)
    const json = await res.json()

    return json
}
