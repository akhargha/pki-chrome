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

// Helper function to show domain with TLD (e.g., "www.google.com" -> "google.com")
function getSiteName(domain: string): string {
  return domain.replace(/^www\./, '');
}

function getAssignmentIdFromPath(pathname: string): number | undefined {
  // Study tasks are routed like /a/<id> (site code derives it from this path).
  const match = pathname.match(/\/a\/(\d+)/);
  if (!match) return undefined;
  const id = Number(match[1]);
  if (!Number.isFinite(id)) return undefined;
  return id;
}
interface LandingPageProps {
  isVisible: boolean;
  webUrl: string;
  tabId: number;
  favImg: string;
  websiteData: { [key: string]: WebsiteListEntry; };
  showchanged: boolean;
  user_id: string;
}
interface LandingPageState {
  showBlockedUnblockConfirm: boolean;
  showKnownSiteReportStep: boolean;
  selectedSiteToReport?: string;
}
const localStorage = chrome.storage.local;

class LandingPage extends Component<LandingPageProps, LandingPageState> {
  private hasAutoCompletedPreviouslyBlockedTask = false;

  constructor(props: LandingPageProps) {
    super(props);
    this.state = {
      showBlockedUnblockConfirm: false,
      showKnownSiteReportStep: false,
      selectedSiteToReport: undefined,
    };
  }

  private markCurrentSiteAsBlocked = (siteToReport?: string) => {
    const user_id = this.props.user_id;

    chrome.tabs.query(
      { active: true, currentWindow: true },
      function (tabs) {
        const url = tabs[0].url;
        const urlObj = new URL(url as string);
        const currentSite = grabMainUrl(urlObj);
        const currentTabId = tabs[0].id;
        const favicon = tabs[0].favIconUrl;
        if (currentSite) {
          chrome.storage.local.get(
            { websiteList: {} },
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
              sendUserActionInfo(
                user_id,
                6,
                currentSite,
                currentSite,
              );
              if (siteToReport) {
                // Log phishing report with the impersonated site
                sendUserActionInfo(
                  user_id,
                  10,
                  siteToReport,
                  currentSite,
                );
              }
              sendUserActionInfo(user_id, 17); // Log list of unsafe sites
              // Record task completion for the current /a/<id> page.
              const assignment_id =
                getAssignmentIdFromPath(urlObj.pathname);
              if (!assignment_id) {
                console.warn(
                  'Could not parse assignment_id from tab URL path',
                  urlObj.pathname,
                );
                return;
              }

              fetch(
                'https://study-api.com/api/record-complete-assignment-event',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    assignment_id,
                    completion_type: 'report_extension',
                    // Backend validates `website` against task.site_url if provided.
                    website: currentSite,
                  }),
                },
              ).catch(e =>
                console.warn(
                  'record-complete-assignment-event call failed',
                  e,
                ),
              );
            },
          );
        } else {
          console.warn('Error: No current site to report.');
        }
      },
    );
  };

  private completeTaskForPreviouslyBlockedSite = () => {
    const user_id = this.props.user_id;
    const currentSite = this.props.webUrl;

    // Keep existing analytics behavior that was previously triggered by the
    // "cannot complete task" blocked-site button.
    sendUserActionInfo(user_id, 15);

    chrome.tabs.get(this.props.tabId, tab => {
      const tabUrl = tab?.url;
      if (!tabUrl) {
        console.warn('No tab URL available to parse assignment_id');
        alert('Thank you! Please go back to your email for the next task.');
        return;
      }

      let assignment_id: number | undefined;
      try {
        const urlObj = new URL(tabUrl);
        assignment_id = getAssignmentIdFromPath(urlObj.pathname);
      } catch (e) {
        console.warn('Failed to parse assignment_id from tab URL', e);
      }

      if (!assignment_id) {
        console.warn('Could not parse assignment_id from tab URL path');
        alert('Thank you! Please go back to your email for the next task.');
        return;
      }

      fetch('https://study-api.com/api/record-complete-assignment-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id,
          completion_type: 'previous_block_extension',
          // Backend validates `website` against task.site_url if provided.
          website: currentSite,
        }),
      })
        .then(() => {
          alert('Thank you! Please go back to your email for the next task.');
        })
        .catch(e => {
          console.warn(
            'record-complete-assignment-event call failed',
            e,
          );
          // Still show the message even if the call fails
          alert('Thank you! Please go back to your email for the next task.');
        });
    });
  };

  private maybeAutoCompletePreviouslyBlockedTask = () => {
    const data = this.props.websiteData[this.props.webUrl];
    const isBlocked = data?.LogType === WebsiteListEntryLogType.BLOCKED;

    if (!isBlocked || this.hasAutoCompletedPreviouslyBlockedTask) {
      return;
    }

    this.hasAutoCompletedPreviouslyBlockedTask = true;
    this.completeTaskForPreviouslyBlockedSite();
  };

  private removeSiteFromBlockedList = () => {
    const currentSite = this.props.webUrl;

    chrome.storage.local.get(
      { websiteList: {} },
      (items) => {
        const websiteList: { [key: string]: WebsiteListEntry } = items.websiteList;
        delete websiteList[currentSite];

        chrome.storage.local.set({ websiteList }, () => {
          chrome.runtime.sendMessage({ type: iMsgReqType.siteDataRefresh });
          chrome.tabs.sendMessage(this.props.tabId, { action: 'removeBlocker' });
          this.setState({ showBlockedUnblockConfirm: false });
          alert('This website has been removed from your blocked list');
        });
      },
    );
  };

  componentWillUnmount(): void { }
  componentDidMount(): void {
    this.maybeAutoCompletePreviouslyBlockedTask();
  }
  componentDidUpdate(
    prevProps: Readonly<LandingPageProps>,
    prevState: Readonly<LandingPageState>,
  ): void {
    if (this.props.webUrl !== prevProps.webUrl) {
      this.hasAutoCompletedPreviouslyBlockedTask = false;
      this.setState({
        showBlockedUnblockConfirm: false,
        showKnownSiteReportStep: false,
        selectedSiteToReport: undefined,
      });
      // console.warn('URL HAS CHANGED, CHECK DATA AND WHATNMOT');
      //do something...
    }

    if (
      this.props.webUrl !== prevProps.webUrl ||
      this.props.websiteData !== prevProps.websiteData
    ) {
      this.maybeAutoCompletePreviouslyBlockedTask();
    }
  }
  render(): ReactNode {
    const user_id = this.props.user_id;

    const data = this.props.websiteData[this.props.webUrl];

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
              We do <strong>not</strong> recognize this website. You have not saved this site as a known site.
            </p>
            <br />
            {!this.state.showKnownSiteReportStep ? (
              <>
                <div className='block landing-action-block'>
                  <button
                    className='button is-rounded is-info landing-action-button'
                    id='sensitive-save-btn'
                    style={{ minHeight: '3em' }}
                    onClick={async () => {
                      localStorage.get(
                        { websiteList: {}, sessionList: {} },
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
                    Save as a new known site
                  </button>
                </div>
                <div className='block landing-action-block'>
                  <button
                    className='button is-rounded is-danger landing-action-button'
                    id='go-to-known-site-report-step-btn'
                    style={{ minHeight: '3em' }}
                    onClick={() => {
                      this.setState({
                        showKnownSiteReportStep: true,
                        selectedSiteToReport: undefined,
                      });
                    }}
                  >
                    I thought this was one of my known sites
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className='block' id='report-phish-prompt-text'>
                  <h3 className='subtitle' style={{ textAlign: 'center' }}>
                    Is this site impersonating one of your known sites?
                    <span
                      style={{
                        display: 'inline-block',
                        marginLeft: '6px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#ccc',
                        color: '#555',
                        fontSize: '11px',
                        lineHeight: '16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        verticalAlign: 'middle',
                      }}
                      onClick={() => {
                        alert('If you think this site is impersonating one of your known sites, select it below. Otherwise, choose "None of the above" and continue.');
                      }}
                    >?</span>
                  </h3>
                </div>
                <div className='landing-select-wrapper'>
                  <div
                    className='select is-rounded is-danger'
                    id='sensitive-sites-dropdown-container'
                    style={{ width: '100%', overflowX: 'hidden', wordWrap: 'break-word' }}
                  >
                    <select
                      id='sensitive-sites-dropdown'
                      value={this.state.selectedSiteToReport ?? ''}
                      onChange={event => {
                        const selectedOption = event.target.value;
                        this.setState({
                          selectedSiteToReport:
                            selectedOption === '' ? undefined : selectedOption,
                        });
                      }}
                    >
                      <option value=''>Select a known site</option>
                      {Object.keys(this.props.websiteData).map(key =>
                        this.props.websiteData[key].LogType ===
                          WebsiteListEntryLogType.PROTECTED ? (
                          <option value={key} key={key}>{getSiteName(key)}</option>
                        ) : undefined,
                      )}
                      <option value='__none__'>None of the above</option>
                    </select>
                  </div>
                </div>

                <div className='block landing-action-block'>
                  <button
                    className='button is-rounded is-danger landing-action-button'
                    id='confirm-block-site-btn'
                    style={{ minHeight: '3em' }}
                    onClick={() => {
                      const selected = this.state.selectedSiteToReport;
                      this.markCurrentSiteAsBlocked(
                        selected === '__none__' ? undefined : selected,
                      );
                    }}
                  >
                    Report and block
                  </button>
                </div>
              </>
            )}

            {/* Report Info Change button - commented out for now, may be needed in the future
            <div className='block'>
              <button
                className='button is-rounded is-danger is-clipped'
                id='unsafe-save-btn'
                style={{ marginLeft: '100px' }}
                onClick={() => {
                  if (!selectedSiteToReport) {
                    console.warn(
                      'Error: Please select the specific Moby-protected site before reporting an info change.',
                    );
                    return;
                  }
                  const siteToReport = selectedSiteToReport;
                  chrome.tabs.query(
                    { active: true, currentWindow: true },
                    function (tabs) {
                      const url = tabs[0].url;
                      const urlObj = new URL(url as string);
                      const currentSite = grabMainUrl(urlObj);
                      if (currentSite) {
                        //send site info changed event to logs
                        sendUserActionInfo(
                          user_id,
                          12,
                          siteToReport,
                          currentSite,
                        );
                      } else {
                        console.warn(
                          'Error: No current site available to report.',
                        );
                      }
                    },
                  );
                }}
              >
                Report Info Change
              </button>
            </div>
            */}
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
              This is one of your known sites. You can continue safely.
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
              You are done with this task. Please proceed to the next task. You had
              previously blocked this website.
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
              className='button is-rounded is-light is-fullwidth'
              id='unblock-website'
              style={{
                display:
                  data.LogType === WebsiteListEntryLogType.BLOCKED
                    ? ''
                    : 'none',
                minHeight: '4em',
                height: 'auto',
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                textAlign: 'center',
                lineHeight: '1.3',
                padding: '0.75em 1em',
              }}
              onClick={() => {
                this.setState({ showBlockedUnblockConfirm: true });
              }}
            >
              I accidentally blocked this website. Unblock it.
            </button>

            <div
              style={{
                display:
                  data.LogType === WebsiteListEntryLogType.BLOCKED &&
                    this.state.showBlockedUnblockConfirm
                    ? ''
                    : 'none',
                marginTop: '10px',
              }}
            >
              <h3 className='subtitle' style={{ textAlign: 'center' }}>
                This website will be removed from your blocked list. Are you sure
                you want to continue?
              </h3>
              <button
                className='button is-rounded is-light is-fullwidth'
                id='cancel-unblock-website'
                style={{ minHeight: '3em' }}
                onClick={() => {
                  this.setState({ showBlockedUnblockConfirm: false });
                }}
              >
                cancel
              </button>
              <button
                className='button is-rounded is-danger is-fullwidth'
                id='confirm-unblock-website'
                style={{ minHeight: '3em', marginTop: '10px' }}
                onClick={() => {
                  this.removeSiteFromBlockedList();
                }}
              >
                Yes, unblock website.
              </button>
            </div>

            <button
              className='button is-rounded is-info is-fullwidth'
              id='cannot-complete-task'
              style={{
                display: 'none',
                minHeight: '4em',
                marginTop: '10px',
              }}
              onClick={() => {
                const currentSite = this.props.webUrl;
                // Log that user does not trust blocked site
                sendUserActionInfo(user_id, 15);
                // Record task completion for the current /a/<id> page.
                chrome.tabs.get(this.props.tabId, tab => {
                  const tabUrl = tab?.url;
                  if (!tabUrl) {
                    console.warn('No tab URL available to parse assignment_id');
                    alert('Thank you! Please go back to your email for the next task.');
                    return;
                  }

                  let assignment_id: number | undefined;
                  try {
                    const urlObj = new URL(tabUrl);
                    assignment_id = getAssignmentIdFromPath(urlObj.pathname);
                  } catch (e) {
                    console.warn('Failed to parse assignment_id from tab URL', e);
                  }

                  if (!assignment_id) {
                    console.warn('Could not parse assignment_id from tab URL path');
                    alert('Thank you! Please go back to your email for the next task.');
                    return;
                  }

                  fetch('https://study-api.com/api/record-complete-assignment-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      assignment_id,
                      completion_type: 'previous_block_extension',
                      // Backend validates `website` against task.site_url if provided.
                      website: currentSite,
                    }),
                  })
                    .then(() => {
                      alert('Thank you! Please go back to your email for the next task.');
                    })
                    .catch(e => {
                      console.warn(
                        'record-complete-assignment-event call failed',
                        e,
                      );
                      // Still show the message even if the call fails
                      alert('Thank you! Please go back to your email for the next task.');
                    });
                });
              }}
            >
              I still do not trust this website. <br />
              I cannot complete the task.
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
              may be an indicator of an attack. Please proceed carefully, and refrain from submitting any credentials.
            </h2>
            <button
              className='button is-rounded is-info is-fullwidth'
              id='trust-on-change'
              style={{
                display:
                  data.LogType === WebsiteListEntryLogType.PROTECTED &&
                    this.props.showchanged === true
                    ? ''
                    : 'none',
                minHeight: '4em',
                marginTop: '10px',
              }}
              onClick={() => {
                const webDomain = this.props.webUrl;
                const tabId = this.props.tabId;
                // Fetch new certificate and update the saved site
                fetchCertificateChain(webDomain)
                  .then(newCertificateChain => {
                    chrome.storage.local.get(
                      { websiteList: {}, sessionList: {} },
                      (items) => {
                        const websiteList: { [key: string]: WebsiteListEntry } = items.websiteList;
                        const sessionList: { [key: string]: boolean } = items.sessionList;

                        if (websiteList[webDomain]) {
                          // Update the certificate chain
                          websiteList[webDomain].certChain = newCertificateChain;
                          websiteList[webDomain].lastVisit = new Date().toLocaleString();
                          sessionList[webDomain] = true;

                          chrome.storage.local.set(
                            { websiteList, sessionList },
                            () => {
                              console.log('Certificate chain updated for', webDomain);
                              // Remove the blocker
                              chrome.tabs.sendMessage(tabId, { action: 'removeBlocker' });
                              chrome.runtime.sendMessage({ type: iMsgReqType.siteDataRefresh });
                              // Log the event
                              sendUserActionInfo(user_id, 13);
                              alert('Certificate updated. You can proceed with browsing.');
                            }
                          );
                        }
                      }
                    );
                  })
                  .catch(err => {
                    console.error('Error fetching new certificate chain:', err);
                    alert('Error updating certificate. Please try again.');
                  });
              }}
            >
              I still trust this website. <br />
              Do not show me this warning.
            </button>
            <button
              className='button is-rounded is-danger is-fullwidth'
              id='cannot-complete-task-cert-change'
              style={{
                display:
                  data.LogType === WebsiteListEntryLogType.PROTECTED &&
                    this.props.showchanged === true
                    ? ''
                    : 'none',
                minHeight: '4em',
                marginTop: '10px',
              }}
              onClick={() => {
                const currentSite = this.props.webUrl;
                // Log the event
                sendUserActionInfo(user_id, 14);
                // Record task completion for the current /a/<id> page.
                chrome.tabs.get(this.props.tabId, tab => {
                  const tabUrl = tab?.url;
                  if (!tabUrl) {
                    console.warn('No tab URL available to parse assignment_id');
                    alert('Thank you! Please go back to your email for the next task.');
                    return;
                  }

                  let assignment_id: number | undefined;
                  try {
                    const urlObj = new URL(tabUrl);
                    assignment_id = getAssignmentIdFromPath(urlObj.pathname);
                  } catch (e) {
                    console.warn('Failed to parse assignment_id from tab URL', e);
                  }

                  if (!assignment_id) {
                    console.warn('Could not parse assignment_id from tab URL path');
                    alert('Thank you! Please go back to your email for the next task.');
                    return;
                  }

                  fetch('https://study-api.com/api/record-complete-assignment-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      assignment_id,
                      completion_type: 'report_extension',
                      // Backend validates `website` against task.site_url if provided.
                      website: currentSite,
                    }),
                  })
                    .then(() => {
                      alert('Thank you! Please go back to your email for the next task.');
                    })
                    .catch(e => {
                      console.warn(
                        'record-complete-assignment-event call failed',
                        e,
                      );
                      // Still show the message even if the call fails
                      alert('Thank you! Please go back to your email for the next task.');
                    });
                });
              }}
            >
              I do not trust this website. <br />
              I cannot complete my task.
            </button>
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
