// views/landing.js - Enhanced Landing Page with All API Endpoints
const { CONFIG } = require('../config/constants');

function generateLandingPage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ultra License System - API Documentation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            background-attachment: fixed;
            color: #e4e6eb;
            overflow-x: hidden;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; position: relative; z-index: 1; }
        .header {
            text-align: center;
            padding: 80px 20px 60px;
            animation: fadeInDown 1s ease-out;
        }
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .header h1 {
            font-size: 56px;
            color: #00aaee;
            margin-bottom: 20px;
            text-shadow: 0 0 30px rgba(0, 170, 238, 0.5);
        }
        .header p { font-size: 20px; color: #a0a3a8; margin-bottom: 30px; }
        .badge {
            display: inline-block;
            background: linear-gradient(45deg, #00aaee, #0099cc);
            padding: 10px 25px;
            border-radius: 25px;
            font-weight: 600;
            margin: 10px;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin: 50px 0;
        }
        .feature-card {
            background: rgba(35, 39, 46, 0.8);
            backdrop-filter: blur(20px);
            padding: 30px;
            border-radius: 20px;
            border: 1px solid rgba(0, 170, 238, 0.2);
            transition: all 0.5s;
        }
        .feature-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 20px 60px rgba(0, 170, 238, 0.3);
            border-color: rgba(0, 170, 238, 0.6);
        }
        .feature-card h3 { color: #00aaee; font-size: 24px; margin-bottom: 15px; }
        .feature-card p { color: #a0a3a8; line-height: 1.6; }
        .api-section { margin: 80px 0; }
        .api-section h2 {
            color: #00aaee;
            font-size: 36px;
            margin-bottom: 40px;
            text-align: center;
        }
        .endpoint {
            background: rgba(35, 39, 46, 0.8);
            backdrop-filter: blur(20px);
            padding: 25px;
            border-radius: 15px;
            border-left: 4px solid #00aaee;
            margin-bottom: 20px;
            transition: all 0.3s;
        }
        .endpoint:hover {
            transform: translateX(10px);
            box-shadow: 0 10px 30px rgba(0, 170, 238, 0.2);
        }
        .endpoint-method {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 5px;
            font-weight: 600;
            margin-right: 10px;
            font-size: 14px;
        }
        .method-post { background: linear-gradient(45deg, #2ecc71, #27ae60); }
        .method-get { background: linear-gradient(45deg, #00aaee, #0099cc); }
        .endpoint-url {
            color: #00aaee;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            font-weight: 600;
        }
        .endpoint-desc {
            color: #a0a3a8;
            margin-top: 10px;
            font-size: 14px;
        }
        .code-block {
            background: rgba(26, 29, 35, 0.9);
            border: 1px solid rgba(0, 170, 238, 0.3);
            border-radius: 10px;
            padding: 20px;
            margin-top: 15px;
            overflow-x: auto;
        }
        .code-block pre {
            color: #2ecc71;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
        }
        .admin-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #00aaee, #0099cc);
            color: white;
            padding: 12px 25px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
            z-index: 100;
            box-shadow: 0 5px 20px rgba(0, 170, 238, 0.3);
        }
        .admin-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 170, 238, 0.5);
        }
        .footer {
            text-align: center;
            padding: 40px 20px;
            color: #8b8d94;
            border-top: 1px solid rgba(0, 170, 238, 0.2);
            margin-top: 80px;
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 36px; }
            .features { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <a href="/admin" class="admin-btn">🔐 Admin Panel</a>
    
    <div class="container">
        <div class="header">
            <h1>🚀 Ultra License System</h1>
            <p>Production-Ready License Management API with Advanced Features</p>
            <div>
                <span class="badge">v${CONFIG.API_VERSION}</span>
                <span class="badge">⚡ 99.9% Optimized</span>
                <span class="badge">🔒 HWID Protected</span>
            </div>
        </div>
        
        <div class="features">
            <div class="feature-card">
                <h3>⚡ Ultra Optimized</h3>
                <p>Reduced from 51,000 to ~50 reads/day through intelligent multi-layer caching.</p>
            </div>
            <div class="feature-card">
                <h3>🔒 Security Features</h3>
                <p>Enterprise-grade security with HWID locking and comprehensive ban system.</p>
            </div>
            <div class="feature-card">
                <h3>🎯 Advanced Features</h3>
                <p>Complete license management with self-service capabilities.</p>
            </div>
        </div>
        
        <div class="api-section">
            <h2>📡 API Endpoints</h2>
            
            <div class="endpoint">
                <div>
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/register</span>
                </div>
                <p class="endpoint-desc">Register a device to a license key with HWID binding</p>
                <div class="code-block">
                    <pre>{
  "license": "LIC-XXXX-XXXX-XXXX",
  "hwid": "your-hardware-id",
  "device_name": "My Device",
  "device_info": "Windows 10"
}</pre>
                </div>
            </div>
            
            <div class="endpoint">
                <div>
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/validate?license=XXX&hwid=XXX</span>
                </div>
                <p class="endpoint-desc">Validate a license and HWID combination</p>
                <div class="code-block">
                    <pre>Response: {
  "success": true,
  "code": "VALID",
  "message": "License valid",
  "data": { ... }
}</pre>
                </div>
            </div>
            
            <div class="endpoint">
                <div>
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/license-info?license=XXX</span>
                </div>
                <p class="endpoint-desc">Get license information without HWID validation</p>
            </div>
            
            <div class="endpoint">
                <div>
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/reset-hwid</span>
                </div>
                <p class="endpoint-desc">Reset HWID (self-service) - allows re-registration</p>
            </div>
            
            <div class="endpoint">
                <div>
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/check-ban?hwid=XXX</span>
                </div>
                <p class="endpoint-desc">Check if a hardware ID is banned</p>
            </div>
            
            <div class="endpoint">
                <div>
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/health</span>
                </div>
                <p class="endpoint-desc">Check API health status</p>
                <div class="code-block">
                    <pre>{
  "status": "healthy",
  "version": "${CONFIG.API_VERSION}",
  "cache": { "licenses": 10, "validations": 50 }
}</pre>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Made with ❤️ | Ultra Optimized License System v${CONFIG.API_VERSION}</p>
            <p style="margin-top: 10px;">~50 reads/day | 99.9% optimization | Production ready</p>
        </div>
    </div>
</body>
</html>
  `;
}

module.exports = { generateLandingPage };
