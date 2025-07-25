import { Component } from 'react';
import {
  WebsiteListEntry,
  WebsiteListEntryLogType,
} from '../utils/LocalStorage';
import { SiteListingButton } from './SiteListingButton';
import { iMsgReq, iMsgReqType } from '../types/MessageTypes';
import { MoreSiteInfo } from './MoreSiteInfo';
import { Spring, SpringValue, animated } from 'react-spring';
import { fetchCertificateChain, grabMainUrl, sendWebsitesToDatabase } from '../utils/fetchUtils';
import { sendUserActionInfo } from '../utils/ExtensionPageUtils';
import { WebsiteListDefaults } from '../utils/Defaults';

interface SensitiveSiteControlsProps {
  isVisible: boolean;
  websiteData: { [key: string]: WebsiteListEntry; };
}
interface SensitiveSiteControlsState {
  websiteOpen?: WebsiteListEntry;
  url: string;
  sensitiveInput: string;
  blockedInput: string;
}
const user_id: string = require('../version').default.user_id;

class SensitiveSiteControls extends Component<
  SensitiveSiteControlsProps,
  SensitiveSiteControlsState
> {
  constructor(P: SensitiveSiteControlsProps, S: SensitiveSiteControlsState) {
    super(P, S);
    this.state = {
      url: '',
      sensitiveInput: '',
      blockedInput: '',
    };
  }
  componentDidMount(): void {
    chrome.runtime.onMessage.addListener(_data => {
      const data = _data as iMsgReq;
      switch (data.type) {
        case iMsgReqType.fetchCertificateChain:
        case iMsgReqType.sendUserActionInfo:
        case iMsgReqType.fetchTestWebsites:
        case iMsgReqType.frontEndRequestUserSaveSite:
          break;
        case iMsgReqType.siteDataRefresh:
          chrome.storage.local.get(
            //websiteList is the list of sites we have saved as safe or unsafe
            //session list is the list of sites that we have visitied in this session, so no reverification is needed.
            { websiteList: WebsiteListDefaults, sessionList: {} },
            function (items) {
              // ss({ websiteData: websiteList })
            },
          );
          break;
      }
    });
  }
  render() {
    const wData = this.props.websiteData;
    return (
      <div
        id='sensitive-site-controls'
        style={{
          display: this.props.isVisible ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        {/* Site data overlay */}
        <MoreSiteInfo
          isVisible={this.state.websiteOpen !== undefined}
          closeFunc={(webData?: { [key: string]: WebsiteListEntry; }) => {
            if (webData) {
              // this.setState({ websiteOpen: undefined, websiteData: webData })
              this.setState({ websiteOpen: undefined });
            } else {
              this.setState({ websiteOpen: undefined });
            }
          }}
          data={this.state.websiteOpen}
          webUrl={this.state.url}
        />
        <Spring
          from={{
            filter:
              this.state.websiteOpen === undefined ? 'blur(5px)' : 'blur(0px)',
          }}
          to={{
            filter:
              this.state.websiteOpen === undefined ? 'blur(0px)' : 'blur(5px)',
          }}
        >
          {(props: { filter: SpringValue<string>; }) => (
            <>
              {/* Safe list */}
              <animated.div id='sensitive-sites-list' style={{ ...props }}>
                {Object.keys(wData).map(key =>
                  wData[key] !== undefined &&
                    wData[key].LogType === WebsiteListEntryLogType.PROTECTED ? (
                    <SiteListingButton
                      key={key}
                      url={key}
                      onClick={() => {
                        this.setState({
                          websiteOpen: wData[key],
                          url: key,
                        });
                      }}
                    />
                  ) : null,
                )}
              </animated.div>

              <animated.div
                className='field has-addons'
                id='sensitive-input'
                style={{ ...props }}
              >
                <div className='control'>
                  <input
                    className='input'
                    type='text'
                    placeholder='Enter site domain to protect'
                    onBlur={event => {
                      let s = event.target.value;
                      if (!s.startsWith("http")) {
                        console.log(s);
                        s = "https://" + s;
                      }
                      try {
                        const url = new URL(s);
                        const shortenedDomain = grabMainUrl(url);
                        this.setState({
                          sensitiveInput: shortenedDomain,
                        });
                      } catch (error) {
                        alert("Invalid URL: " + s);
                      }

                    }}
                  />
                </div>
                <div className='control'>
                  <button
                    className='button is-info'
                    id='sensitive-save'
                    onClick={() => {
                      const webDomain = this.state.sensitiveInput;
                      if (webDomain === '') return;
                      fetchCertificateChain(webDomain as string).then(
                        async certificateChain => {
                          const currentTimeInMs = Date.now(); // Get current time in milliseconds since Unix epoch
                          const currentTime = new Date(
                            currentTimeInMs,
                          ).toLocaleString(); // Convert to local date and time string

                          const localStorageData =
                            await chrome.storage.local.get({
                              websiteList: WebsiteListDefaults,
                              sessionList: {},
                            });
                          const userid = user_id;
                          const websiteList: {
                            [key: string]: WebsiteListEntry;
                          } = localStorageData.websiteList;
                          const sessionList: { [key: string]: boolean; } =
                            localStorageData.sessionList;

                          websiteList[webDomain] = {
                            LogType: WebsiteListEntryLogType.PROTECTED,
                            certChain: certificateChain,
                            addedAt: currentTime,
                            lastVisit: currentTime,
                            //faviconUrl: tab.favIconUrl as string
                            //TODO: add refresh for this when opening the site.
                            faviconUrl: '',
                          };

                          sessionList[webDomain] = true;

                          await chrome.storage.local.set({
                            websiteList,
                            sessionList,
                          });

                          //so our ui can refresh on open
                          chrome.runtime
                            .sendMessage({
                              type: iMsgReqType.siteDataRefresh,
                            })
                            .then(() => { })
                            .catch(e => console.warn(e));

                          sendUserActionInfo(userid, 4);
                          sendUserActionInfo(userid, 7);
                          sendWebsitesToDatabase([webDomain]);
                        },
                      );
                    }}
                  >
                    Save
                  </button>
                </div>
              </animated.div>

              {/* Unsafe list */}
              <animated.div id='unsafe-sites-list' style={{ ...props }}>
                {Object.keys(wData).map(key =>
                  wData[key] !== undefined &&
                    wData[key].LogType === WebsiteListEntryLogType.BLOCKED ? (
                    <SiteListingButton
                      key={key}
                      url={key}
                      onClick={() => {
                        this.setState({
                          websiteOpen: wData[key],
                          url: key,
                        });
                      }}
                    />
                  ) : null,
                )}
              </animated.div>

              <animated.div
                className='field has-addons'
                id='unsafe-input'
                style={{ ...props }}
              >
                <div className='control'>
                  <input
                    className='input'
                    type='text'
                    placeholder='Enter unsafe site domain'
                    onBlur={event => {
                      let s = event.target.value.trim();

                      // If user didn't type http/https, prepend https://
                      if (!s.startsWith("http")) {
                        s = "https://" + s;
                      }

                      try {
                        // Always parse the URL and set blockedInput
                        const url = new URL(s);
                        const shortenedDomain = grabMainUrl(url);
                        this.setState({
                          blockedInput: shortenedDomain,
                        });
                      } catch (error) {
                        alert("Invalid URL: " + s);
                      }
                    }}
                  />
                </div>
                <div className='control'>
                  <button
                    className='button is-info'
                    id='unsafe-save'
                    onClick={() => {
                      const webDomain = this.state.blockedInput;
                      if (webDomain === '') return;
                      fetchCertificateChain(webDomain as string).then(
                        async certificateChain => {
                          const currentTimeInMs = Date.now(); // Get current time in milliseconds since Unix epoch
                          const currentTime = new Date(
                            currentTimeInMs,
                          ).toLocaleString(); // Convert to local date and time string

                          const localStorageData =
                            await chrome.storage.local.get({
                              websiteList: WebsiteListDefaults,
                              sessionList: {},
                            });

                          const userid = user_id;
                          const websiteList: {
                            [key: string]: WebsiteListEntry;
                          } = localStorageData.websiteList;
                          const sessionList: { [key: string]: boolean; } =
                            localStorageData.sessionList;

                          websiteList[webDomain] = {
                            LogType: WebsiteListEntryLogType.BLOCKED,
                            certChain: certificateChain,
                            addedAt: currentTime,
                            lastVisit: currentTime,
                            //faviconUrl: tab.favIconUrl as string
                            //TODO: add refresh for this when opening the site.
                            faviconUrl: '',
                          };

                          sessionList[webDomain] = true;

                          await chrome.storage.local.set({
                            websiteList,
                            sessionList,
                          });

                          //so our ui can refresh on open
                          chrome.runtime
                            .sendMessage({
                              type: iMsgReqType.siteDataRefresh,
                            })
                            .then(() => { })
                            .catch(e => console.warn(e));

                          sendUserActionInfo(userid, 6);
                          sendUserActionInfo(userid, 17);
                        },
                      );
                    }}
                  >
                    Save
                  </button>
                </div>
              </animated.div>
            </>
          )}
        </Spring>
      </div>
    );
  }
}

export default SensitiveSiteControls;
