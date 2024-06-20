import { Component } from 'react'
import { useSpring, animated, Spring, SpringValue } from 'react-spring'
interface NavbarProps {
  toggleSensitiveSiteControls: () => void
  viewState: 0 | 1
}
interface NavbarState {
  burgerOpen: boolean
  animationDone: boolean
}
class Navbar extends Component<NavbarProps, NavbarState> {
  constructor (props: NavbarProps) {
    super(props, {})

    // const props = useSpring({ opacity: 1, from: { opacity: 0 } })
    this.state = {
      burgerOpen: false,

      animationDone: true
    }
  }
  handleAnimationRest = () => {
    this.setState({ animationDone: true })
  }
  render () {
    return (
      <nav className='navbar' role='navigation' aria-label='main navigation'>
        <div className='navbar-brand' style={{ zIndex: 5, position: 'fixed' }}>
          <a className='navbar-item' href='https://trincoll.edu'>
            <span style={{ fontSize: '2em' }}>🐟</span>
            {/* <!-- <img src="/icons/shield-halved-solid.svg" width="40" height="28" /> --> */}
          </a>
          <h2 style={{ marginLeft: '3em', marginTop: '0.8em' }} id='points'>
            Points:
          </h2>
          {/* <!--POINTS--> */}
          <button
            className={`navbar-burger burger ${
              this.state.burgerOpen || !this.state.animationDone
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
              const original = this.state.burgerOpen
              this.setState({ burgerOpen: !original, animationDone: false })
            }}
            style={{ marginLeft: '55%', justifyContent: 'right' }}
          >
            <span aria-hidden='true'></span>
            <span aria-hidden='true'></span>
            <span aria-hidden='true'></span>
          </button>
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
          {(props: { transform: SpringValue<string> }) => (
            <animated.div
              style={{ ...props, zIndex: -1, position: 'fixed', top: '60px' }}
              id='navbarMenu'
              className={`navbar-menu ${
                this.state.burgerOpen || !this.state.animationDone
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
                        })
                        this.props.toggleSensitiveSiteControls()
                      }}
                    >
                      {this.props.viewState === 0 ? 'Edit site list' : 'BACK'}
                    </button>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <label className='checkbox'>
                      <input
                        type='checkbox'
                        checked
                        id='auto-search-checkbox'
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
    )
  }
}

export default Navbar
