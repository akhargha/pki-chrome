import random
import string
import subprocess
import os
import shutil
import sys

USER_IDS = []

if not os.path.isdir("./builds"):
    os.mkdir("./builds")

# Check if the list is empty
if len(os.listdir("./builds")) > 0:
    print("Builds directory is not empty... you should delete this folder before running this script.")


result = subprocess.run(f"npm run build_batch -- user_id=some_value",cwd=os.getcwd(), shell=True, stdout=subprocess.PIPE)
amount = len(sys.argv) > 1 and int(sys.argv[1]) or 10
for i in range(amount):
    user_id ="user_" + str(i)#''.join(random.choices(string.ascii_letters, k=10))
    if user_id in USER_IDS:
        idx = 0
        while True:
            idx+=1
            user_id ="user_" + str(i + idx) #''.join(random.choices(string.ascii_letters, k=10))
            if not user_id in USER_IDS:
                break

    USER_IDS.append(user_id)

    os.mkdir(f"./builds/{user_id}")
    shutil.copytree("./build", f"./builds/{user_id}/mobyweb", dirs_exist_ok=True)
    shutil.copytree("./reporting", f"./builds/{user_id}/reporting", dirs_exist_ok=True)
    with open(f"./builds/{user_id}/reporting/script.js", "r+", encoding="utf8") as file:
        file.seek(0)
        new_content = file.read().replace("user_1", f"{user_id}")
        file.seek(0)
        file.write(new_content)
        file.close()
    with open(f"./builds/{user_id}/mobyweb/static/js/main.js", "r+", encoding="utf8") as file:
        file.seek(0)
        new_content = file.read().replace("'test_user'", f"'{user_id}'")
        file.seek(0)
        file.write(new_content)
        file.close()

    with open(f"./builds/{user_id}/mobyweb/static/js/serviceWorker.js", "r+", encoding="utf8") as file:
        file.seek(0)
        new_content = file.read().replace("'test_user'", f"'{user_id}'")
        file.seek(0)
        file.write(new_content)
        file.close()
    with open(f"./builds/{user_id}/mobyweb/static/js/contentService.js", "r+", encoding="utf8") as file:
        file.seek(0)
        new_content = file.read().replace("'test_user'", f"'{user_id}'")
        file.seek(0)
        file.write(new_content)
        file.close()
    with open(f"./builds/{user_id}/mobyweb/static/js/453.chunk.js", "r+t", encoding="utf8") as file:
        file.seek(0)
        new_content = file.read().replace("'test_user'", f"'{user_id}'")
        file.seek(0)
        file.write(new_content)
        file.close()
        
print(f"Finished generating user builds. Amount: {amount}")
for user in USER_IDS:
    print(user)
