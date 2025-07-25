/* eslint-disable no-constant-condition */
/* eslint-disable jsx-a11y/alt-text */
import { Component, ReactNode } from 'react';
import {
  WebsiteListEntry,
  WebsiteListEntryLogType,
} from '../utils/LocalStorage';
import { fetchCertificateChain, grabMainUrl } from '../utils/fetchUtils';
import { sendUserActionInfo } from '../utils/ExtensionPageUtils';
import { iMsgReqType } from '../types/MessageTypes';
import { getTabData } from '../utils/ChromeQueryUtils';
import { WebsiteListDefaults } from '../utils/Defaults';
interface LandingPageProps {
  isVisible: boolean;
  webUrl: string;
  tabId: number;
  favImg: string;
  websiteData: { [key: string]: WebsiteListEntry; };
  showchanged: boolean;
  user_id: string;
}
interface LandingPageState { }
const localStorage = chrome.storage.local;

class LandingPage extends Component<LandingPageProps, LandingPageState> {
  componentWillUnmount(): void { }
  componentDidMount(): void { }
  componentDidUpdate(
    prevProps: Readonly<LandingPageProps>,
    prevState: Readonly<LandingPageState>,
  ): void {
    if (this.props.webUrl !== prevProps.webUrl) {
      // console.warn('URL HAS CHANGED, CHECK DATA AND WHATNMOT');
      //do something...
    }
  }
  render(): ReactNode {
    const user_id = this.props.user_id;

    const data = this.props.websiteData[this.props.webUrl];

    let selectedSiteToReport: string | undefined = undefined;
    console.warn(this.props.websiteData, data, this.props.webUrl);
    return (
      <div style={{ display: this.props.isVisible ? 'block' : 'none' }}>
        {/* <div id='favicon-container'>
          <img src={this.props.favImg} alt='Favicon' />
        </div>

        <p id='url-container'>{this.props.webUrl}</p>
        <br /> */}
        {/*
          if no data is found...
        */}
        {data === undefined ? (
          <>
            <p id='not-recognized-text' style={{ textAlign: 'center' }}>
              <img
                src='/icons/triangle-exclamation-solid.svg'
                style={{
                  maxWidth: '20px',
                  maxHeight: '20px',
                }}
              />
              We do <strong>not</strong> recognize this site. If you think you
              are visiting a Moby-protected site, please recheck your source and
              verify you are visiting the correct website.
            </p>
            <br />
            {false ? (<><h2
              className='subtitle'
              id='choose-option'
              style={{ textAlign: 'center' }}
            >
              Choose an option below:
            </h2>

              <div className='block'>
                <button
                  className='button is-rounded is-info is-fullwidth'
                  id='sensitive-save-btn'
                  style={{ minHeight: '3em' }}
                  onClick={async () => {
                    localStorage.get(
                      { websiteList: WebsiteListDefaults, sessionList: {} },
                      async i => {
                        const websiteList: { [key: string]: WebsiteListEntry; } =
                          i.websiteList;
                        const sessionList: { [key: string]: boolean; } =
                          i.sessionList;

                        const webDomain = this.props.webUrl;
                        const tabId = this.props.tabId;
                        const currentTimeInMs = Date.now(); // Get current time in milliseconds since Unix epoch

                        const currentTime = new Date(
                          currentTimeInMs,
                        ).toLocaleString();
                        const iconurl = (await getTabData()).favIconUrl;
                        fetchCertificateChain(webDomain)
                          .then(certificateChain => {
                            websiteList[webDomain] = {
                              LogType: WebsiteListEntryLogType.PROTECTED,
                              certChain: certificateChain,
                              addedAt: currentTime,
                              lastVisit: currentTime,
                              faviconUrl: iconurl as string,
                            };
                            sessionList[webDomain] = true;

                            chrome.storage.local.set(
                              {
                                websiteList: websiteList,
                                sessionList: sessionList,
                              },
                              function () {
                                console.log(
                                  'Website Saved as Sensitive',
                                  webDomain,
                                );
                                console.log(
                                  'Website added to session list',
                                  webDomain,
                                );
                                chrome.runtime.sendMessage({
                                  type: iMsgReqType.siteDataRefresh,
                                });
                                chrome.tabs.sendMessage(
                                  tabId,
                                  {
                                    action: 'removeBlocker',
                                  },
                                  () => {
                                    console.log('done removed');
                                  },
                                ); //send message to unblock
                              },
                            );
                            // removeView()
                            // document.getElementById('added-to-trusted').style.display =
                            //   'block'

                            sendUserActionInfo(user_id, 4);
                            sendUserActionInfo(user_id, 7);
                            return true;
                          })
                          .catch(error => {
                            console.warn(
                              'Error fetching certificate chain:',
                              error,
                            );
                            // console.log('checking local vers')
                            // localFetchCertChain(webDomain)
                            //   .then(data => {
                            //     console.log(data)
                            //   })
                            //   .catch(e => {
                            //     console.warn('Failed to get local version', e)
                            //   })
                            // Handle the error, e.g., display an error message to the user
                          });
                      },
                    );
                  }}
                >
                  Save new Moby-protected site
                </button>
              </div></>) : undefined}
            {
              //this should be false so it can be hidden since we are using a different reporting layout
            }
            {false ? (<>
              <div className='block' id='report-phish-prompt-text'>
                <h3 className='subtitle' style={{ textAlign: 'center' }}>
                  If you thought this was one of your Moby-protected sites, choose that
                  site below:{' '}
                </h3>
              </div>
              <div id='sensitive-sites-dropdown-container'>

                <div
                  className='select is-rounded is-danger'
                  id='sensitive-sites-dropdown-container'
                  style={{ marginLeft: '25px', marginBottom: '10px', width: 'auto', overflowX: 'hidden', wordWrap: 'break-word', maxWidth: '75vw' }}
                >
                  <select
                    id='sensitive-sites-dropdown'
                    onChange={event => {
                      const selectedOption = event.target.value;
                      if (selectedOption === '') {
                        selectedSiteToReport = undefined;
                      } else {
                        selectedSiteToReport = selectedOption;
                      }
                      console.log('Selected option:', selectedOption);
                    }}
                  >
                    {/* Options will be dynamically added here */}
                    <option>Select the Moby-protected Site</option>
                    {Object.keys(this.props.websiteData).map(key =>
                      this.props.websiteData[key].LogType ===
                        WebsiteListEntryLogType.PROTECTED ? (
                        <option value={key} key={key}>{key}</option>
                      ) : undefined,
                    )}
                  </select>
                </div>
              </div>

              <div className='block'>
                <button
                  className='button is-rounded is-danger is-clipped'
                  id='unsafe-save-btn'
                  style={{ marginLeft: '100px' }}
                  onClick={() => {
                    if (selectedSiteToReport) {
                      chrome.tabs.query(
                        { active: true, currentWindow: true },
                        function (tabs) {
                          const url = tabs[0].url;
                          const urlObj = new URL(url as string);
                          const currentSite = grabMainUrl(urlObj);
                          const currentTabId = tabs[0].id;
                          const favicon = tabs[0].favIconUrl;
                          if (currentSite && selectedSiteToReport) {
                            chrome.storage.local.get(
                              { websiteList: WebsiteListDefaults },
                              function (items) {
                                const websiteList: {
                                  [key: string]: WebsiteListEntry;
                                } = items.websiteList;
                                const currentTimeInMs = Date.now(); // Get current time in milliseconds since Unix epoch
                                const localTimeString = new Date(
                                  currentTimeInMs,
                                ).toLocaleString(); // Convert to local date and time string

                                websiteList[currentSite] = {
                                  LogType: WebsiteListEntryLogType.BLOCKED,
                                  certChain: undefined,
                                  addedAt: localTimeString,
                                  lastVisit: localTimeString,
                                  faviconUrl: favicon as string,
                                }; // Mark the current site as unsafe
                                chrome.storage.local.set(
                                  { websiteList: websiteList },
                                  function () {
                                    console.log(
                                      'Current website marked as blocked:',
                                      currentSite,
                                    );
                                    // displayUnsafeSites()
                                  },
                                );
                                chrome.tabs.sendMessage(currentTabId as number, {
                                  action: 'addBlocker',
                                });
                                // Log the selected site with the current site
                                sendUserActionInfo(
                                  user_id,
                                  10,
                                  selectedSiteToReport,
                                  currentSite,
                                );
                              },
                            );
                            // removeView()
                            // document.getElementById(
                            //   'added-to-untrust'
                            // ).style.display = 'block'
                            // document.getElementById('unblock-once').style.display =
                            //   'block'
                          } else {
                            console.warn(
                              'Error: No current site or no site selected to report.',
                            );
                          }
                        },
                      );
                    }
                  }}
                >
                  Report
                </button>
              </div>

              <div className='block'>
                <button
                  className='button is-rounded is-danger is-clipped'
                  id='unsafe-save-btn'
                  style={{ marginLeft: '100px' }}
                  onClick={() => {
                    if (selectedSiteToReport) {
                      chrome.tabs.query(
                        { active: true, currentWindow: true },
                        function (tabs) {
                          const url = tabs[0].url;
                          const urlObj = new URL(url as string);
                          const currentSite = grabMainUrl(urlObj);
                          if (currentSite && selectedSiteToReport) {
                            //send site info changed event to logs
                            sendUserActionInfo(
                              user_id,
                              12,
                              selectedSiteToReport,
                              currentSite,
                            );
                          } else {
                            console.warn(
                              'Error: No current site or no site selected to report.',
                            );
                          }
                        },
                      );
                    }
                  }}
                >
                  Report Info Change
                </button>
              </div></>) : undefined}
          </>
        ) : undefined}

        <h2
          className='subtitle'
          id='not-marked-sensitive-proceed-caution'
          style={{ textAlign: 'center', display: 'none' }}
        >
          This site has NOT been marked to be Moby-protected by you. Please proceed
          carefully and check your source
        </h2>
        {data ? (
          /* <!--Visiting website that is in unsafe and safe list--> */
          <>
            <h2
              className='subtitle'
              id='all-set'
              style={{
                textAlign: 'center',
                display:
                  data.LogType === WebsiteListEntryLogType.PROTECTED &&
                    this.props.showchanged === false
                    ? '' // show is protected, not else.
                    : 'none',
              }}
            >
              You are protected!
            </h2>
            <h2
              className='subtitle'
              id='site-blocked-text'
              style={{
                textAlign: 'center',
                display:
                  data.LogType === WebsiteListEntryLogType.BLOCKED
                    ? ''
                    : 'none',
              }}
            >
              You had previously marked this website as blocked. Please proceed
              carefully.
            </h2>
          </>
        ) : undefined}

        {/* <!--user adds untrusted site--> */}
        <h2
          className='subtitle'
          id='added-to-untrust'
          style={{ textAlign: 'center', display: 'none' }}
        >
          This site has been added to your untrusted list. We will warn you if
          you try to visit this website again.
        </h2>

        {/* <!--user adds trusted site--> */}
        <h2
          className='subtitle'
          id='added-to-trusted'
          style={{ textAlign: 'center', display: 'none' }}
        >
          This site has been added to your trusted list. Please click on our
          extension every time you visit this website to protect yourself from
          attacks.
        </h2>
        {data !== undefined ? (
          <>
            <h3
              className='subtitle'
              id='temp-unblock-text'
              style={{ textAlign: 'center', display: 'none' }}
            >
              We've temporarily unblocked this site. To permanently unblock it,
              click the hamburger icon in the top right and edit blocked sites.
              Only do so if you trust this site.
            </h3>

            <button
              className='button is-rounded is-info is-fullwidth'
              id='unblock-once'
              style={{
                display:
                  data.LogType === WebsiteListEntryLogType.BLOCKED
                    ? ''
                    : 'none',
                minHeight: '4em',
              }}
              onClick={() => {
                //TODO: do we want to make this unblock for the remainder of the session, or perhaps on a tab
                //basis?
                // chrome.storage.local.get({ sessionList: {} }, data => {
                //   const sesh = data.sessionList
                //   sesh[this.props.webUrl] = true
                // })
                //TODO: make this match our sendMessage format

                // chrome.runtime.sendMessage({
                //   action: 'removeBlocker'
                // })
                chrome.tabs.sendMessage(this.props.tabId, {
                  action: 'removeBlocker',
                });
                sendUserActionInfo(user_id, 11); // placeholder userid that will be overridden
              }}
            >
              I want to risk my online security <br />
              and visit this website anyways
            </button>
          </>
        ) : undefined}
        {data !== undefined ? (
          <>
            <h2
              className='subtitle'
              style={{
                textAlign: 'center',
                display:
                  data.LogType === WebsiteListEntryLogType.PROTECTED &&
                    this.props.showchanged === true
                    ? ''
                    : 'none',
                color: 'red',
              }}
              id='cert-info-change'
            >
              Some security information about this site has been changed! This
              is usually an indicator of an attack. Please proceed carefully, and refrain from submitting any credentials. The blocker has been removed.
            </h2>
            {/* <button
              className='button is-rounded is-info is-fullwidth'
              id='trust-on-change'
              style={{
                display:
                  data.LogType === WebsiteListEntryLogType.PROTECTED &&
                    this.props.showchanged === true
                    ? ''
                    : 'none',
              }}
            >
              I still trust this website
            </button> */}

          </>
        ) : undefined}

        <h2
          id='feedback'
          style={{ textAlign: 'center', display: 'none' }}
          className='subtitle'
        >
          Feedback: This was just a test!
        </h2>
      </div>
    );
  }
}

export default LandingPage;
