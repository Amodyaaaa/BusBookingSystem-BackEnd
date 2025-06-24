# 🚌 Bus Booking System – Backend

This is the backend API for the Bus Booking System built using **Node.js**, **Express**, and **MongoDB**. It provides routes and controllers for managing buses, passengers, bookings, payments, and more.

---

## 🚀 Features

* JWT-based authentication for passengers and bus operators
* Seat booking with availability checking
* Route and segment management
* Stripe payment integration
* Email confirmations for bookings

---

## 💠 Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT (JSON Web Tokens)
* Stripe API
* Nodemailer

---

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Amodyaaaa/BusBookingSystem-BackEnd.git
cd BusBookingSystem-BackEnd
```

---

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages defined in `package.json`.

---

### 3. Environment Variables

Create a `.env` file in the root of the project with the following example content:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/bus_system
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

> ⚠️ **Never commit your `.env` file!** Add it to `.gitignore`.

---

### 4. Start the Server

```bash
npm start
```

Server will run on: [http://localhost:4000](http://localhost:4000)

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

## ✅ To-Do

* Admin role & dashboard
* Bus tracking system
* SMS booking confirmations
* Frontend integration (React)

---

## 📡 License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).
