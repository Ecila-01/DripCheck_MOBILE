# 💧 DripCheck 

[![Live Website](https://img.shields.io/badge/Website-Live-brightgreen.svg)](https://dripcheck.lol)
[![Release](https://img.shields.io/github/v/release/Ecila-01/DripCheck_MOBILE)](https://github.com/Ecila-01/DripCheck_MOBILE/releases)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)]()
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)]()

> **Elevate your daily fit.** <br>
> A full-stack mobile solution to manage your digital closet, plan outfits, and keep your style fresh every single day. Originally developed as a comprehensive university mobile app project.

---

## 📱 App Preview & Download

* **Website:** [dripcheck.lol](https://dripcheck.lol)
* **Download the App:** Grab the latest `.apk` from the [Releases Tab](https://github.com/Ecila-01/DripCheck_MOBILE/releases).

---

## ✨ Key Features

* **👕 Smart Digital Closet:** Upload, crop, and categorize clothing items instantly using a seamless Cloudinary integration.
* **🔒 Secure Authentication:** Custom-built, industry-standard secure access utilizing OTP verification via the Resend API.
* **🚀 High Performance:** Built from the ground up on the MERN stack for a fast, responsive user experience.
* **🌐 Promotional Landing Page:** Fully responsive web presence built with Vite, React, and Tailwind CSS.

---

## 🏗️ Architecture & Tech Stack

This project is structured as a monorepo, housing the mobile application, the server API, and the promotional website in a single repository.

### Directory Structure
* `/frontend` - The React Native (Expo) mobile application.
* `/backend` - The Node.js and Express REST API, backed by MongoDB.
* `/landing-page` - The Vite + React web application hosted on Vercel.

### Technologies Used
* **Frontend:** React Native, Expo, React Navigation
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Web:** React, Vite, Tailwind CSS Version 3
* **Third-Party Services:** Cloudinary (Image Hosting), Resend (OTP/Email Services), Vercel (Web Hosting)

---

## 🚀 Getting Started (Local Development)

If you want to run this project locally, you will need to set up both the backend and the frontend environments.

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn
* Expo CLI (`npm install -g expo-cli`)
* A MongoDB instance (local or Atlas)

### 1. Start the Backend
Navigate to the backend directory, install dependencies, and configure your environment variables.
```bash
cd backend
npm install
# Create a .env file based on the provided template and add your MongoDB/Resend/Cloudinary keys
npm run dev
