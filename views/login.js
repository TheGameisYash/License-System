// views/login.js - Premium Glassmorphic Login
const { CONFIG } = require('../config/constants');

function generateLoginPage(error) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Sign In - License System</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Outfit', sans-serif;
        }
        
        body {
            background-color: #06080f;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, rgba(0, 0, 0, 0) 40%),
                radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.05) 0%, rgba(0, 0, 0, 0) 50%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 24px;
            overflow: hidden;
            position: relative;
        }

        body::before {
            content: '';
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(0,0,0,0) 70%);
            pointer-events: none;
            z-index: -1;
        }
        
        .login-container {
            background: rgba(13, 18, 30, 0.5);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            padding: 48px;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.06);
            max-width: 420px;
            width: 100%;
            text-align: center;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideUp {
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
            font-size: 54px;
            margin-bottom: 20px;
            display: inline-block;
            filter: drop-shadow(0 8px 16px rgba(99, 102, 241, 0.3));
            animation: softPulse 2.5s infinite;
        }
        
        @keyframes softPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
        }
        
        h1 {
            color: #f8fafc;
            margin-bottom: 8px;
            font-size: 26px;
            font-weight: 800;
            background: linear-gradient(135deg, #f8fafc 40%, #a5b4fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        p {
            color: #64748b;
            margin-bottom: 32px;
            font-size: 14px;
            font-weight: 500;
        }
        
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        
        label {
            display: block;
            color: #94a3b8;
            margin-bottom: 8px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
        
        input {
            width: 100%;
            background: rgba(10, 14, 23, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #f8fafc;
            padding: 14px 18px;
            border-radius: 12px;
            font-size: 14px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        input:focus {
            outline: none;
            border-color: #6366f1;
            background: rgba(10, 14, 23, 0.95);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
            transform: translateY(-1px);
        }
        
        button {
            width: 100%;
            background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
            border: 1px solid rgba(99, 102, 241, 0.2);
            color: white;
            padding: 14px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            margin-top: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        button:hover {
            background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
            box-shadow: 0 0 18px rgba(99, 102, 241, 0.4);
            transform: translateY(-2px);
        }

        button:active {
            transform: translateY(0);
        }
        
        .footer {
            margin-top: 36px;
            color: #475569;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.02em;
        }
        
        .error {
            background: rgba(244, 63, 94, 0.1);
            border: 1px solid rgba(244, 63, 94, 0.25);
            color: #f43f5e;
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 24px;
            font-size: 13px;
            font-weight: 600;
            animation: shake 0.4s;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">🔐</div>
        <h1>Admin Gateway</h1>
        <p>Ultra License Management Console</p>
        
        ${error === '1' ? '<div class="error">❌ Invalid security credentials</div>' : ''}
        
        <form method="post" action="/auth/login">
            <div class="form-group">
                <label>Admin Username</label>
                <input type="text" name="username" required autofocus placeholder="Enter admin username" />
            </div>
            <div class="form-group">
                <label>Security Password</label>
                <input type="password" name="password" required placeholder="••••••••" />
            </div>
            <button type="submit">Sign In to Dashboard</button>
        </form>
        
        <div class="footer">
            System Infrastructure v${CONFIG.API_VERSION}
        </div>
    </div>
</body>
</html>
  `;
}

module.exports = { generateLoginPage };
