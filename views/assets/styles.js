// views/assets/styles.js - Premium Glassmorphism Design System
function getStyles() {
  return `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

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
            background-attachment: fixed;
            color: #f8fafc;
            min-height: 100vh;
            padding: 24px;
            overflow-x: hidden;
            letter-spacing: -0.01em;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            animation: fadeIn 0.8s ease-out;
        }

        /* Ambient background glow elements */
        body::before {
            content: '';
            position: fixed;
            top: -150px;
            left: 50%;
            transform: translateX(-50%);
            width: 600px;
            height: 300px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 80%);
            pointer-events: none;
            z-index: -1;
        }

        /* Glassmorphic Panels */
        .header, .section, .stat-card, .modal-content {
            background: rgba(13, 18, 30, 0.45);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Header Layout */
        .header {
            padding: 20px 32px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header h1 {
            color: #f8fafc;
            font-size: 24px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, #f8fafc 30%, #a5b4fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header h1 span {
            -webkit-text-fill-color: initial;
        }

        .header-badge {
            background: rgba(99, 102, 241, 0.15);
            color: #818cf8;
            border: 1px solid rgba(99, 102, 241, 0.3);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.05em;
        }

        .header-actions {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        /* Buttons */
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-primary {
            background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
            border: 1px solid rgba(99, 102, 241, 0.2);
        }
        .btn-primary:hover {
            background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.35);
            transform: translateY(-2px);
        }

        .btn-danger {
            background: linear-gradient(135deg, #e11d48 0%, #9f1239 100%);
            border: 1px solid rgba(225, 29, 72, 0.2);
        }
        .btn-danger:hover {
            background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%);
            box-shadow: 0 0 15px rgba(244, 63, 94, 0.35);
            transform: translateY(-2px);
        }

        .btn-warning {
            background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
            border: 1px solid rgba(217, 119, 6, 0.2);
        }
        .btn-warning:hover {
            background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%);
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.35);
            transform: translateY(-2px);
        }

        .btn-success {
            background: linear-gradient(135deg, #059669 0%, #065f46 100%);
            border: 1px solid rgba(5, 150, 105, 0.2);
        }
        .btn-success:hover {
            background: linear-gradient(135deg, #10b981 0%, #047857 100%);
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.35);
            transform: translateY(-2px);
        }

        .btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* Notification Badges for Nav Pills */
        .notification-badge {
            position: relative;
        }

        .notification-badge .badge {
            position: absolute;
            top: -6px;
            right: -6px;
            background: #f43f5e;
            color: white;
            border-radius: 50%;
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            font-size: 10px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid #06080f;
            box-shadow: 0 0 8px rgba(244, 63, 94, 0.5);
            animation: softPulse 1.5s infinite;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .stat-card {
            padding: 20px;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }

        .stat-card::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #4f46e5, #06b6d4);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stat-card:hover {
            transform: translateY(-6px);
            border-color: rgba(99, 102, 241, 0.3);
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5);
        }

        .stat-card:hover::after {
            transform: scaleX(1);
        }

        .stat-card h3 {
            color: #94a3b8;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
        }

        .stat-card .value {
            font-size: 28px;
            font-weight: 800;
            color: #f8fafc;
            margin-bottom: 4px;
            transition: transform 0.3s;
        }

        .stat-card:hover .value {
            transform: scale(1.05);
            transform-origin: left;
        }

        .stat-card .label {
            color: #64748b;
            font-size: 11px;
            font-weight: 500;
        }

        .stat-icon {
            position: absolute;
            right: 16px;
            top: 16px;
            font-size: 24px;
            opacity: 0.15;
            transition: transform 0.3s;
        }

        .stat-card:hover .stat-icon {
            transform: scale(1.2) rotate(8deg);
            opacity: 0.3;
        }

        /* Section Layout */
        .section {
            padding: 24px;
            margin-bottom: 24px;
        }

        .section h2 {
            color: #f8fafc;
            margin-bottom: 18px;
            font-size: 18px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            padding-bottom: 12px;
        }

        /* Forms Layout & Styling */
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-bottom: 12px;
        }

        .form-label {
            display: block;
            margin-bottom: 6px;
            color: #94a3b8;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        input, select, textarea {
            background: rgba(10, 14, 23, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #f8fafc;
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 13px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            width: 100%;
        }

        input::placeholder, textarea::placeholder {
            color: #475569;
        }

        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #6366f1;
            background: rgba(10, 14, 23, 0.95);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
            transform: translateY(-1px);
        }

        /* Tables & Lists */
        .table-container {
            overflow-x: auto;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            background: rgba(5, 7, 12, 0.2);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        th {
            background: rgba(13, 18, 30, 0.7);
            color: #94a3b8;
            padding: 14px 18px;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
        }

        td {
            padding: 14px 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            font-size: 13px;
            color: #cbd5e1;
            vertical-align: middle;
        }

        tr {
            transition: all 0.2s;
        }

        tr:hover {
            background: rgba(255, 255, 255, 0.02);
        }

        /* Keys & Code display elements */
        .license-key {
            font-family: 'JetBrains Mono', monospace;
            background: rgba(99, 102, 241, 0.08);
            color: #a5b4fc;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            border: 1px solid rgba(99, 102, 241, 0.2);
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            display: inline-block;
        }

        .license-key:hover {
            background: rgba(99, 102, 241, 0.16);
            border-color: #818cf8;
            color: #ffffff;
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        .license-key:active {
            transform: scale(0.98);
        }

        .hwid-container {
            cursor: pointer;
            padding: 6px;
            border-radius: 8px;
            position: relative;
            display: inline-block;
            max-width: 100%;
        }

        .hwid-display {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #64748b;
            word-break: break-all;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.2s;
            margin-top: 3px;
        }

        .hwid-container:hover .hwid-display {
            background: rgba(99, 102, 241, 0.08);
            border-color: rgba(99, 102, 241, 0.3);
            color: #cbd5e1;
        }

        /* Status Pills */
        .status {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.03em;
            display: inline-block;
        }

        .status.active {
            background: rgba(16, 185, 129, 0.1);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .status.inactive {
            background: rgba(100, 116, 139, 0.1);
            color: #94a3b8;
            border: 1px solid rgba(100, 116, 139, 0.25);
        }

        .status.expired {
            background: rgba(244, 63, 94, 0.1);
            color: #f43f5e;
            border: 1px solid rgba(244, 63, 94, 0.25);
        }

        .status.banned {
            background: rgba(244, 63, 94, 0.15);
            color: #fb7185;
            border: 1px solid rgba(244, 63, 94, 0.4);
            animation: softPulse 2s infinite;
        }

        /* Toggle Slider */
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
        }

        .toggle-switch input { opacity: 0; width: 0; height: 0; }

        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: #334155;
            transition: .25s cubic-bezier(0.16, 1, 0.3, 1);
            border-radius: 24px;
        }

        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .25s cubic-bezier(0.16, 1, 0.3, 1);
            border-radius: 50%;
        }

        input:checked + .toggle-slider {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
        }

        input:checked + .toggle-slider:before {
            transform: translateX(20px);
        }

        /* Search input wrapper */
        .search-box {
            position: relative;
        }

        .search-box input {
            padding-left: 36px;
        }

        .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 13px;
            color: #64748b;
            pointer-events: none;
        }

        /* Modal Overlay & Card styling */
        .modal {
            display: none;
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(3, 7, 18, 0.8);
            backdrop-filter: blur(8px);
            animation: fadeIn 0.25s;
        }

        .modal-content {
            margin: 10% auto;
            padding: 32px;
            width: 90%;
            max-width: 500px;
            animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .close {
            color: #64748b;
            float: right;
            font-size: 24px;
            font-weight: 500;
            cursor: pointer;
            transition: color 0.2s;
            margin-top: -6px;
        }

        .close:hover { color: #f8fafc; }

        /* Back to top & Scroll elements */
        .scroll-top {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            color: white;
            border: none;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 999;
            display: none;
        }

        .scroll-top:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes softPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        /* Responsive Layouts */
        @media (max-width: 768px) {
            body { padding: 12px; }
            .header {
                flex-direction: column;
                gap: 16px;
                text-align: center;
                padding: 16px;
            }
            .header-actions {
                width: 100%;
                justify-content: center;
                flex-wrap: wrap;
            }
            .stats-grid {
                grid-template-columns: 1fr 1fr;
            }
            .form-grid {
                grid-template-columns: 1fr;
            }
            td, th {
                padding: 10px 12px;
                font-size: 12px;
            }
        }
        
        @media (max-width: 480px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
  `;
}

module.exports = { getStyles };
