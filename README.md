# Initial Setup

Run the following command to install all Node.js dependencies:

```bash
npm install
```

If Node.js is not installed on your machine, install it first before running the command above.

---

# Building the Extension

After making changes to the extension code, rebuild the project by following these steps:

1. Delete the `builds` directory if it already exists.
2. Run the builder script:

```bash
python3 Builder.py 1
```

or, depending on your Python installation:

```bash
python Builder.py 1
```

This will generate a new `builds` directory containing the packaged extensions.

---

# Loading the Extension in Chrome

After running `Builder.py 1`:

1. Open **Google Chrome**.
2. Navigate to **Manage Extensions** (`chrome://extensions`).
3. Enable **Developer mode** (if it is not already enabled).
4. Click **Load unpacked**.
5. Browse to:

```
builds/mobyweb
```

and select that folder to install the **MobyWeb** extension.

Repeat the same process for the reporting extension by selecting its corresponding folder inside the `builds` directory.
