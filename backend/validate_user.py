from flask import Flask, request
import random
import string

app = Flask(__name__)

@app.route('/validate', methods=['GET'])
def validate_user_key():
    # Check if user_key is provided, to support existing functionality
    user_key = request.args.get('user_key')
    if user_key:
        print(f"Received user key: {user_key}")
        return 'success'
    
    # New functionality for name and dob
    name = request.args.get('name')
    dob = request.args.get('dob')
    if name and dob:
        print(f"Received name: {name}, DOB: {dob}")
        # Check for the specific name and DOB
        if name.lower() == "anupam" and dob == "2004-01-02":
            return "not found"
        else:
            # Generate a random key for other names and DOBs
            random_key = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
            return random_key
    return "Invalid request"

if __name__ == '__main__':
    app.run(host='localhost', port=8080)
