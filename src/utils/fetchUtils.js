export function fetchCertificateChain (webDomain) {
  // Remove "www." from the beginning of the domain
  const shortenedDomain = webDomain.replace(/^www\./, '')
  return fetch(
    `http://pkie.engr.uconn.edu/certificate_chain/${shortenedDomain}`
  )
    .then(response => response.json())
    .then(data => {
      if (data.status) {
        return data.output
      } else {
        throw new Error('Failed to fetch certificate chain')
      }
    })
}

function fetchTestWebsites () {
  return fetch(`http://localhost:8080/websites`)
    .then(response => response.json())
    .then(data => {
      return data
    })
    .catch(error => {
      throw new Error('Failed to fetch websites')
    })
}
