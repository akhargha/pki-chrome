# pki-chrome

# How to run backend (needs to be running for the extension to work)-
First go to the backend directory. Then-
```
source certenv/bin/activate
```
Now you are in the certenv virtual environment (this has flask and flask_cors installed). 
Now, to run the backend-
```
python3 certificate_app.py
python3 validate_user.py
```

Now, go to 'Extension' in Chrome-
![Screenshot 2024-05-22 at 7 48 54 AM](https://github.com/akhargha/pki-chrome/assets/118499953/70add5d8-d1ca-4e07-907f-a6a9dd850e68)

Then, click on 'Load Unpacked'-
![Screenshot 2024-05-22 at 7 49 32 AM](https://github.com/akhargha/pki-chrome/assets/118499953/382de2e0-3a4a-4c58-8851-eab52cfe98c3)

Finally, select the directory of the extension (so that manifest.json is in the root directory).








