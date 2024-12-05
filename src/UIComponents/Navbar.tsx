/* eslint-disable jsx-a11y/role-supports-aria-props */
import { Component } from 'react';
import { animated, Spring, SpringValue } from 'react-spring';
import { ExtensionSettings } from '../types/Settings';
import axios from 'axios';

interface NavbarProps {
  toggleSensitiveSiteControls: () => void;
  viewState: 0 | 1;
  settings: ExtensionSettings;
  points: number;
  group: number;
}
interface NavbarState {
  burgerOpen: boolean;
  animationDone: boolean;
  points: number;
  group: number;
  longTerm: boolean;
}

class Navbar extends Component<NavbarProps, NavbarState> {
  constructor(props: NavbarProps) {
    super(props);

    this.state = {
      burgerOpen: false,
      animationDone: true,
      points: props.points,
      group: props.group,
      longTerm: false, // Initialize longTerm in the state
    };
  }

  componentDidMount() {
    this.updatePointsFromServer(); // Fetch points from server
    this.updateGroupFromStorage(); // Set group from storage on mount
    this.updateLongTermFromStorage(); // Set longTerm from storage on mount
    chrome.storage.onChanged.addListener(this.handleStorageChange);
  }

  componentWillUnmount() {
    chrome.storage.onChanged.removeListener(this.handleStorageChange);
  }

  // Function to fetch points from the server using the user ID
  fetchPoints = async (userId: string) => {
    try {
      const response = await axios.get(`https://mobyphish.com/user_points/${userId}`);
      const points1 = response.data.points;
      this.setState({ points: points1 }); // Update points in state

      // Also update 'Points' in chrome.storage
      chrome.storage.local.set({ Points: points1 }, () => {
        console.log(`Updated Points in local storage to ${points1}`);
      });
    } catch (error) {
      console.error("Error fetching points from server:", error);
      this.setState({ points: -1 }); // Default if fetch fails
    }
  };

  // Function to update points from the server
  updatePointsFromServer = () => {
    chrome.storage.local.get(['_pki_userData'], (data) => {
      const userData = data._pki_userData || {};
      const userId = userData.user_id;
      if (userId) {
        this.fetchPoints(userId); // Call fetch function with userId
      }
    });
  };

  // Function to update group from storage on component mount
  updateGroupFromStorage = () => {
    chrome.storage.local.get('_pki_userData', (data) => {
      const userData = data._pki_userData;
      if (userData && typeof userData.group !== 'undefined') {
        this.setState({ group: userData.group });
      } else {
        console.log('Group information not available.');
      }
    });
  };

  // Function to update longTerm from storage on component mount
  updateLongTermFromStorage = () => {
    chrome.storage.local.get('_pki_userData', (data) => {
      const userData = data._pki_userData;
      if (userData && typeof userData.longTerm !== 'undefined') {
        console.log("LONG:", userData.longTerm);
        this.setState({ longTerm: userData.longTerm });
      } else {
        console.log('LongTerm information not available.');
      }
    });
  };

  // Listen for changes in storage to update points, group, or longTerm
  handleStorageChange = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local') {
      if (changes._pki_userData) {
        const newUserData = changes._pki_userData.newValue;
        if (newUserData && newUserData.user_id) {
          this.fetchPoints(newUserData.user_id); // Fetch new points if user_id changes
          this.setState({
            group: newUserData.group,
            longTerm: newUserData.longTerm,
          });
        }
      }
      if (changes.Points) {
        const newPoints = changes.Points.newValue;
        this.setState({ points: newPoints });
      }
    }
  };

  handleAnimationRest = () => {
    this.setState({ animationDone: true });
  };

  render() {
    return (
      <nav className='navbar' role='navigation' aria-label='main navigation'>
        <div className='navbar-brand' style={{ zIndex: 5, position: 'fixed' }}>
          <a className='navbar-item' href='https://trincoll.edu'>
            <span style={{ fontSize: '2em' }}>🐟</span>
          </a>

          {/* <!-- Display points if group is 1 and longTerm is true --> */}
          {
            this.state.group === 1 && this.state.longTerm ? (
              <h2 style={{ marginLeft: '3em', marginTop: '0.8em', display: 'flex' }} id='points'>
                Points: <span>{this.state.points}</span>
              </h2>
            ) : (
              <h3 style={{ marginLeft: '3em', marginTop: '0.8em', display: 'flex' }} id='points'>
                Points: <span>N/A</span>
              </h3>
            )
          }

          <img
            src='./icons/gear-solid.svg'
            className={`navbar-burger burger ${this.state.burgerOpen || !this.state.animationDone ? 'is-active' : ''}`}
            aria-label='menu'
            aria-expanded={this.state.burgerOpen || !this.state.animationDone ? 'true' : 'false'}
            data-target='navbarMenu'
            onClick={() => {
              const original = this.state.burgerOpen;
              this.setState({ burgerOpen: !original, animationDone: false });
            }}
            style={{
              marginLeft: '35%',
              justifyContent: 'right',
              cursor: 'pointer',
              width: '5vh',
              height: 'auto',
              maxWidth: '50px',
              outline: 'none',
              border: 'none'
            }}
          />
        </div>

        {/* Animated Spring for navbar menu */}
        <Spring
          from={{
            transform: this.state.burgerOpen ? 'translateY(-100%)' : 'translateY(0%)'
          }}
          to={{
            transform: this.state.burgerOpen ? 'translateY(0%)' : 'translateY(-100%)'
          }}
          onRest={this.handleAnimationRest}
        >
          {(props: { transform: SpringValue<string>; }) => (
            <animated.div
              style={{ ...props, zIndex: -1, position: 'fixed', top: '50px' }}
              id='navbarMenu'
              className={`navbar-menu ${this.state.burgerOpen || !this.state.animationDone ? 'is-active' : ''}`}
            >
              <div className='navbar-end'>
                <div className='navbar-item'>
                  <div className='buttons is-centered'>
                    <button
                      className='button is-primary'
                      id='nav-edit-saved-sites-toggle'
                      onClick={() => {
                        this.setState({ burgerOpen: false, animationDone: false });
                        this.props.toggleSensitiveSiteControls();
                      }}
                    >
                      {this.props.viewState === 0 ? 'Edit site list' : 'BACK'}
                    </button>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <label className='checkbox'>
                      <input
                        type='checkbox'
                        checked={!!this.props.settings.autoSearchEnabled}
                        id='auto-search-checkbox'
                        onClick={() => {
                          console.log('clicked');
                          chrome.storage.local.set({
                            autoSearchEnabled: !this.props.settings.autoSearchEnabled
                          });
                        }}
                      />
                      Search for sensitive sites automatically
                    </label>
                  </div>
                </div>
              </div>
            </animated.div>
          )}
        </Spring>
      </nav>
    );
  }
}

export default Navbar;
