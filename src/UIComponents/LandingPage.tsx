import { Component, ReactNode } from 'react'
interface LandingPageProps {
  isVisible: boolean
}
class LandingPage extends Component<LandingPageProps> {
  render (): ReactNode {
    return (
      <div style={{ display: this.props.isVisible ? 'block' : 'none' }}>
        <p id='not-recognized-text' style={{ textAlign: 'center' }}>
          <img
            src='/icons/triangle-exclamation-solid.svg'
            style={{ maxWidth: '20px', maxHeight: '20px' }}
          />
          We do <strong>not</strong> recognize this site. If you think you are
          visiting a protected site, please recheck your source and verify you
          are visiting the correct website.
        </p>

        <br />

        <h2
          className='subtitle'
          id='choose-option'
          style={{ textAlign: 'center' }}
        >
          Choose an option below:
        </h2>

        <h2
          className='subtitle'
          id='not-marked-sensitive-proceed-caution'
          style={{ textAlign: 'center', display: 'none' }}
        >
          This site has NOT been marked to be protected by you. Please proceed
          carefully and check your source
        </h2>

        {/* <!--Visiting website that is in sensitive list--> */}
        <h2
          className='subtitle'
          id='all-set'
          style={{ textAlign: 'center', display: 'none' }}
        >
          You are safe!
        </h2>

        {/* <!--Visiting website that is in unsafe list--> */}
        <h2
          className='subtitle'
          id='site-blocked-text'
          style={{ textAlign: 'center', display: 'none' }}
        >
          You had previously marked this website as unsafe. Please proceed
          carefully.
        </h2>

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

        {/* <!--Buttons-->
          <!--Initial--> */}
        <div className='block'>
          <button
            className='button is-rounded is-info is-fullwidth'
            id='sensitive-save-btn'
            style={{ minHeight: '3em' }}
          >
            Save new protected site
          </button>
        </div>

        <div className='block' id='report-phish-prompt-text'>
          <h3 className='subtitle' style={{ textAlign: 'center' }}>
            If you thought this was one of your protected sites, choose that
            site below:{' '}
          </h3>
        </div>

        <h3
          className='subtitle'
          id='temp-unblock-text'
          style={{ textAlign: 'center', display: 'none' }}
        >
          We've temporarily unblocked this site. To permanently unblock it,
          click the hamburger icon in the top right and edit unsafe sites. Only
          do so if you trust this site.
        </h3>

        <button
          className='button is-rounded is-info is-fullwidth'
          id='unblock-once'
          style={{ display: 'none', minHeight: '4em' }}
        >
          I want to risk my online security <br />
          and visit this website anyways
        </button>

        <h2
          className='subtitle'
          style={{ textAlign: 'center', display: 'none', color: 'red' }}
          id='cert-info-change'
        >
          Some security information about this site has been changed! This is
          usually an indicator of an attack. Please proceed carefully.
        </h2>
        <button
          className='button is-rounded is-info is-fullwidth'
          id='trust-on-change'
          style={{ display: 'none' }}
        >
          I still trust this website
        </button>
        <h2
          id='feedback'
          style={{ textAlign: 'center', display: 'none' }}
          className='subtitle'
        >
          Feedback: This was just a test!
        </h2>
        <div id='sensitive-sites-dropdown-container'>
          <div
            className='select is-rounded is-danger'
            id='sensitive-sites-dropdown-container'
            style={{ marginLeft: '25px', marginBottom: '10px' }}
          >
            <select id='sensitive-sites-dropdown'>
              {/* Options will be dynamically added here */}
            </select>
          </div>
        </div>

        <div className='block'>
          <button
            className='button is-rounded is-danger is-clipped'
            id='unsafe-save-btn'
            style={{ marginLeft: '100px' }}
          >
            Report
          </button>
        </div>
      </div>
    )
  }
}

export default LandingPage
