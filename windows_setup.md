# Windows Setup Guide for AmplifAI 🪟

Follow these steps to set up and run the project on a Windows machine.

## Prerequisites

Before starting, ensure you have the following installed:

1.  **Git**: [Download Git for Windows](https://git-scm.com/download/win)
2.  **Python 3.8+**: [Download Python](https://www.python.org/downloads/windows/) (Check "Add Python to PATH" during installation)
3.  **Node.js 18+**: [Download Node.js](https://nodejs.org/en/download/) (LTS version recommended)
4.  **VS Code**: [Download VS Code](https://code.visualstudio.com/)

---

## 1. Clone the Repository

Open a **Command Prompt** or **PowerShell** terminal in the folder where you want to store the project.

```powershell
# Clone the repository (replace with your actual repo URL)
git clone https://github.com/yourusername/amplifai.git

# Enter the project directory
cd amplifai
```

> **Note**: If you haven't pushed your code from your Mac to GitHub yet, do that first!
> On Mac:
> `git add .`
> `git commit -m "Initial commit"`
> `git push origin main`

---

## 2. Backend Setup (Python)

### Create Virtual Environment
Run the following in your terminal (PowerShell recommended):

```powershell
# Create venv
python -m venv venv

# Activate venv (PowerShell)
.\venv\Scripts\Activate.ps1
```

> **Troubleshooting**: If you get an error about scripts being disabled, run this command in PowerShell as Administrator:
> `Set-ExecutionPolicy RemoteSigned`
> Or simply use Command Prompt: `venv\Scripts\activate.bat`

### Install Dependencies
Once the virtual environment is activated (you should see `(venv)` in your prompt):

```powershell
pip install -r requirements.txt
```

### Create `.env` File
The `.env` file is not shared via Git for security. You must create it manually.

1.  Create a new file named `.env` in the root `amplifai/` folder.
2.  Add your configuration (you can copy this from your Mac or `aws_setup_guide.md`):

```ini
PROJECT_NAME="Hyperbolic Social Media"
VERSION="1.0.0"
AWS_REGION="us-east-1"
# Add your real keys here!
AWS_ACCESS_KEY_ID="your_access_key_id"
AWS_SECRET_ACCESS_KEY="your_secret_access_key"
S3_BUCKET_NAME="hyperbolic-pantry"
DEMO_MODE=False
```

### Start the Backend
```powershell
uvicorn app.main:app --reload
```
The API is now running at `http://localhost:8000`.

---

## 3. Frontend Setup (React)

Open a **new terminal** window (keep the backend running in the first one).

```powershell
# Go to frontend folder
cd frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

The application will open at `http://localhost:5173`.

---

## ✅ Summary

1.  **Terminal 1 (Backend)**: `.\venv\Scripts\Activate.ps1` -> `uvicorn app.main:app --reload`
2.  **Terminal 2 (Frontend)**: `cd frontend` -> `npm run dev`
