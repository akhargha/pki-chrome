import { ConnectionOptions, connect } from 'tls'
export function fetchCertificateChain (webDomain: string) {
  // Remove "www." from the beginning of the domain
  const shortenedDomain = webDomain.replace(/^www\./, '')
  console.log(
    `https://extension.mobyphish.com/certificate_chain/${shortenedDomain}`
  )
  return fetch(
    `https://extension.mobyphish.com/certificate_chain/${shortenedDomain}`
  )
    .then(response => response.json())
    .then(data => {
      if (data.status) {
        return data.output
      } else {
        throw new Error('Failed to fetch certificate chain')
      }
    })
    .catch(reason => {
      console.log(reason)
      throw new Error('Failed to fetch certificate chain')
      return {}
    })
}
export function compareCertificateChains (
  chain1: { [x: string]: any },
  chain2: { [x: string]: any }
) {
  if (Object.keys(chain1).length !== Object.keys(chain2).length) {
    return false
  }

  for (const key in chain1) {
    if (key === 'ev') {
      if (chain1[key] !== chain2[key]) {
        return false
      }
    } else {
      const obj1 = chain1[key]
      const obj2 = chain2[key]

      if (
        !compareObjects(obj1.subject, obj2.subject) ||
        !compareObjects(obj1.issuer, obj2.issuer)
      ) {
        return false
      }
    }
  }

  return true
}

export function compareObjects (
  obj1: { [x: string]: any },
  obj2: { [x: string]: any }
) {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}
export function fetchTestWebsites () {
  return fetch(`https://extension.mobyphish.com/websites`)
    .then(response => response.json())
    .then(data => {
      return data
    })
    .catch(error => {
      throw new Error('Failed to fetch websites')
    })
}

export type GitHubRelease = {
  url: string
  assets_url: string
  upload_url: string
  html_url: string
  id: number
  author: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string | null
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  node_id: string
  tag_name: string
  target_commitish: string
  name: string
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string
  assets: Array<{
    url: string
    id: number
    node_id: string
    name: string
    label: string | null
    uploader: {
      login: string
      id: number
      node_id: string
      avatar_url: string
      gravatar_id: string | null
      url: string
      html_url: string
      followers_url: string
      following_url: string
      gists_url: string
      starred_url: string
      subscriptions_url: string
      organizations_url: string
      repos_url: string
      events_url: string
      received_events_url: string
      type: string
      site_admin: boolean
    }
    content_type: string
    state: string
    size: number
    download_count: number
    created_at: string
    updated_at: string
    browser_download_url: string
  }>
  tarball_url: string
  zipball_url: string
  body: string
}

// export function localFetchCertChain (hostname: string, port = 443) {
//   return new Promise((resolve, reject) => {
//     return new Promise((resolve, reject) => {
//       const options: ConnectionOptions = {
//         host: hostname,
//         port: port,
//         rejectUnauthorized: false // Accept self-signed certificates
//       }
//       const socket = connect(options, () => {
//         const peerCertificate = socket.getPeerCertificate(true)
//         if (!peerCertificate || !peerCertificate.raw) {
//           reject('Could not get peer certificate')
//           socket.end()
//           return
//         }

//         const chain = [peerCertificate]

//         let currentCert = peerCertificate
//         while (
//           currentCert &&
//           currentCert.issuerCertificate &&
//           currentCert.issuerCertificate !== currentCert
//         ) {
//           chain.push(currentCert.issuerCertificate)
//           currentCert = currentCert.issuerCertificate
//         }
//         resolve(chain)
//         socket.end()
//       })
//       socket.on('error', err => {
//         reject(err)
//         socket.end()
//       })
//     })
//   })
// }
