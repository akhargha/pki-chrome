import React, { Component } from 'react'
import './App.css'
import Navbar from './UIComponents/Navbar'
import SensitiveSiteControls from './UIComponents/SensitiveSiteControls'
import LandingPage from './UIComponents/LandingPage'

const enum ViewState {
  Landing,
  SensitiveSiteControls
}
interface AppState {
  viewing: ViewState
}
class App extends Component<{}, AppState> {
  constructor () {
    super({}, {})
    this.state = {
      viewing: ViewState.Landing
    }
  }

  render () {
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
          <div id='favicon-container'></div>

          {/* <!--URL--> */}
          <p id='url-container'></p>
          <br />

          {/* <!--Info Text--> */}
          {/* <!--uhh what else do we call this...--> */}
          <LandingPage isVisible={this.state.viewing === ViewState.Landing} />

          <SensitiveSiteControls
            isVisible={this.state.viewing === ViewState.SensitiveSiteControls}
          />

          {/* <script src='popup.bundle.js'></script> */}
        </body>
      </div>
    )
  }
}

export default App
