import 'isomorphic-fetch'
import config from './config'

export default async () => {
    // eslint-disable-next-line no-undef
    if (!config.DeploymentServiceHost) {
        return [];
    }
    // const res = await fetch(`http://${config.DeploymentServiceHost}/deployments`)
    const res = await fetch(`http://sjqaqatmui02/deployments`)
    const json = await res.json() || []

    const addSortKey = item => Object.assign(item, { SortKey: item.FinishedAt})

    return json.map(d => Object.assign(d, { Type: 'deployment-event' })).map(addSortKey)
}
