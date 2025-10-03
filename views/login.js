// views/login.js
const { CONFIG } = require('../config/constants');

function generateLoginPage(error) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - License System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .login-container {
            background: rgba(35, 39, 46, 0.95);
            backdrop-filter: blur(20px);
            padding: 50px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(0, 170, 238, 0.3);
            max-width: 400px;
            width: 100%;
            text-align: center;
            animation: fadeInUp 0.8s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .logo {
            font-size: 60px;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        h1 {
            color: #00aaee;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        p {
            color: #8b8d94;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        
        label {
            display: block;
            color: #a0a3a8;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
        }
        
        input {
            width: 100%;
            background: rgba(26, 29, 35, 0.8);
            border: 2px solid rgba(0, 170, 238, 0.3);
            color: #e4e6eb;
            padding: 15px;
            border-radius: 10px;
            font-size: 15px;
            transition: all 0.3s;
        }
        
        input:focus {
            outline: none;
            border-color: #00aaee;
            box-shadow: 0 0 0 3px rgba(0, 170, 238, 0.2);
        }
        
        button {
            width: 100%;
            background: linear-gradient(45deg, #00aaee, #0099cc);
            color: white;
            padding: 15px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 10px;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 170, 238, 0.4);
        }
        
        .footer {
            margin-top: 30px;
            color: #8b8d94;
            font-size: 13px;
        }
        
        .error {
            background: rgba(231, 76, 60, 0.2);
            border: 1px solid rgba(231, 76, 60, 0.4);
            color: #e74c3c;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            animation: shake 0.5s;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">🔐</div>
        <h1>License System</h1>
        <p>Admin Dashboard Login</p>
        
        ${error === '1' ? '<div class="error">❌ Invalid credentials</div>' : ''}
        
        <form method="post" action="/auth/login">
            <div class="form-group">
                <label>Username</label>
                <input type="text" name="username" required autofocus />
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required />
            </div>
            <button type="submit">Login</button>
        </form>
        
        <div class="footer">
            Ultra Optimized License System v${CONFIG.API_VERSION}
        </div>
    </div>
</body>
</html>
  `;
}

module.exports = { generateLoginPage };
