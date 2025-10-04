// views/assets/styles.js
function getStyles() {
  return `
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            background-attachment: fixed;
            color: #e4e6eb;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container { max-width: 1800px; margin: 0 auto; }
        
        /* Header */
        .header {
            background: rgba(35, 39, 46, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 25px 40px;
            margin-bottom: 25px;
            border: 1px solid rgba(0, 170, 238, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 8px 32px rgba(0, 170, 238, 0.2);
            animation: slideDown 0.6s ease-out;
        }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header h1 {
            color: #00aaee;
            font-size: 28px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .header-badge {
            background: linear-gradient(45deg, #00aaee, #0099cc);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        
        /* Buttons */
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary { background: linear-gradient(45deg, #00aaee, #0099cc); color: white; }
        .btn-danger { background: linear-gradient(45deg, #ff4757, #ee5a6f); color: white; }
        .btn-warning { background: linear-gradient(45deg, #ffa502, #ff7f00); color: white; }
        .btn-success { background: linear-gradient(45deg, #2ecc71, #27ae60); color: white; }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 170, 238, 0.4);
        }
        
        .btn:active {
            transform: translateY(0);
        }
        
        /* Notification Badge */
        .notification-badge {
            position: relative;
            display: inline-block;
        }
        
        .notification-badge .badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff4757;
            color: white;
            border-radius: 50%;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: bold;
            animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .stat-card {
            background: rgba(35, 39, 46, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 18px;
            padding: 22px;
            border: 1px solid rgba(0, 170, 238, 0.2);
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #00aaee, #0099cc);
            transform: scaleX(0);
            transition: transform 0.4s;
        }
        
        .stat-card:hover::before { transform: scaleX(1); }
        
        .stat-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 15px 50px rgba(0, 170, 238, 0.3);
            border-color: rgba(0, 170, 238, 0.5);
        }
        
        .stat-card h3 {
            color: #8b8d94;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .stat-card .value {
            font-size: 32px;
            font-weight: 700;
            color: #00aaee;
            margin-bottom: 6px;
            transition: transform 0.3s;
        }
        
        .stat-card:hover .value { transform: scale(1.1); }
        
        .stat-card .label { color: #a0a3a8; font-size: 11px; }
        
        .stat-icon {
            position: absolute;
            right: 18px;
            top: 18px;
            font-size: 28px;
            opacity: 0.15;
        }
        
        /* Section */
        .section {
            background: rgba(35, 39, 46, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 18px;
            padding: 28px;
            margin-bottom: 20px;
            border: 1px solid rgba(0, 170, 238, 0.2);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .section h2 {
            color: #00aaee;
            margin-bottom: 20px;
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        /* Form */
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin-bottom: 15px;
        }
        
        input, select, textarea {
            background: rgba(26, 29, 35, 0.9);
            border: 2px solid rgba(0, 170, 238, 0.3);
            color: #e4e6eb;
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 13px;
            transition: all 0.3s;
            width: 100%;
        }
        
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #00aaee;
            box-shadow: 0 0 0 3px rgba(0, 170, 238, 0.15);
            transform: translateY(-1px);
        }
        
        /* Table */
        .table-container {
            overflow-x: auto;
            border-radius: 12px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            background: rgba(0, 170, 238, 0.15);
            color: #00aaee;
            padding: 14px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        td {
            padding: 14px;
            border-bottom: 1px solid rgba(0, 170, 238, 0.08);
            font-size: 13px;
        }
        
        tr:hover {
            background: rgba(0, 170, 238, 0.06);
            transition: background 0.2s;
        }
        
        .license-key {
            font-family: 'Courier New', monospace;
            background: rgba(0, 170, 238, 0.12);
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 11px;
            border: 1px solid rgba(0, 170, 238, 0.25);
            cursor: pointer;
            transition: all 0.2s;
            display: inline-block;
        }
        
        .license-key:hover {
            background: rgba(0, 170, 238, 0.2);
            transform: translateX(3px);
        }
        
        .license-key:active {
            transform: scale(0.98);
        }
        
        /* HWID Container */
        .hwid-container {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            position: relative;
        }
        
        .hwid-container::after {
            content: '📋 Click to copy';
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 170, 238, 0.95);
            color: white;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 10px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            z-index: 100;
        }
        
        .hwid-container:hover::after {
            opacity: 1;
        }
        
        .hwid-container:hover {
            background: rgba(0, 170, 238, 0.12);
            transform: translateX(3px);
        }
        
        .hwid-display {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #8b8d94;
            word-break: break-all;
            cursor: pointer;
            padding: 6px;
            background: rgba(0, 170, 238, 0.08);
            border-radius: 6px;
            border: 1px solid rgba(0, 170, 238, 0.2);
            transition: all 0.2s;
            margin-top: 4px;
        }
        
        .hwid-container:hover .hwid-display {
            background: rgba(0, 170, 238, 0.15);
            border-color: rgba(0, 170, 238, 0.4);
            transform: scale(1.01);
            box-shadow: 0 2px 8px rgba(0, 170, 238, 0.3);
        }
        
        .hwid-container:active {
            transform: translateX(3px) scale(0.98);
        }
        
        /* Status Badges */
        .status {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            display: inline-block;
        }
        
        .status.active {
            background: rgba(46, 204, 113, 0.15);
            color: #2ecc71;
            border: 1px solid rgba(46, 204, 113, 0.4);
        }
        
        .status.inactive {
            background: rgba(149, 165, 166, 0.15);
            color: #95a5a6;
            border: 1px solid rgba(149, 165, 166, 0.4);
        }
        
        .status.expired {
            background: rgba(231, 76, 60, 0.15);
            color: #e74c3c;
            border: 1px solid rgba(231, 76, 60, 0.4);
        }
        
        .status.banned {
            background: rgba(255, 71, 87, 0.15);
            color: #ff4757;
            border: 1px solid rgba(255, 71, 87, 0.4);
            animation: blink 2s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        
        /* Toggle Switch */
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 26px;
        }
        
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: #555;
            transition: .3s;
            border-radius: 26px;
        }
        
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
            background: linear-gradient(45deg, #00aaee, #0099cc);
        }
        
        input:checked + .toggle-slider:before {
            transform: translateX(24px);
        }
        
        /* Search Box */
        .search-box {
            position: relative;
            margin-bottom: 18px;
        }
        
        .search-box input {
            padding-left: 40px;
        }
        
        .search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 16px;
            color: #8b8d94;
        }
        
        /* Modal */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            animation: fadeIn 0.2s;
        }
        
        .modal-content {
            background: rgba(35, 39, 46, 0.98);
            margin: 10% auto;
            padding: 30px;
            border: 1px solid rgba(0, 170, 238, 0.3);
            border-radius: 18px;
            width: 90%;
            max-width: 500px;
            animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .close {
            color: #8b8d94;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.2s;
        }
        
        .close:hover { color: #00aaee; }
        
        /* Scroll to Top Button */
        .scroll-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(45deg, #00aaee, #0099cc);
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(0, 170, 238, 0.4);
            opacity: 0;
            transition: all 0.3s;
            z-index: 999;
            display: none;
        }
        
        .scroll-top:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 170, 238, 0.6);
        }

         /* Custom Scrollbar for Notes Modal */
        #viewNotesContent::-webkit-scrollbar {
            width: 8px;
        }
        
        #viewNotesContent::-webkit-scrollbar-track {
            background: rgba(26, 29, 35, 0.5);
            border-radius: 10px;
        }
        
        #viewNotesContent::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #00aaee, #0099cc);
            border-radius: 10px;
        }
        
        #viewNotesContent::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(45deg, #0099cc, #0088dd);
        }
        
        /* Note Card Hover Effect */
        #viewNotesContent > div {
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        #viewNotesContent > div:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 15px rgba(0, 170, 238, 0.3);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .header {
                flex-direction: column;
                gap: 12px;
                text-align: center;
            }
            .stats-grid {
                grid-template-columns: 1fr;
            }
            .form-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
  `;
}

module.exports = { getStyles };
