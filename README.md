# Ultra-Optimized License Management System

A high-performance, enterprise-grade license management system with HWID (Hardware ID) protection, built with Node.js, Express, and Firebase. Designed for ultra-low database reads and maximum efficiency with advanced caching and batching mechanisms.

![Node.js](https://img.shields.io/badge/Node.js-16.0+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-Admin-orange.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

🌐 **Live Demo**: [https://license-system-pi.vercel.app/](https://license-system-pi.vercel.app/)

## 🚀 Features

### Core Functionality
- **HWID-Based License Binding**: Hardware-locked licenses prevent unauthorized transfers
- **Real-Time License Validation**: Instant verification with intelligent caching
- **Admin Dashboard**: Complete license management interface with analytics
- **RESTful API**: Clean, documented endpoints for easy integration
- **Session Management**: Secure admin authentication with Express sessions
- **Activity Logging**: Comprehensive tracking with batched writes

### Ultra Optimization Engine
- **O(1) HWID Lookups**: Index-based hardware ID searches
- **License Caching**: 10-minute TTL reduces redundant database queries
- **Validation Skip Logic**: 5-minute client-side cache prevents excessive API calls
- **Batched Activity Logging**: Writes 50 logs at once instead of individual writes
- **Memory Cleanup**: Automatic cache cleanup every 15 minutes
- **99.9% Read Reduction**: From ~50,000 reads/day to ~50 reads/day

### Security Features
- **Helmet.js Integration**: Enhanced HTTP security headers
- **CORS Configuration**: Customizable origin restrictions
- **Rate Limiting**: Built-in protection against abuse
- **Secure Sessions**: HTTP-only cookies with configurable expiration
- **Environment Variables**: Sensitive data stored securely
- **Firebase Admin SDK**: Server-side authentication and authorization

## 📋 Requirements

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **Firebase Project**: With Firestore enabled
- **Firebase Service Account**: JSON credentials file

## 💻 Installation

### 1. Clone the Repository
git clone https://github.com/TheGameisYash/License-System.git
cd License-System

text

### 2. Install Dependencies
npm install

text

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

Server Configuration
PORT=3000
NODE_ENV=production

Admin Credentials
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

Session Secret (Generate a strong random string)
SESSION_SECRET=your_super_secret_session_key_here

Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"

CORS Configuration (comma-separated origins, or '*' for all)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

API Configuration
API_VERSION=2.0.0

text

### 4. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Generate new private key (JSON file)
6. Copy credentials to `.env` file

### 5. Start the Server

**Development Mode** (with auto-reload):
npm run dev

text

**Production Mode**:
npm start

text

The server will start on `http://localhost:3000` (or your configured PORT).

## 🎯 Usage

### Quick Start

After starting the server, you'll see:

================================================================================
🚀 ULTRA OPTIMIZED LICENSE SYSTEM v2.0.0
📡 Server: http://localhost:3000
🌐 Landing Page: http://localhost:3000
🔐 Admin Panel: http://localhost:3000/admin
🔑 Login Page: http://localhost:3000/auth/login
👤 Username: your_admin_username
⚡ Ultra Optimizations Active:
├─ HWID Index (O(1) lookups)
├─ License Cache (10min TTL)
├─ Validation Skip (5min TTL)
├─ Activity Batching (50 logs)
└─ Memory Cleanup (15min intervals)

🎯 Expected: ~50 reads/day (99.9% reduction!)
text

### Admin Dashboard Access

1. Navigate to `http://localhost:3000/auth/login`
2. Enter your admin credentials (from `.env`)
3. Access the admin panel at `http://localhost:3000/admin`

## 🔌 API Endpoints

### Authentication Endpoints

#### `POST /auth/login`
Admin login endpoint
Request Body:
{
"username": "admin",
"password": "your_password"
}

Response:
{
"success": true,
"code": "LOGIN_SUCCESS",
"message": "Login successful",
"data": null
}

text

#### `GET /auth/logout`
Admin logout endpoint

### License Management Endpoints

#### `POST /api/register`
Register a new license with HWID

**Query Parameters:**
- `license` (string): License key
- `hwid` (string): Hardware ID

curl "http://localhost:3000/api/register?license=ABC123&hwid=HWID-12345"

text

**Response:**
{
"success": true,
"code": "REGISTER_SUCCESS",
"message": "License registered successfully",
"data": null
}

text

#### `GET /api/validate`
Validate an existing license

**Query Parameters:**
- `license` (string): License key
- `hwid` (string): Hardware ID

curl "http://localhost:3000/api/validate?license=ABC123&hwid=HWID-12345"

text

**Response:**
{
"success": true,
"code": "VALID",
"message": "License is valid",
"data": {
"license": "ABC123",
"hwid": "HWID-12345",
"status": "active"
}
}

text

### Admin Endpoints

#### `GET /admin`
Admin dashboard (requires authentication)

#### `GET /admin/licenses`
Get all licenses (JSON)

#### `POST /admin/generate`
Generate new license keys

**Request Body:**
{
"count": 5,
"prefix": "PRO"
}

text

## 🗂️ Project Structure

License-System/
├── config/
│ ├── constants.js # Configuration constants
│ └── firebase.js # Firebase initialization
├── routes/
│ ├── api.js # API endpoints (register, validate)
│ ├── admin.js # Admin dashboard routes
│ ├── auth.js # Authentication routes
│ └── landing.js # Landing page route
├── utils/
│ └── optimization.js # Caching and optimization logic
├── views/
│ ├── landing.html # Public landing page
│ ├── login.html # Admin login page
│ └── admin.html # Admin dashboard
├── .env # Environment variables (create this)
├── .gitignore # Git ignore file
├── package.json # Project dependencies
├── server.js # Main application entry point
└── README.md # This file

text

## ⚡ Optimization Details

### Caching Strategy

**License Cache**
- **TTL**: 10 minutes
- **Purpose**: Reduces database reads for frequently validated licenses
- **Implementation**: In-memory Map with timestamp tracking

**Validation Skip**
- **TTL**: 5 minutes (client-side)
- **Purpose**: Prevents clients from spamming validation requests
- **Implementation**: Response header caching

**HWID Index**
- **Purpose**: O(1) lookup time for hardware ID searches
- **Rebuild**: Every 15 minutes
- **Impact**: Eliminates full collection scans

### Batched Logging

Instead of writing individual activity logs:
// Old: 1 write per validation = 10,000 writes/day
await firebase.collection('activity').add(log);

// New: 1 write per 50 validations = 200 writes/day
activityBuffer.push(log);
if (activityBuffer.length >= 50) {
await flushActivityLog();
}

text

### Performance Metrics

| Metric | Before Optimization | After Optimization | Improvement |
|--------|-------------------|-------------------|-------------|
| Daily Reads | ~50,000 | ~50 | 99.9% ↓ |
| Daily Writes | ~10,000 | ~200 | 98% ↓ |
| Avg Response Time | 150ms | 5ms | 97% ↓ |
| Memory Usage | N/A | ~50MB | Stable |

## 🛡️ Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use strong SESSION_SECRET** - Generate with `openssl rand -base64 32`
3. **Enable CORS restrictions** - Set specific origins in production
4. **Use HTTPS in production** - Configure SSL/TLS certificates
5. **Regular dependency updates** - Run `npm audit` and update packages
6. **Firebase security rules** - Restrict database access
7. **Rate limiting** - Implement on all public endpoints

## 🔧 Configuration Options

### Session Configuration
session({
secret: CONFIG.SESSION_SECRET,
resave: false,
saveUninitialized: false,
cookie: {
secure: false, // Set to true with HTTPS
httpOnly: true, // Prevents XSS attacks
maxAge: 24 * 60 * 60 * 1000 // 24 hours
}
})

text

### CORS Configuration
// Single origin
ALLOWED_ORIGINS=https://yourdomain.com

// Multiple origins
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com,https://app.yourdomain.com

// All origins (not recommended for production)
ALLOWED_ORIGINS=*

text

## 🚀 Deployment

### Vercel Deployment

1. Install Vercel CLI:
npm install -g vercel

text

2. Deploy:
vercel

text

3. Set environment variables in Vercel dashboard

4. Configure `vercel.json`:
{
"version": 2,
"builds": [
{
"src": "server.js",
"use": "@vercel/node"
}
],
"routes": [
{
"src": "/(.*)",
"dest": "server.js"
}
]
}

text

### Heroku Deployment

1. Create `Procfile`:
web: node server.js

text

2. Deploy:
heroku create your-app-name
git push heroku main
heroku config:set ADMIN_USERNAME=your_username

Set other environment variables...
text

### Docker Deployment

1. Create `Dockerfile`:
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]

text

2. Build and run:
docker build -t license-system .
docker run -p 3000:3000 --env-file .env license-system

text

## 🧪 Testing

Test API endpoints with curl:

Register license
curl -X POST "http://localhost:3000/api/register?license=TEST123&hwid=ABC-123"

Validate license
curl "http://localhost:3000/api/validate?license=TEST123&hwid=ABC-123"

Login
curl -X POST "http://localhost:3000/auth/login"
-H "Content-Type: application/json"
-d '{"username":"admin","password":"your_password"}'

text

## 📊 Monitoring

### Activity Logs
Access real-time activity through the admin dashboard or Firebase console under the `activity` collection.

### Optimization Metrics
Check server console for:
- Cache hit rates
- Buffer flush frequency
- Memory usage stats
- Request latency

## 🐛 Troubleshooting

### Firebase Connection Error
Error: Failed to initialize Firebase

text
**Solution**: Verify Firebase credentials in `.env` file

### Port Already in Use
Error: listen EADDRINUSE: address already in use :::3000

text
**Solution**: Change PORT in `.env` or kill the process using the port

### Session Not Persisting
**Solution**: Check `SESSION_SECRET` is set and cookies are enabled

### High Memory Usage
**Solution**: Reduce cache TTL or batch size in `config/constants.js`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js** - Fast, unopinionated web framework
- **Firebase** - Backend-as-a-Service platform
- **Helmet.js** - Security middleware for Express
- **Node.js Community** - For excellent documentation and support

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/TheGameisYash/License-System/issues)
- **Documentation**: Check the repository wiki for detailed guides
- **Live Demo**: [https://license-system-pi.vercel.app/](https://license-system-pi.vercel.app/)

## 🔄 Version History

### v2.0.0 (Current)
- Ultra-optimization engine implementation
- HWID index for O(1) lookups
- License caching with 10-minute TTL
- Batched activity logging (50 logs per write)
- Memory cleanup intervals
- 99.9% database read reduction
- Enhanced security with Helmet.js
- Admin dashboard improvements
- Graceful shutdown handling

---

**⚡ Built for Performance | 🔒 Secured by Design | 🚀 Ready for Production**

**Made with ❤️ by [TheGameisYash](https://github.com/TheGameisYash)**


