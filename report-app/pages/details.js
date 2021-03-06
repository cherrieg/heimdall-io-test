import React from 'react'
import Layout from '../components/layout'

import TestTitle from '../components/test-title'
import TestResultDeviceIcon from '../components/test-result-device-icon'
import TestHistoryBars from '../components/test-history-bars'
import Spinner from '../components/spinner'

import ConsoleMessagesCount from '../components/testrun-details/console-messages-count'
import PerformanceLogsCount from '../components/testrun-details/performance-logs-count'
import SideBySideView from '../components/testrun-details/side-by-side-view'

import getReportById from '../services/get-report-by-id'
import getLatestReportByHashcategory from '../services/get-latest-report-by-hashcategory'
import getTestSource from '../services/get-test-source'
import getBrowserlogs from '../services/get-browserlogs'
import getPerformanceLogs from '../services/get-performance-logs'
import getReportsByCategory from '../services/get-reports-by-category'

import round from '../services/utils/round'
import mapToUnifiedLogFormat from '../services/utils/map-to-unified-log-format'

const createTestDetailLink = (id, ownerkey, project, hashcategory) => `/details?ownerkey=${ownerkey}&project=${encodeURIComponent(project)}&id=${id}&hashcategory=${hashcategory}`
const mapToSuccessAndFailure = (historicReports, ownerkey, project) => historicReports ? historicReports.map(r => Object.assign({}, {
  t: r.StartedAt,
  value: r.Duration,
  success: r.Result === 'success',
  href: createTestDetailLink(r._id, ownerkey, project, r.HashCategory)
})) : undefined

export default class extends React.Component {
  static async getInitialProps ({ query: { ownerkey, project, id, hashcategory } }) {
    if (!ownerkey) throw new Error('Please provide your owner key in the query parameters')
    if (!(id || hashcategory)) throw new Error('Please provide either id or hashcategory')

    let report = id !== undefined ?
      await getReportById(id)
      : await getLatestReportByHashcategory(hashcategory,ownerkey, project)

    const [source, browserlogs, performanceLogs] = await Promise.all([
      await getTestSource(report.ReportDir),
      await getBrowserlogs(report.ReportDir),
      await getPerformanceLogs(report.ReportDir),
    ])

    return {
      ownerkey,
      project,
      report,
      source,
      browserlogs: mapToUnifiedLogFormat(browserlogs),
      performanceLogs,
    }
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  async getHistoricReportData(limit = 50) {
    const historicReports =
      await getReportsByCategory(this.props.report.HashCategory, {
        limit,
        since: this.props.report.StartedAt,
        project: this.props.project,
        ownerkey: this.props.ownerkey
      })
    if (!historicReports) {
      return {
        history: [],
        stability: 0,
      }
    }

    // Show only reports for same device
    let historicReportsForSameDevice = historicReports.filter(r => r.DeviceSettings.Type === this.props.report.DeviceSettings.Type)

    const history = mapToSuccessAndFailure(historicReportsForSameDevice, this.props.ownerkey, this.props.project)
    const lastSuccessfulReport = this.props.report.Result === 'error' ? historicReportsForSameDevice.find(r => r.Result === 'success') : undefined

    historicReportsForSameDevice = historicReportsForSameDevice.concat([Object.assign(this.props.report)])
    const successfulReports = historicReportsForSameDevice.filter(r => r.Result === 'success')
    const stability = round(successfulReports.length * 100.0 / historicReportsForSameDevice.length)
    return {
      history,
      stability,
      lastSuccessfulReport,
    }
  }

  async componentDidMount() {
    const historicReportData = await this.getHistoricReportData()
    this.setState(historicReportData)

    // TODO why put them in state at all?
    const consoleErrors = this.props.browserlogs
    this.setState({
      loaded: true,
      consoleErrors,
    })
  }

  render () {
    const attrs = {title: `${this.props.report.Title}`, ownerkey: this.props.ownerkey, showNav: false}

    return (
      <Layout {...attrs}>
        <div className="TestDetails">
          <div className="TestDetails-header">
            <div className="TestDetails-title columns">

              <div className="column is-narrow">
                <TestResultDeviceIcon
                  result={this.props.report.Result}
                  deviceSettings={this.props.report.DeviceSettings} />
              </div>

              <div className="column">
                <TestTitle report={this.props.report} isListView={false}/>
              </div>

            </div>

            {
              this.state.loaded === true ?
                <div className="level has-background-light">
                  <div className="level-item has-text-centered">
                    <div>
                      <p className="heading">
                        History
                      </p>
                      <div className="title">
                          <TestHistoryBars
                          data={this.state.history}
                          maxBars={20}
                          />
                      </div>
                    </div>
                  </div>
                  <div className="level-item has-text-centered">
                    <div>
                      <p className="heading">Performance Logs</p>
                      <p className="title">
                        <PerformanceLogsCount reportId={this.props.report._id} logs={this.props.performanceLogs} />
                      </p>
                    </div>
                  </div>
                  <div className="level-item has-text-centered">
                    <div>
                      <p className="heading">Console Logs</p>
                      <p className="title">
                        <ConsoleMessagesCount reportId={this.props.report._id} messages={this.state.consoleErrors} />
                      </p>
                    </div>
                  </div>
                  <div className="level-item has-text-centered">
                    <div>
                      <p className="heading">Stability</p>
                      <p className="title">{this.state.stability} %</p>
                    </div>
                  </div>
                </div>
                :
                <Spinner />
              }
          </div>

          <div className="TestDetails-body">
          {
            this.state.loaded === true ?
            <SideBySideView
              lastSourceCommit={this.props.report.LastSourceCommit}
              reportId={this.props.report._id}
              reportDir={this.props.report.ReportDir}
              reportDirDiff={this.state.lastSuccessfulReport && this.state.lastSuccessfulReport.ReportDir}
              startedAt={this.props.report.StartedAt}
              source={this.props.source}
              screenshotWidth={this.props.report.DeviceSettings.Width}
              screenshotHeight={this.props.report.DeviceSettings.Height}
              reportScreenshots={this.props.report.Screenshots}
              reportScreenshotsDiff={this.state.lastSuccessfulReport && this.state.lastSuccessfulReport.Screenshots}
            />
            :
            <Spinner />
          }

          </div>


        </div>


        <style jsx global>{`
          .TestDetails {
            height: 100%;
          }

          .TestDetails-title {
            margin-bottom: 0;
          }
          .TestDetails-history {
          }
          .TestDetails-screenshotViewContainer {
            position: relative;
          }

          .TestDetails-header {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 1em 1em 0 1em;
          }

          .TestDetails-body {
            padding: 11em 1em 0 1em;
            height: 100vh;
          }
        `}</style>

      </Layout>
    )
  }
}
