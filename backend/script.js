function getCertificateInfo() {
  const url = document.getElementById('urlInput').value;
  const frequency = document.getElementById('frequencyInput').value; // Assuming frequency input is provided by the user
  
  let apiUrl = `http://127.0.0.1:5000/certificate?url=${encodeURIComponent(url)}`;
  
  // Add frequency parameter to the API URL if it's provided
  if (frequency) {
      apiUrl += `&frequency=${frequency}`;
  }
  
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const certInfoElement = document.getElementById('certInfo');
      certInfoElement.textContent = JSON.stringify(data, null, 2);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while retrieving the certificate information.');
    });
}
