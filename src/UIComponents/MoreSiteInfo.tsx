import { Component } from 'react';
import { Spring, SpringValue, animated } from 'react-spring';
import {
  WebsiteListEntry,
  WebsiteListEntryLogType
} from '../utils/LocalStorage';
import { iMsgReqType } from '../types/MessageTypes';
import { sendUserActionInfo } from '../utils/ExtensionPageUtils';
import { WebsiteListDefaults } from '../utils/Defaults';

interface MoreSiteInfoProps {
  isVisible: boolean;
  data?: WebsiteListEntry;
  webUrl?: string;
  closeFunc: (newWebData?: { [key: string]: WebsiteListEntry; }) => void;
}
interface MoreSiteInfoState {
  animationDone: boolean;
}
export class MoreSiteInfo extends Component<
  MoreSiteInfoProps,
  MoreSiteInfoState
> {
  constructor(p: MoreSiteInfoProps, s: MoreSiteInfoState) {
    super(p, s);

    this.state = {
      animationDone: true
    };
  }
  componentDidMount(): void { }
  render() {
    if (this.props.data === undefined) return;
    const data = this.props.data as WebsiteListEntry;
    return (
      <div
        style={{
          display:
            this.state.animationDone && !this.props.isVisible ? 'none' : 'flex',
          justifyContent: 'center',
          position: 'fixed',
          zIndex: 50,
          paddingTop: '14vh'
        }}
      >
        <Spring
          from={{
            transparency: this.props.isVisible ? '0' : '1',
            width: this.props.isVisible ? '25vh' : '45vh',
            height: this.props.isVisible ? '25vh' : '65vh'
          }}
          to={{
            transparency: this.props.isVisible ? '1' : '0',
            width: this.props.isVisible ? '45vh' : '25vh',
            height: this.props.isVisible ? '65vh' : '25vh'
          }}
          onStart={() => {
            this.setState({ animationDone: false });
          }}
          onRest={() => {
            this.setState({ animationDone: true });
          }}
        >
          {(properties: {
            transparency: SpringValue<string>;
            width: SpringValue<string>;
            height: SpringValue<string>;
          }) => (
            <animated.div
              style={{
                ...properties,
                backgroundColor: 'white',
                border: '1px solid grey',
                borderRadius: '10px'
              }}
            >
              <div className='site-info'>
                <div className='favicon'>
                  <img
                    src={
                      data.faviconUrl === ''
                        ? 'https://via.placeholder.com/50'
                        : data.faviconUrl
                    }
                    alt='FavIcon'
                  />
                </div>
                <div className='title'>{this.props.webUrl as string}</div>
                <div className='dates'>
                  <p>
                    You have marked this site as
                    <p style={{ fontWeight: 'bold' }}>
                      {
                        // you can only set the site as the first two enums.
                        data.LogType === WebsiteListEntryLogType.PROTECTED
                          ? 'protected'
                          : 'blocked'
                      }
                    </p>
                  </p>
                  <p>Last Visit: {data.lastVisit}</p>
                  <p>Date Added: {data.addedAt}</p>
                </div>
                <button
                  className='forget-button'
                  onClick={() => {
                    const url = this.props.webUrl as string;
                    const closer = this.props.closeFunc;
                    chrome.storage.local.get(
                      { websiteList: WebsiteListDefaults, sessionList: {} },
                      function (items) {
                        const websiteList = items.websiteList;
                        const sessionList = items.sessionList;

                        websiteList[url] = undefined;
                        sessionList[url] = undefined;

                        chrome.storage.local.set(
                          {
                            websiteList,
                            sessionList
                          },
                          () => {
                            closer(websiteList);
                            chrome.runtime.sendMessage({
                              type: iMsgReqType.siteDataRefresh
                            });
                            sendUserActionInfo("abcd", 8); // placeholder userid that will be overridden

                          }
                        );
                      }
                    );
                  }}
                >
                  Forget Site
                </button>
                <button
                  className='close-button'
                  onClick={() => this.props.closeFunc()}
                >
                  Close
                </button>
              </div>
            </animated.div>
          )}
        </Spring>
      </div>
    );
  }
}
