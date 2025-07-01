import { URL } from 'url';

export function fetchCertificateChain(webDomain: string) {
  // Remove "www." from the beginning of the domain
  const shortenedDomain = webDomain.replace(/^www\./, '');
  console.log(
    `localhost:5001/certificate_chain/${shortenedDomain}`,
  );
  return fetch(
    `localhost:5001/certificate_chain/${shortenedDomain}`,
  )
    .then(response => response.json())
    .then(data => {
      if (data.status) {
        return data.output;
      } else {
        throw new Error('Failed to fetch certificate chain');
      }
    })
    .catch(reason => {
      console.log(reason);
      throw new Error('Failed to fetch certificate chain');
    });
}
export function compareCertificateChains(
  chain1: { [x: string]: any; },
  chain2: { [x: string]: any; },
) {
  if (Object.keys(chain1).length !== Object.keys(chain2).length) {
    return false;
  }

  for (const key in chain1) {
    if (key === 'ev') {
      if (chain1[key] !== chain2[key]) {
        return false;
      }
    } else {
      const obj1 = chain1[key];
      const obj2 = chain2[key];

      if (
        !compareObjects(obj1.subject, obj2.subject) ||
        !compareObjects(obj1.issuer, obj2.issuer)
      ) {
        return false;
      }
    }
  }

  return true;
}

export function compareObjects(
  obj1: { [x: string]: any; },
  obj2: { [x: string]: any; },
) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

export function sendWebsitesToDatabase(websites: any[]) {
  const apiUrl = 'https://extension.mobyphish.com/websites'; // todo - what is field called
  const headers = {
    'Content-Type': 'application/json',
  };

  return fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(websites),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Websites sent to database:', data);
    })
    .catch(error => {
      console.error('Error sending websites to database:', error);
    });
}

export function fetchTestWebsites() {
  return fetch(`https://extension.mobyphish.com/websites`)
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(error => {
      throw new Error('Failed to fetch websites');
    });
}

export function grabMainUrl(urlObj: URL) {
  // List of common second-level domains for country code and US TLDs
  const secondLevelDomains = new Set([
    'ac.uk',
    'co.uk',
    'gov.uk',
    'gov.au',
    'com.au',
    'org.au',
    'net.au',
    'edu.au',
    'gov.in',
    'ac.in',
    'co.in',
    'net.in',
    'org.in',
    'edu.us',
    'gov.us',
    'mil.us',
    // Add more as needed
  ]);

  // Extract the protocol
  // const protocol = urlObj.protocol; // http: or https:

  // Extract the hostname

  let hostname = urlObj.hostname;

  // Remove "www." if it exists
  if (hostname.startsWith('www.')) {
    hostname = hostname.substring(4);
  }

  // Split the hostname by dots
  const parts = hostname.split('.');

  // Check if the domain ends with a known second-level domain
  if (parts.length > 2) {
    if (parts.length === 5) {
      if (
        parts[1] === 'acct' &&
        parts[2] === 'ilogicalloanssavings' &&
        parts[3] === 'mobyphish' &&
        parts[4] === 'com'
      )
        // return protocol + '//' + parts.slice(-3).join('.');
        return parts.slice(-4).join('.');
    }
    const potentialSecondLevelDomain = parts.slice(-2).join('.');
    if (secondLevelDomains.has(potentialSecondLevelDomain)) {
      return parts.slice(-3).join('.');
    }
  }

  // Default case: return the last two parts
  return parts.slice(-2).join('.');
}

export type GitHubRelease = {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string | null;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  assets: Array<{
    url: string;
    id: number;
    node_id: string;
    name: string;
    label: string | null;
    uploader: {
      login: string;
      id: number;
      node_id: string;
      avatar_url: string;
      gravatar_id: string | null;
      url: string;
      html_url: string;
      followers_url: string;
      following_url: string;
      gists_url: string;
      starred_url: string;
      subscriptions_url: string;
      organizations_url: string;
      repos_url: string;
      events_url: string;
      received_events_url: string;
      type: string;
      site_admin: boolean;
    };
    content_type: string;
    state: string;
    size: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    browser_download_url: string;
  }>;
  tarball_url: string;
  zipball_url: string;
  body: string;
};

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
