from flask import Flask, request

app = Flask(__name__)

@app.route('/validate', methods=['GET'])
def validate_user_key():
    user_key = request.args.get('user_key')
    print(f"Received user key: {user_key}")
    return 'success'

if __name__ == '__main__':
    app.run(host='localhost', port=8080)