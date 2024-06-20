import { Component } from 'react'

interface SensitiveSiteControlsProps {
  isVisible: boolean
}

class SensitiveSiteControls extends Component<SensitiveSiteControlsProps> {
  render () {
    return (
      <div
        id='sensitive-site-controls'
        style={{ display: this.props.isVisible ? 'block' : 'none' }}
      >
        {/* <!-- Edit sensitive site list --> */}
        <div id='sensitive-sites-list'></div>
        <div className='field has-addons' id='sensitive-input'>
          <div className='control'>
            <input
              className='input'
              type='text'
              placeholder='Enter site URL to protect'
            />
          </div>
          <div className='control'>
            <button className='button is-info' id='sensitive-save'>
              Save
            </button>
          </div>
        </div>

        {/* <!-- Edit unsafe site list --> */}
        <div id='unsafe-sites-list'></div>
        <div className='field has-addons' id='unsafe-input'>
          <div className='control'>
            <input
              className='input'
              type='text'
              placeholder='Enter unsafe site URL'
            />
          </div>
          <div className='control'>
            <button className='button is-info' id='unsafe-save'>
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default SensitiveSiteControls
