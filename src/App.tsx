import React, { Component } from 'react'
import './App.css'
import Navbar from './UIComponents/Navbar'
import SensitiveSiteControls from './UIComponents/SensitiveSiteControls'
import LandingPage from './UIComponents/LandingPage'
import {
  WebsiteListEntry,
  checkList,
  checkListReturn
} from './utils/LocalStorage'
import { sendUserActionInfo } from './utils/ExtensionPageUtils'
import { iMsgReq, iMsgReqType } from './types/MessageTypes'
import { ExtensionSettings } from './types/Settings'
import {
  compareCertificateChains,
  fetchCertificateChain
} from './utils/fetchUtils'

const enum ViewState {
  Landing,
  SensitiveSiteControls
}
interface AppState {
  viewing: ViewState
  pointsLocal: number
  user_id: string
  websiteUrl: string
  currentTabData: {
    url: string
    tabId: number
    hasUnblocked: boolean
  }
  faviconImage: string
  tabId: number

  //super important
  // currentSiteCert: {}
  //remember to remove this once todo is done.
  doShowCertChangedButton: boolean
  websiteList: { [key: string]: WebsiteListEntry }
  sessionList: { [key: string]: boolean }
  SHOULD_EXTENSION_BE_ACTIVE: boolean

  settings: ExtensionSettings
}
class App extends Component<{}, AppState> {
  constructor () {
    const state = {
      viewing: ViewState.Landing,
      pointsLocal: 0,
      user_id: 'abcd',
      SHOULD_EXTENSION_BE_ACTIVE: true,
      websiteUrl: '',
      faviconImage: '',
      tabId: 0,

      currentSiteCert: {},
      websiteList: {},
      sessionList: {},

      settings: {
        autoSearchEnabled: true
      },
      currentTabData: {
        url: '',
        tabId: -1,
        hasUnblocked: false
      },

      doShowCertChangedButton: false //dont show the button by default
    }

    super({}, state)

    this.state = state

    chrome.storage.onChanged.addListener((changes, namespace) => {
      console.warn('CHANGES:', changes)
      if (namespace === 'local') {
        for (let key in changes) {
          const change = changes[key]
          console.log('New change', key)
          console.log(`Old value: `, change.oldValue)
          console.log(`New value: `, change.newValue)
          if (key === 'websiteList') {
            console.warn('WebsiteList storage change')
            console.log(`Old value: `, change.oldValue)
            console.log(`New value: `, change.newValue)
            this.setState({ websiteList: change.newValue })
          }
          if (key === 'autoSearchEnabled') {
            this.setState({
              settings: { autoSearchEnabled: change.newValue }
            })
          }

          //user info changed
          if (key === '_pki_userData') {
            //this needs to be fixed to incorporate logouts
            if (!change.newValue) return
            this.setState({
              user_id: change.newValue.user_id,
              SHOULD_EXTENSION_BE_ACTIVE:
                change.newValue.TEST_ExtensionActive !== undefined
                  ? change.newValue.TEST_ExtensionActive
                  : true
            })
            console.warn('Set state with new user data.')
          }
        }
      }
    })
  }

  componentDidMount (): void {
    let pointsLocal = this.state.pointsLocal
    let user_id = this.state.user_id

    sendUserActionInfo(this.state.user_id, 3)
    //this is what we upload via setState at the end of this function.
    let payload: {
      faviconImage: string
      websiteUrl: string
      tabId: number
      currentTabData: {
        url: string
        tabId: number
        hasUnblocked: boolean
      }
    } = {
      faviconImage: '',
      websiteUrl: '',
      tabId: 0,

      currentTabData: {
        url: '',
        tabId: 0,
        hasUnblocked: false
      }
    }
    const setter = (props: unknown) => {
      this.setState(props as AppState)
    }

    const processActiveTab = (tabs: chrome.tabs.Tab[]) => {
      const state = this.state
      const url = tabs[0].url
      const urlObj = new URL(url as string)
      const webDomain = urlObj.hostname
      const tabId = tabs[0].id
      const favicon = tabs[0].favIconUrl

      // const urlContainer = document.getElementById('url-container')
      // urlContainer.textContent = 'URL: ' + webDomain
      const shortenedDomain = webDomain.replace(/^www\./, '')

      payload.websiteUrl = shortenedDomain
      payload.currentTabData.url = shortenedDomain
      payload.currentTabData.tabId = tabId as number
      payload.tabId = tabId as number
      payload.faviconImage = favicon ? favicon : ''
      checkList(shortenedDomain).then(result => {
        console.warn(result)
        if (result === checkListReturn.Safe) {
          // removeView()
          // document.getElementById('all-set').style.display = 'block'

          sendUserActionInfo(user_id, 2)

          chrome.storage.local.get({ sessionList: {} }, function (items) {
            const sessionList = items.sessionList
            sessionList[shortenedDomain] = true
            chrome.storage.local.set({ sessionList: sessionList }, function () {
              console.log('Website added to session list', shortenedDomain)
              chrome.tabs.sendMessage(tabs[0].id as number, {
                action: 'removeBlocker'
              }) //send message to unblock
            })
          })
        } else if (result === checkListReturn.Unsafe) {
          // removeView()
          // document.getElementById('site-blocked-text').style.display = 'block'
          // document.getElementById('unblock-once').style.display = 'block'
          // chrome.storage.local.get({ sessionList: {} }, function (items) {
          //   const sessionList = items.sessionList
          //   sessionList[webDomain] = true
          //   chrome.storage.local.set({ sessionList: sessionList }, function () {
          //     console.log('Website added to session list', webDomain)
          //   })
          // })
        } else {
          console.log('Website not found in the list')
        }

        chrome.storage.local.get('points', function (data) {
          if (data.points) {
            pointsLocal = data.points
          }
          chrome.storage.local.get(
            {
              websiteList: {},
              _pki_userData: {
                user_id: 'abcd',
                TEST_ExtensionActive: true
              }
            },
            d => {
              const data = d._pki_userData
              user_id = data.user_id
              const b = data.TEST_ExtensionActive
              const t = {
                faviconImage: payload.faviconImage,
                websiteUrl: payload.websiteUrl,
                viewing: ViewState.Landing,
                pointsLocal: pointsLocal,
                user_id: user_id,
                tabId: payload.tabId,

                SHOULD_EXTENSION_BE_ACTIVE: b,
                doShowCertChangedButton: false
              }
              //this honestly sucks
              //TODO: MAKE THIS ASYNC SO WE DONT HAVE ALL THIS NESTED STUFF
              //TODO: ADD METADATA FOR IF THE CERTIFICATE WAS CHANGED!
              fetchCertificateChain(shortenedDomain).then(cert => {
                const savedCertificateChain =
                  d.websiteList[shortenedDomain].certChain
                if (compareCertificateChains(cert, savedCertificateChain)) {
                  t.doShowCertChangedButton = true
                } else {
                }

                setter(t)
              })
            }
          )
        })
      })
    }
    //todo: totally remove this later.
    chrome.runtime.onMessage.addListener((_data, sender, sendResponse) => {
      const data = _data as iMsgReq
      switch (data.type) {
        case iMsgReqType.fetchCertificateChain:
        case iMsgReqType.sendUserActionInfo:
        case iMsgReqType.fetchTestWebsites:
        case iMsgReqType.frontEndRequestUserSaveSite:
          break
        case iMsgReqType.siteDataRefresh:
          console.warn('RELOAD')
          chrome.tabs.query(
            { active: true, currentWindow: true },
            processActiveTab
          )
          // reloadWebData()
          console.warn('COMPLETE')
          break
      }
    })

    chrome.tabs.query({ active: true, currentWindow: true }, processActiveTab)
    // reloadWebData()
    //what is this
    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //   chrome.tabs.sendMessage(
    //     tabs[0].id,
    //     { action: 'testing' },
    //     function (response) {
    //       console.log('T' + pointsLocal)
    //       document.getElementById(
    //         'points'
    //       ).textContent = `Points: ${pointsLocal}`
    //     }
    //   )
    // })
    const func = (items: { [key: string]: any }) => {
      this.setState({
        settings: { autoSearchEnabled: items.autoSearchEnabled }
      })
    }
    chrome.storage.local.get({ autoSearchEnabled: true }, func)

    chrome.storage.local.get({ websiteList: {} }, data => {
      this.setState({ websiteList: data.websiteList })
    })
  }
  render () {
    // this.reloadWebData()
    return (
      <div className='App'>
        <head>
          <meta charSet='UTF-8' />
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1.0'
          />
          <link
            rel='stylesheet'
            href='https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css'
          />
        </head>

        <body>
          {!this.state.SHOULD_EXTENSION_BE_ACTIVE ? (
            <div>
              You aren't allowed to use the extension for this part of the test.
            </div>
          ) : (
            <>
              <Navbar
                toggleSensitiveSiteControls={() => {
                  const current = this.state.viewing
                  this.setState({
                    viewing:
                      current === ViewState.Landing
                        ? ViewState.SensitiveSiteControls
                        : ViewState.Landing
                  })
                }}
                viewState={this.state.viewing}
                settings={this.state.settings}
              />

              <h2
                id='points-feedback-click-when-blocked'
                style={{ textAlign: 'center', display: 'none', color: 'red' }}
              >
                Oh no! Your points were deducted. Click the extension before
                accessing protected sites to shield against cyber threats!
              </h2>

              <h2
                id='points-feedback-click-before-blocked'
                style={{ textAlign: 'center', display: 'none', color: 'green' }}
              >
                Great job! Your points increased. Clicking the extension before
                accessing protected sites shields you against cyber threats!
              </h2>

              {/* <!--Top Bar--> */}
              {/* <!--Favicon--> */}
              <div id='favicon-container'>
                <img src={this.state.faviconImage} alt='Favicon' />
              </div>

              {/* <!--URL--> */}
              <p id='url-container'>{this.state.websiteUrl}</p>
              <br />

              {/* <!--Info Text--> */}
              {/* <!--uhh what else do we call this...--> */}
              <LandingPage
                isVisible={this.state.viewing === ViewState.Landing}
                webUrl={this.state.websiteUrl}
                tabId={this.state.tabId}
                favImg={this.state.faviconImage}
                websiteData={this.state.websiteList}
                user_id={this.state.user_id}
                showchanged={this.state.doShowCertChangedButton}
              />

              <SensitiveSiteControls
                isVisible={
                  this.state.viewing === ViewState.SensitiveSiteControls
                }
                websiteData={this.state.websiteList}
              />

              {/* <script src='popup.bundle.js'></script> */}
            </>
          )}
        </body>
      </div>
    )
  }
}

export default App