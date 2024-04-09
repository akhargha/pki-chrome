from flask import Flask, request, jsonify
from flask_cors import CORS
import ssl
import socket
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for specific origin

def randomTesting(frequency):
    random_number = random.randint(1, frequency)
    return random_number == 1

def generate_fake_certificate_info():
    # Generate fake certificate information
    fake_cert_info = {
        'subject': {'organizationName': 'Fake Org', 'commonName': 'fake.com'},
        'issuer': {'organizationName': 'Fake Issuer', 'commonName': 'fakeissuer.com'},
        'version': 3,
        'serial_number': '1234567890',
        'not_before': '2022-04-01',
        'not_after': '2024-04-01',
    }
    return fake_cert_info

@app.route('/certificate', methods=['GET'])
def get_certificate_info():
    url = request.args.get('url')
    if not url:
        return jsonify(error='URL parameter is missing'), 400

    try:
        # Get the frequency parameter from the query string
        frequency = int(request.args.get('frequency', 100000))  # Default frequency is 5

        # Call randomTesting function with the specified frequency
        if randomTesting(frequency):
            # If randomTesting returns True, generate fake certificate info
            cert_info = generate_fake_certificate_info()
        else:
            # Fetch real certificate information
            hostname = url.split('/')[2] if '://' in url else url.split('/')[0]
            port = 443  # Default HTTPS port

            context = ssl.create_default_context()
            with socket.create_connection((hostname, port)) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()

            cert_info = {
                'subject': dict(x[0] for x in cert['subject']),
                'issuer': dict(x[0] for x in cert['issuer']),
                'version': cert['version'],
                'serial_number': cert['serialNumber'],
                'not_before': cert['notBefore'],
                'not_after': cert['notAfter'],
            }

        return jsonify(cert_info)

    except Exception as e:
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run()
