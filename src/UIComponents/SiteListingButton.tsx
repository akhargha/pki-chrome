import { Component, ReactNode } from 'react'

interface SiteListingButtonProps {
  url: string
  onClick: () => void
}

export class SiteListingButton extends Component<SiteListingButtonProps> {
  render (): ReactNode {
    return (
      <button
        className='button is-primary is-small is-rounded sensitive-site'
        onClick={this.props.onClick}
      >
        {this.props.url}
      </button>
    )
  }
}
