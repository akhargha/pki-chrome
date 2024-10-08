/* eslint-disable jsx-a11y/role-supports-aria-props */
import { Component } from 'react';
import { animated, Spring, SpringValue } from 'react-spring';
import { ExtensionSettings } from '../types/Settings';
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
}
class Navbar extends Component<NavbarProps, NavbarState> {
  constructor(props: NavbarProps) {
    super(props);

    // const props = useSpring({ opacity: 1, from: { opacity: 0 } })
    this.state = {
      burgerOpen: false,
      animationDone: true,
      points: props.points,
      group: props.group
    };
  }
  componentDidMount() {
    this.updatePointsFromStorage();
    chrome.storage.onChanged.addListener(this.handleStorageChange);
  }

  componentWillUnmount() {
    chrome.storage.onChanged.removeListener(this.handleStorageChange);
  }

  handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName === 'local' && changes.Points) {
      this.setState({ points: changes.Points.newValue });
    }
    if (areaName === 'local' && changes._pki_userData) {
      const newUserData = changes._pki_userData.newValue;
      if (newUserData && newUserData.group !== undefined) {
        this.setState({ group: newUserData.group });
      }
    }
  };

  updatePointsFromStorage = () => {
    chrome.storage.local.get(['_pki_userData', 'Points'], (data) => {
      const userData = data._pki_userData || {};
      const group = userData.group !== undefined ? userData.group : this.state.group;
      const points = group === 1 ? (data.Points || 0) : -1;
      console.log("data points: ", points, "group: ", group)
      this.setState({ points, group });
    });
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
            {/* <!-- <img src="/icons/shield-halved-solid.svg" width="40" height="28" /> --> */}
          </a>
          {/* <!--POINTS--> */}
          {
            this.state.points !== -1 ? (
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
            className={`navbar-burger burger ${this.state.burgerOpen || !this.state.animationDone
              ? 'is-active'
              : ''
              }`}
            aria-label='menu'
            aria-expanded={
              this.state.burgerOpen || !this.state.animationDone
                ? 'true'
                : 'false'
            }
            data-target='navbarMenu'
            onClick={() => {
              const original = this.state.burgerOpen;
              this.setState({ burgerOpen: !original, animationDone: false });
            }}
            style={{
              marginLeft: '35%',
              justifyContent: 'right',
              cursor: 'pointer',
              width: '5vh', // Adjust the width to match the button size
              height: 'auto', // Adjust the height to match the button size
              maxWidth: '50px',
              outline: 'none',
              border: 'none'
            }}
          >
            {/* <span aria-hidden='true'></span>
            <span aria-hidden='true'></span>
            <span aria-hidden='true'></span> */}
          </img>
        </div>
        <Spring
          from={{
            transform: this.state.burgerOpen
              ? 'translateY(-100%)'
              : 'translateY(0%)'
          }}
          to={{
            transform: this.state.burgerOpen
              ? 'translateY(0%)'
              : 'translateY(-100%)'
          }}
          onRest={this.handleAnimationRest}
        >
          {(props: { transform: SpringValue<string>; }) => (
            <animated.div
              style={{ ...props, zIndex: -1, position: 'fixed', top: '50px' }}
              id='navbarMenu'
              className={`navbar-menu ${this.state.burgerOpen || !this.state.animationDone
                ? 'is-active'
                : ''
                }`}
            >
              <div className='navbar-end'>
                <div className='navbar-item'>
                  <div className='buttons is-centered'>
                    <button
                      className='button is-primary'
                      id='nav-edit-saved-sites-toggle'
                      onClick={() => {
                        this.setState({
                          burgerOpen: false,
                          animationDone: false
                        });
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
                        checked={
                          this.props.settings.autoSearchEnabled ? true : false
                        }
                        id='auto-search-checkbox'
                        onClick={() => {
                          console.log('clicked');
                          chrome.storage.local.set({
                            autoSearchEnabled:
                              !this.props.settings.autoSearchEnabled
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