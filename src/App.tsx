import { Component } from 'react';
import './App.css';
import Navbar from './UIComponents/Navbar';
import SensitiveSiteControls from './UIComponents/SensitiveSiteControls';
import LandingPage from './UIComponents/LandingPage';
import {
  WebsiteListEntry,
  checkList,
  checkListReturn,
} from './utils/LocalStorage';
import { sendUserActionInfo } from './utils/ExtensionPageUtils';
import { iMsgReq, iMsgReqType } from './types/MessageTypes';
import { ExtensionSettings } from './types/Settings';
import {
  compareCertificateChains,
  fetchCertificateChain,
  grabMainUrl,
} from './utils/fetchUtils';
import { AddPoints } from './utils/PointsUtil';
import { WebsiteListDefaults } from './utils/Defaults';

const enum ViewState {
  Landing,
  SensitiveSiteControls,
}
interface AppState {
  viewing: ViewState;
  pointsLocal: number;
  group: number,
  user_id: string;
  websiteUrl: string;
  currentTabData: {
    url: string;
    tabId: number;
    hasUnblocked: boolean;
  };
  faviconImage: string;
  tabId: number;

  //super important
  // currentSiteCert: {}
  //remember to remove this once todo is done.
  doShowCertChangedButton: boolean;
  websiteList: { [key: string]: WebsiteListEntry; };
  sessionList: { [key: string]: boolean; };
  SHOULD_EXTENSION_BE_ACTIVE: boolean;

  settings: ExtensionSettings;
}
const user_id: string = require('./version').default.user_id;

class App extends Component<object, AppState> {
  constructor() {
    const state = {
      viewing: ViewState.Landing,
      pointsLocal: 0,
      user_id: user_id,
      SHOULD_EXTENSION_BE_ACTIVE: true,
      group: 0,
      websiteUrl: '',
      faviconImage: '',
      tabId: 0,

      currentSiteCert: {},
      websiteList: WebsiteListDefaults,
      sessionList: {},

      settings: {
        autoSearchEnabled: true,
      },
      currentTabData: {
        url: '',
        tabId: -1,
        hasUnblocked: false,
      },

      doShowCertChangedButton: false, //dont show the button by default
    };

    super({}, state);

    this.state = state;

    chrome.storage.onChanged.addListener((changes, namespace) => {
      console.warn('CHANGES:', changes);
      if (namespace === 'local') {
        for (const key in changes) {
          const change = changes[key];
          console.log('New change', key);
          console.log(`Old value: `, change.oldValue);
          console.log(`New value: `, change.newValue);
          if (key === 'websiteList') {
            console.warn('WebsiteList storage change');
            console.log(`Old value: `, change.oldValue);
            console.log(`New value: `, change.newValue);
            this.setState({ websiteList: change.newValue });
          }
          if (key === 'autoSearchEnabled') {
            this.setState({
              settings: { autoSearchEnabled: change.newValue },
            });
          }
          if (key === "Points") {
            this.setState({
              pointsLocal: change.newValue
            });
            console.log(`Updated pointsLocal to ${change.newValue}`);
          }

          //user info changed
          if (key === '_pki_userData') {
            //this needs to be fixed to incorporate logouts
            if (!change.newValue) return;
            this.setState({
              // user_id: change.newValue.user_id,
              SHOULD_EXTENSION_BE_ACTIVE:
                change.newValue.TEST_ExtensionActive !== undefined
                  ? change.newValue.TEST_ExtensionActive
                  : true,
              group: change.newValue.group
            });
            console.warn('Set state with new user data.');
          }
        }
      }
    });
  }

  componentDidMount(): void {
    let pointsLocal = this.state.pointsLocal;
    //this is what we upload via setState at the end of this function.
    const payload: {
      faviconImage: string;
      websiteUrl: string;
      tabId: number;
      currentTabData: {
        url: string;
        tabId: number;
        hasUnblocked: boolean;
      };
    } = {
      faviconImage: '',
      websiteUrl: '',
      tabId: 0,

      currentTabData: {
        url: '',
        tabId: 0,
        hasUnblocked: false,
      },
    };
    const setter = (props: unknown) => {
      this.setState(props as AppState);
    };

    const processActiveTab = (tabs: chrome.tabs.Tab[]) => {
      const url = tabs[0].url;
      const urlObj = new URL(url as string);
      // const webDomain = urlObj.hostname;
      const tabId = tabs[0].id;
      const favicon = tabs[0].favIconUrl;
      // const urlContainer = document.getElementById('url-container')
      // urlContainer.textContent = 'URL: ' + webDomain

      const shortenedDomain = grabMainUrl(urlObj);
      payload.websiteUrl = shortenedDomain;
      payload.currentTabData.url = shortenedDomain;
      payload.currentTabData.tabId = tabId as number;
      payload.tabId = tabId as number;
      payload.faviconImage = favicon ? favicon : '';
      checkList(shortenedDomain).then(result => {
        if (result === checkListReturn.Safe) {
          console.log("NEW CHECK 1");
          // removeView()
          // document.getElementById('all-set').style.display = 'block'

          sendUserActionInfo(user_id, 2);

          chrome.storage.local.get({ sessionList: {} }, function (items) {
            const sessionList = items.sessionList;
            if (!sessionList[shortenedDomain]) {
              console.log("NEW CHECK 2");
              chrome.tabs.sendMessage(tabId as number, { action: "checkIfClicked" }, (response) => {
                console.log("Our resp", response, response.clicked);
                if (response && !response.clicked) {
                  console.log("NEW CHECK 3");
                  // document.getElementById(
                  //   'points-feedback-click-when-blocked'
                  // ).style.display = 'block';
                  // pointsLocal -= 5; // deduct points for interacting with blocked site
                  // chrome.storage.local.set({ points: pointsLocal }, function () {
                  //   console.log(pointsLocal);
                  // });

                  AddPoints(); //TODO: feedback that user interacted with extension when it was blocked
                  console.log("added points");
                }
              });
            }
            sessionList[shortenedDomain] = true;
            chrome.storage.local.set({ sessionList: sessionList }, function () {
              console.log('Website added to session list', shortenedDomain);
              chrome.tabs.sendMessage(tabs[0].id as number, {
                action: 'removeBlocker',
              }); //send message to unblock
            });
          });

        } else if (result === checkListReturn.Unsafe) {
          chrome.tabs.sendMessage(tabId as number, { action: "checkIfClicked" }, (response) => {
            if (response && response.clicked) {
              // do nothing
            }
          });
        } else {
          console.log('Website not found in the list');
        }

        // trying to make it so that we dont get stuck in inactive session
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
          if (changeInfo.status === 'complete') {
            chrome.storage.local.get('_pki_userData', (data) => {
              const userData = data._pki_userData;
              const shouldBeActive = userData.TEST_ExtensionActive !== undefined
                ? userData.TEST_ExtensionActive
                : true;

              this.setState({
                SHOULD_EXTENSION_BE_ACTIVE: shouldBeActive,
              });
            });
          }
        });

        chrome.storage.local.get('Points', function (data) {
          if (data.Points) {
            pointsLocal = data.Points;
          }
          chrome.storage.local.get(
            {
              websiteList: WebsiteListDefaults,
              _pki_userData: {
                // user_id: 'abcd',
                TEST_ExtensionActive: true,
                group: 0,
              },
              _pki_Test_Data: {
                ilogicalloanssavings: {
                  realCert: false,
                },
              },
            },
            d => {
              const data = d._pki_userData;
              const b = data.TEST_ExtensionActive;
              const g = d._pki_Test_Data;
              const t = {
                faviconImage: payload.faviconImage,
                websiteUrl: payload.websiteUrl,
                viewing: ViewState.Landing,
                pointsLocal: pointsLocal,
                group: g.group,
                user_id: user_id,
                tabId: payload.tabId,

                SHOULD_EXTENSION_BE_ACTIVE: b,
                doShowCertChangedButton: false,
              };
              console.warn("OK", t);
              //this honestly sucks
              //TODO: MAKE THIS ASYNC SO WE DONT HAVE ALL THIS NESTED STUFF
              //TODO: ADD METADATA FOR IF THE CERTIFICATE WAS CHANGED!
              if (d.websiteList[shortenedDomain]) {
                let filter = shortenedDomain;
                if (filter === 'acct.ilogicalloanssavings.mobyphish.com') {
                  filter = urlObj.hostname.replace(/^www\./, '');
                  console.warn("Filter thing", filter);
                  fetchCertificateChain(filter).then(cert => {
                    if (g.ilogicalloanssavings.realCert === false) {
                      fetchCertificateChain("real.acct.ilogicalloanssavings.mobyphish.com").then(realCert => {
                        chrome.storage.local.set({
                          _pki_Test_Data: {
                            ilogicalloanssavings: {
                              realCert: realCert,
                            },
                          },
                        });

                        console.log("COMPARE", cert, cert, d.websiteList[shortenedDomain]);

                        if (compareCertificateChains(cert, realCert)) {
                          //does match do nothing
                        } else {
                          t.doShowCertChangedButton = true;
                        }

                        setter(t);

                        sendUserActionInfo(user_id, 3);
                        return;
                      });
                      return; // exit out of process
                    } else {
                      const savedCertificateChain = g.ilogicalloanssavings.realCert;

                      console.log("COMPARE", cert, savedCertificateChain, d.websiteList[shortenedDomain]);

                      if (compareCertificateChains(cert, savedCertificateChain)) {
                        //does match do nothing
                      } else {
                        t.doShowCertChangedButton = true;
                      }

                      setter(t);

                      sendUserActionInfo(user_id, 3);
                    }
                  });
                } else {
                  setter(t);

                  sendUserActionInfo(user_id, 3);
                }
              } else {
                setter(t);

                sendUserActionInfo(user_id, 3);
              }
            },
          );
        });
      });

    };
    //todo: totally remove this later.
    chrome.runtime.onMessage.addListener((_data, sender, sendResponse) => {
      const data = _data as iMsgReq;
      switch (data.type) {
        case iMsgReqType.fetchCertificateChain:
        case iMsgReqType.sendUserActionInfo:
        case iMsgReqType.fetchTestWebsites:
        case iMsgReqType.frontEndRequestUserSaveSite:
          break;
        case iMsgReqType.siteDataRefresh:
          console.warn('RELOAD');
          chrome.tabs.query(
            { active: true, currentWindow: true },
            processActiveTab,
          );
          // reloadWebData()
          console.warn('COMPLETE');
          break;
      }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, processActiveTab);

    const func = (items: { [key: string]: boolean; }) => {
      this.setState({
        settings: { autoSearchEnabled: items.autoSearchEnabled },
      });
    };
    chrome.storage.local.get({ autoSearchEnabled: true }, func);

    chrome.storage.local.get({ websiteList: WebsiteListDefaults }, data => {
      this.setState({ websiteList: data.websiteList });
    });
  }
  render() {
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
                  const current = this.state.viewing;
                  this.setState({
                    viewing:
                      current === ViewState.Landing
                        ? ViewState.SensitiveSiteControls
                        : ViewState.Landing,
                  });
                }}
                viewState={this.state.viewing}
                settings={this.state.settings}
                points={this.state.pointsLocal}
                group={this.state.group}
              />

              <h2
                id='points-feedback-click-when-blocked'
                style={{ textAlign: 'center', display: 'none', color: 'red' }}
              >
                Oh no! You did not earn any points. Click the extension before
                accessing Moby-protected sites to shield against cyber threats!
              </h2>

              <h2
                id='points-feedback-click-before-blocked'
                style={{ textAlign: 'center', display: 'none', color: 'green' }}
              >
                Great job! Your points increased. Clicking the extension before
                accessing Moby-protected sites shields you against cyber threats!
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
    );
  }
}

export default App;
