

# 🚀 Node.js Project Setup Guide (Windows)

This guide will walk you through setting up and running the project on a **Windows system**.

---

## ✅ Prerequisites

Make sure the following tools are installed on your system:

### 1. [Node.js](https://nodejs.org)
- Download and install the latest stable version.
- The installer includes **npm**, the Node package manager.

### 2. [Git for Windows](https://git-scm.com)
- Download and install Git.
- During installation, you can choose **Git Bash** as your terminal if preferred.

### 3. Verify Installations

Open **Command Prompt** or **Git Bash** and run:

```bash
node -v
npm -v
git --version
```

You should see version numbers if everything is installed correctly.

---

## 📦 Clone the Project

Use the following command to clone the repository:

```bash
git clone https://github.com/Amodyaaaa/BusBookingSystem-BackEnd.git
```

> Replace the URL with the actual HTTPS link to your GitHub repository.

---

## 📁 Navigate into the Project Directory

```bash
cd your-project
```

> Replace `your-project` with the folder name created after cloning.

---

## 📥 Install Dependencies

Install all required packages using:

```bash
npm install
```

This command will read `package.json` and install everything needed.

---

### 4. Environment Variables

Create a `.env` file in the root of the project with the following example content:

```env
PORT=4000
MONGO_URI=<MongoDB ATlas Cluster URL>
STRIPE_SECRET_KEY=<Stripe Secret Key (Starts with sk)>
SECRET=<JWT Token>
```


## ▶️ Run the Project

Start the development server using:

```bash
npm start
```

You should see output indicating the app is running, typically at:

```
http://localhost:3000
```

Open your browser and visit the URL to view the project.

---


## 📁 Folder Structure

```
/controllers     → Route logic
/models          → Mongoose models
/routes          → Express routes
/middleware      → Auth and validation middlewares
/index.js        → Entry point
```

---

## 📬 API Overview

| Method | Endpoint                   | Description                      |
| ------ | -------------------------- | -------------------------------- |
| GET    | /bus/getAllBusesPagination | Fetch buses with optional search |
| POST   | /passanger/addPassanger    | Register new passenger           |
| POST   | /booking/bookSeat          | Book seats                       |
| POST   | /payment/charge            | Handle payment via Stripe        |

---

## 📡 License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).



