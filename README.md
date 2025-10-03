# SkillSwap - Skill Exchange Platform

A modern web platform where users can exchange skills with each other through structured sessions and real-time communication.

## 📁 Project Structure

```
skillswap/
├── client/          # React Frontend (Vite + React)
├── server/          # Node.js Backend (Express)
└── README.md        # This file
```

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/skillswap.git
cd skillswap
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Environment Setup**

Create `.env` files in both client and server directories:

**server/.env**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. **Run the application**

```bash
# Terminal 1 - Run server
cd server
npm run dev

# Terminal 2 - Run client
cd client
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🎯 Features

- **User Authentication**: Secure JWT-based authentication
- **Profile Management**: Create and manage user profiles with skills
- **Skill Browsing**: Search and filter users by skills
- **Exchange Requests**: Send and manage skill exchange requests
- **Session Scheduling**: Schedule learning sessions with calendar integration
- **Real-time Messaging**: Chat with other users via Socket.io
- **Progress Tracking**: Track learning progress and achievements
- **Reviews & Ratings**: Rate and review completed exchanges

## 🛠 Tech Stack

### Frontend
- React 18
- Redux Toolkit
- Material-UI
- Socket.io Client
- Axios
- React Router
- Formik & Yup
- Vite

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- Bcrypt
- Nodemailer
- Cloudinary (image uploads)

## 📊 Database Schema

### Models
- **User**: User accounts with authentication
- **Skill**: Skills offered and desired
- **Exchange**: Skill exchange agreements
- **Session**: Scheduled learning sessions
- **Message**: Real-time messaging
- **Review**: User reviews and ratings
- **Achievement**: Gamification badges

## 🔑 Key Features Implementation

### 1. Authentication Flow
- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- Protected routes on frontend
- Refresh token mechanism

### 2. Skill Matching Algorithm
- Weighted scoring based on:
  - Skill compatibility
  - User ratings
  - Location proximity
  - Availability overlap
  - Experience level match

### 3. Real-time Messaging
- Socket.io integration
- Online status indicators
- Typing indicators
- Message delivery status
- Unread message counts

## 📝 API Documentation

Once the server is running, visit `http://localhost:5000/api-docs` for Swagger API documentation.

## 🤝 Contributing

This is a portfolio project, but contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your portfolio!

## 👨‍💻 Author

Your Name - [GitHub](https://github.com/yourusername) | [LinkedIn](https://linkedin.com/in/yourprofile)

---

**Note**: This project is designed to showcase full-stack development skills and is part of a professional portfolio.
