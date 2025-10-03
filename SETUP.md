# SkillSwap Setup Guide

## 🚀 Getting Started

This guide will help you set up and run the SkillSwap project locally.

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/skillswap.git
cd skillswap
```

#### 2. Set Up the Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Required: MONGODB_URI, JWT_SECRET
# Optional: SMTP credentials for email, Cloudinary for images
```

**Important Environment Variables (server/.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

#### 3. Set Up the Client

```bash
# Open a new terminal
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Client Environment Variables (client/.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### 4. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# MongoDB should start automatically if installed as a service
# Or manually start it:
mongod
```

**Mac/Linux:**
```bash
# Using Homebrew (Mac):
brew services start mongodb-community

# Or manually:
mongod --config /usr/local/etc/mongod.conf
```

#### 5. Run the Application

**Terminal 1 - Start the Server:**
```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

**Terminal 2 - Start the Client:**
```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173`

### 🎉 Access the Application

Open your browser and navigate to: `http://localhost:5173`

### 📝 Test the Application

1. **Register a new account**
   - Go to http://localhost:5173/register
   - Create your account with name, email, and password

2. **Login**
   - Use your credentials to log in

3. **Complete your profile**
   - Add skills you can teach
   - Add skills you want to learn
   - Update your bio and availability

4. **Browse users**
   - Go to the Browse page
   - Search for users by skills
   - View match percentages

5. **Send exchange requests**
   - View user profiles
   - Send skill exchange requests

## 🛠 Development Commands

### Server Commands

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Run tests (when implemented)
npm test
```

### Client Commands

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📦 Project Structure

```
skillswap/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # Redux store
│   │   ├── utils/        # Utility functions
│   │   └── hooks/        # Custom React hooks
│   └── package.json
│
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── sockets/         # Socket.io handlers
│   └── package.json
│
└── README.md
```

## 🔧 Troubleshooting

### MongoDB Connection Error

If you see `MongoNetworkError`:
1. Make sure MongoDB is running: `mongod`
2. Check your MONGODB_URI in server/.env
3. Ensure MongoDB is accessible on the specified port (default: 27017)

### Port Already in Use

If port 5000 or 5173 is already in use:
1. Change the PORT in server/.env
2. Update VITE_API_URL in client/.env accordingly

### Module Not Found Errors

If you encounter module errors:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Make sure:
1. CLIENT_URL in server/.env matches your client URL
2. VITE_API_URL in client/.env points to your server
3. Server is running before making requests

## 🌐 API Documentation

Once the server is running, visit: `http://localhost:5000/api-docs`

This provides interactive Swagger documentation for all API endpoints.

## 📱 Features Implemented

- ✅ User authentication (register/login)
- ✅ User profiles with skills
- ✅ Skill browsing and search
- ✅ Match algorithm
- ✅ Exchange requests
- ✅ Session scheduling
- ✅ Real-time messaging (Socket.io)
- ✅ Reviews and ratings
- ✅ Notifications

## 🚢 Deployment

### Deploying to Production

**Backend (Heroku/Railway):**
1. Set environment variables
2. Connect to MongoDB Atlas
3. Deploy from GitHub

**Frontend (Vercel/Netlify):**
1. Set build command: `npm run build`
2. Set publish directory: `dist`
3. Set environment variables
4. Deploy

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Stop containers
docker-compose down
```

## 🤝 Contributing

This is a portfolio project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [yourprofile](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Built with MERN Stack (MongoDB, Express, React, Node.js)
- UI Components from Material-UI
- Real-time features with Socket.io
- State management with Redux Toolkit

---

**Happy Coding! 🎉**
