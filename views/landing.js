// views/landing.js
const { CONFIG } = require('../config/constants');

const generateLandingPage = () => {
    const endpoints = [
        {
            group: "License & Device",
            items: [
                {
                    id: "api-register",
                    method: "POST",
                    path: "/api/register",
                    description: "Register a new device to a license key. Validates the key, binds the HWID, and returns device details.",
                    requestParams: [
                        { name: "license", type: "string", required: true, desc: "The license key to register." },
                        { name: "hwid", type: "string", required: true, desc: "Hardware ID of the device." },
                        { name: "device_name", type: "string", required: false, desc: "Name of the device." },
                        { name: "device_info", type: "string", required: false, desc: "Additional OS/system info." },
                        { name: "software_id", type: "string", required: false, desc: "Target software ID (defaults to 'default')." }
                    ],
                    responseSuccess: "201 Created\n{\n  \"success\": true,\n  \"code\": \"DEVICE_REGISTERED\",\n  \"message\": \"Device registered successfully\",\n  \"data\": { ... }\n}"
                },
                {
                    id: "api-validate",
                    method: "GET",
                    path: "/api/validate",
                    description: "Validate a license and check HWID bindings. Cached for ultra-fast response times.",
                    requestParams: [
                        { name: "license", type: "string", required: true, desc: "The license key to validate." },
                        { name: "hwid", type: "string", required: true, desc: "Hardware ID (if binding mode requires it)." },
                        { name: "software_id", type: "string", required: false, desc: "Software ID for version and auth checks." },
                        { name: "user_id", type: "string", required: false, desc: "User ID for user_id binding mode." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"code\": \"VALID\",\n  \"message\": \"License is valid\",\n  \"data\": {\n    \"license\": \"XXX...\",\n    \"daysRemaining\": 30\n  }\n}"
                },
                {
                    id: "api-info",
                    method: "GET",
                    path: "/api/license-info",
                    description: "Get detailed read-only information about a specific license without validating.",
                    requestParams: [
                        { name: "license", type: "string", required: true, desc: "The license key to lookup." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"data\": {\n    \"status\": \"Active\",\n    \"expiresAt\": \"2024-12-31T...\"\n  }\n}"
                }
            ]
        },
        {
            group: "Account & Reset",
            items: [
                {
                    id: "api-reset-request",
                    method: "POST",
                    path: "/api/request-hwid-reset",
                    description: "Submit a request to admins to detach the current HWID from a license.",
                    requestParams: [
                        { name: "license", type: "string", required: true, desc: "The license key to reset." },
                        { name: "hwid", type: "string", required: true, desc: "The CURRENT hardware ID requesting the reset." },
                        { name: "reason", type: "string", required: false, desc: "Explanation for the reset request (max 500 chars)." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"code\": \"REQUEST_SUBMITTED\",\n  \"data\": { \"requestId\": \"XYZ...\" }\n}"
                },
                {
                    id: "api-reset-status",
                    method: "GET",
                    path: "/api/check-request-status",
                    description: "Check the administrative review status of an existing HWID reset request.",
                    requestParams: [
                        { name: "license", type: "string", required: true, desc: "The license key associated with the request." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"code\": \"REQUEST_FOUND\",\n  \"data\": { \"status\": \"pending|approved|denied\" }\n}"
                },
                {
                    id: "api-ban-check",
                    method: "GET",
                    path: "/api/check-ban",
                    description: "Quickly verify if a specific hardware ID is completely banned from the system.",
                    requestParams: [
                        { name: "hwid", type: "string", required: true, desc: "The Hardware ID to check." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"code\": \"NOT_BANNED\",\n  \"data\": { \"isBanned\": false }\n}"
                }
            ]
        },
        {
            group: "Software Users",
            items: [
                {
                    id: "api-users-register",
                    method: "POST",
                    path: "/api/users/register",
                    description: "Register a new software credentials account (for license_credentials auth mode).",
                    requestParams: [
                        { name: "username", type: "string", required: true, desc: "Desired username (alphanumeric, min 3 chars)." },
                        { name: "password", type: "string", required: true, desc: "Account password (min 4 chars)." },
                        { name: "email", type: "string", required: false, desc: "Optional recovery email." },
                        { name: "software_id", type: "string", required: false, desc: "Software this account belongs to." }
                    ],
                    responseSuccess: "201 Created\n{\n  \"success\": true,\n  \"code\": \"USER_REGISTERED\",\n  \"message\": \"Account created successfully\"\n}"
                },
                {
                    id: "api-users-login",
                    method: "POST",
                    path: "/api/users/login",
                    description: "Authenticate a software user via credentials instead of purely by license key.",
                    requestParams: [
                        { name: "username", type: "string", required: true, desc: "Registered username." },
                        { name: "password", type: "string", required: true, desc: "Account password." },
                        { name: "software_id", type: "string", required: false, desc: "Associated software." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"code\": \"LOGIN_OK\",\n  \"data\": { \"isPremium\": false }\n}"
                }
            ]
        },
        {
            group: "Software & System",
            items: [
                {
                    id: "api-software-version",
                    method: "GET",
                    path: "/api/software/:id/version",
                    description: "Fetch the latest version info and download URL for a specific software id.",
                    requestParams: [
                        { name: "id", type: "string", required: true, desc: "Software ID (in path)." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"data\": { \"latestVersion\": \"1.0.0\", \"downloadUrl\": \"...\" }\n}"
                },
                {
                    id: "api-software-announcements",
                    method: "GET",
                    path: "/api/software/:id/announcements",
                    description: "Fetch all active announcements to be displayed in the software client.",
                    requestParams: [
                        { name: "id", type: "string", required: true, desc: "Software ID (in path)." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"data\": { \"announcements\": [...] }\n}"
                },
                {
                    id: "api-health",
                    method: "GET",
                    path: "/api/health",
                    description: "System health check. Returns uptime, active connections, and cache stats.",
                    requestParams: [],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"data\": { \"status\": \"healthy\", \"uptime\": 12054 }\n}"
                }
            ]
        },
        {
            group: "PCRemote Auth (JWT Mode)",
            items: [
                {
                    id: "pc-auth-register",
                    method: "POST",
                    path: "/pcremote/auth/register",
                    description: "Register a standalone PCRemote user with Email and Password, returns a JWT token.",
                    requestParams: [
                        { name: "email", type: "string", required: true, desc: "Valid email address." },
                        { name: "password", type: "string", required: true, desc: "Secure password (min 8 chars)." }
                    ],
                    responseSuccess: "201 Created\n{\n  \"success\": true,\n  \"token\": \"eyJhbGci...\",\n  \"isPremium\": false,\n  \"email\": \"user@example.com\"\n}"
                },
                {
                    id: "pc-auth-login",
                    method: "POST",
                    path: "/pcremote/auth/login",
                    description: "Login an existing PCRemote user and obtain a JWT.",
                    requestParams: [
                        { name: "email", type: "string", required: true, desc: "Registered email address." },
                        { name: "password", type: "string", required: true, desc: "Account password." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"token\": \"eyJhbGci...\",\n  \"isPremium\": false\n}"
                },
                {
                    id: "pc-auth-verify",
                    method: "GET",
                    path: "/pcremote/auth/verify",
                    description: "Verify a user's JWT token header to check if their session and premium status are intact.",
                    requestParams: [
                        { name: "Authorization", type: "header", required: true, desc: "Bearer token format: 'Bearer <jwt>'." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"isPremium\": true,\n  \"email\": \"user@example.com\"\n}"
                },
                {
                    id: "pc-auth-change-pw",
                    method: "POST",
                    path: "/pcremote/auth/change-password",
                    description: "Change the password for the currently authenticated PCRemote user.",
                    requestParams: [
                        { name: "Authorization", type: "header", required: true, desc: "Bearer token in headers." },
                        { name: "oldPassword", type: "string", required: true, desc: "Current password." },
                        { name: "newPassword", type: "string", required: true, desc: "New password (min 8 chars)." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"message\": \"Password updated\"\n}"
                },
                {
                    id: "pc-auth-delete",
                    method: "DELETE",
                    path: "/pcremote/auth/delete",
                    description: "Permanently delete the authenticated PCRemote account from the database.",
                    requestParams: [
                        { name: "Authorization", type: "header", required: true, desc: "Bearer token in headers." }
                    ],
                    responseSuccess: "200 OK\n{\n  \"success\": true,\n  \"message\": \"Account deleted\"\n}"
                }
            ]
        }
    ];

    // Helper template strings
    const compileNavLinks = () => {
        return endpoints.map(group => `
      <div class="mb-6">
        <h5 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">${group.group}</h5>
        <ul class="space-y-1">
          ${group.items.map(item => `
            <li>
              <a href="#${item.id}" class="flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg group transition-colors">
                <span class="${item.method === 'GET' ? 'text-blue-400' : item.method === 'POST' ? 'text-green-400' : item.method === 'DELETE' ? 'text-red-400' : 'text-purple-400'} font-mono text-xs w-12 group-hover:drop-shadow-glow">${item.method}</span>
                <span class="truncate">${item.path}</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');
    };

    const compileEndpoints = () => {
        return endpoints.map(group => `
      <div class="mb-12">
        <div class="flex items-center gap-4 mb-6">
          <h2 class="text-2xl font-bold text-white">${group.group}</h2>
          <div class="h-px bg-slate-700 flex-1"></div>
        </div>
        <div class="space-y-10">
          ${group.items.map(item => `
            <div id="${item.id}" class="scroll-mt-24 glass-panel rounded-2xl border border-white/10 p-6 md:p-8">
              <div class="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div class="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg border border-white/5 w-fit">
                  <span class="${item.method === 'GET' ? 'text-blue-400' : item.method === 'POST' ? 'text-green-400' : item.method === 'DELETE' ? 'text-red-400' : 'text-purple-400'} font-bold text-sm tracking-wide">${item.method}</span>
                  <div class="w-px h-4 bg-white/10"></div>
                  <code class="text-slate-200 font-mono text-sm">${item.path}</code>
                </div>
              </div>
              
              <p class="text-slate-400 mb-6 leading-relaxed text-sm">${item.description}</p>
              
              <div class="grid md:grid-cols-2 gap-8">
                <!-- Parameters -->
                <div>
                  <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Parameters
                  </h4>
                  ${item.requestParams.length > 0 ? `
                    <div class="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                      <table class="w-full text-left text-sm">
                        <thead class="bg-white/5 border-b border-white/5">
                          <tr>
                            <th class="px-4 py-2 text-slate-400 font-medium">Name</th>
                            <th class="px-4 py-2 text-slate-400 font-medium">Type</th>
                            <th class="px-4 py-2 text-slate-400 font-medium leading-none text-right">Req</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                          ${item.requestParams.map(param => `
                            <tr class="hover:bg-white/[0.02] transition-colors">
                              <td class="px-4 py-3">
                                <span class="font-mono text-indigo-300">${param.name}</span>
                                <div class="text-xs text-slate-500 mt-1">${param.desc}</div>
                              </td>
                              <td class="px-4 py-3 text-slate-400 font-mono text-xs">${param.type}</td>
                              <td class="px-4 py-3 text-right">
                                ${param.required
                ? '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-400/10 text-red-400 border border-red-400/20">YES</span>'
                : '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-400/10 text-slate-400 border border-slate-400/20">NO</span>'}
                              </td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  ` : `
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 text-sm text-slate-500 italic">No parameters required.</div>
                  `}
                </div>

                <!-- Responses -->
                <div>
                  <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    Success Response
                  </h4>
                  <div class="bg-[#0f111a] rounded-xl border border-white/5 overflow-hidden relative group h-full">
                    <button class="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition-all z-10 copy-btn">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </button>
                    <pre class="p-4 text-xs font-mono text-blue-300 overflow-x-auto m-0"><code>${item.responseSuccess}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    };


    return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth bg-[#09090b] text-slate-300 antialiased">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation | License System</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        code, pre { font-family: 'JetBrains Mono', monospace; }
        
        .glass-panel {
            background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 4px 24px -1px rgba(0,0,0,0.2);
        }

        .neon-glow {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%);
            top: -300px;
            right: -200px;
            z-index: -1;
            border-radius: 50%;
            pointer-events: none;
        }

        .neon-glow-2 {
            position: absolute;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(0,0,0,0) 70%);
            bottom: 10%;
            left: -200px;
            z-index: -1;
            border-radius: 50%;
            pointer-events: none;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }

        .drop-shadow-glow { filter: drop-shadow(0 0 8px currentColor); }
        
        .nav-link.active {
            color: #fff;
            background: rgba(255,255,255,0.05);
            border-left: 2px solid #6366f1;
        }
    </style>
</head>
<body class="selection:bg-indigo-500/30 selection:text-indigo-200">
    <div class="neon-glow"></div>
    <div class="neon-glow-2"></div>

    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 h-16 glass-panel border-b border-white/5 z-50 px-4 md:px-8 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <span class="text-white font-semibold tracking-tight text-lg hidden sm:block">Ultra License API</span>
            <span class="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold ml-2">v${CONFIG?.API_VERSION || '2.0.0'}</span>
        </div>
        <div class="flex items-center gap-4">
            <a href="/admin" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">Admin Panel</a>
            <a href="https://github.com/TheGameisYash/License-System" target="_blank" class="px-4 py-1.5 rounded-full bg-white text-black font-medium text-sm hover:bg-slate-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]">GitHub</a>
        </div>
    </header>

    <div class="flex pt-16 min-h-screen">
        <!-- Sidebar Navigation -->
        <aside class="w-64 fixed hidden lg:block inset-y-0 pt-24 pb-8 h-screen border-r border-white/5 overflow-y-auto z-40">
            ${compileNavLinks()}
        </aside>

        <!-- Main Content -->
        <main class="flex-1 lg:pl-64 flex flex-col min-h-screen">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 flex-1 pt-12 pb-24 w-full">
                
                <!-- Hero Section -->
                <div class="mb-16">
                    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">API Documentation</h1>
                    <p class="text-lg text-slate-400 leading-relaxed mb-8 max-w-2xl">
                        The fully modular, ultra-optimized REST API for your software licensing needs. Integrates seamlessly with your frontend, game engine, or desktop app. Supports Hardware Binding, Credentials Auth, JWTs, and Webhooks.
                    </p>
                    
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center group">
                            <div class="text-emerald-400 mb-2 group-hover:drop-shadow-glow transition-all">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <div class="text-sm font-medium text-white">Ultra Fast</div>
                            <div class="text-xs text-slate-500 mt-1">~50ms Cached Validations</div>
                        </div>
                        <div class="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center group">
                            <div class="text-blue-400 mb-2 group-hover:drop-shadow-glow transition-all">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <div class="text-sm font-medium text-white">Highly Secure</div>
                            <div class="text-xs text-slate-500 mt-1">HWID Binding & Crypto</div>
                        </div>
                        <div class="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center group">
                            <div class="text-indigo-400 mb-2 group-hover:drop-shadow-glow transition-all">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            </div>
                            <div class="text-sm font-medium text-white">Database</div>
                            <div class="text-xs text-slate-500 mt-1">Firestore Integration</div>
                        </div>
                        <div class="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center group">
                            <div class="text-purple-400 mb-2 group-hover:drop-shadow-glow transition-all">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <div class="text-sm font-medium text-white">RESTful</div>
                            <div class="text-xs text-slate-500 mt-1">Easy to understand APIs</div>
                        </div>
                    </div>
                </div>

                <!-- API Base URL Info -->
                <div class="mb-12 glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
                    <h3 class="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">Base URL</h3>
                    <div class="flex items-center gap-3">
                        <code class="flex-1 text-white font-mono bg-black/40 px-4 py-3 rounded-lg border border-white/5 text-sm" id="base-url">https://your-domain.com</code>
                        <button onclick="navigator.clipboard.writeText(window.location.origin); alert('Copied base URL!')" class="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors border border-white/5 tooltip" title="Copy Base URL">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </button>
                    </div>
                    <p class="text-xs text-slate-500 mt-3">All API requests should be sent to this base address. Do not include trailing slashes. All responses return JSON datasets and contain a generic \`success\` boolean indicator parameter to easily distinguish between accepted and rejected logic states.</p>
                </div>

                <!-- Endpoints Container -->
                ${compileEndpoints()}
                
            </div>
            
            <!-- Footer -->
            <footer class="mt-auto py-8 border-t border-white/5 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                <p>&copy; ${new Date().getFullYear()} Ultra License System. All rights reserved.</p>
                <p>Designed for unparalleled security and exceptional performance.</p>
            </footer>
        </main>
    </div>

    <!-- Interactivity Script -->
    <script>
        // Set dynamic base URL
        document.getElementById('base-url').textContent = window.location.origin;

        // Copy JSON buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const codeBlock = e.currentTarget.nextElementSibling;
                navigator.clipboard.writeText(codeBlock.textContent);
                
                // Visual feedback
                const originalSvg = e.currentTarget.innerHTML;
                e.currentTarget.innerHTML = '<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
                setTimeout(() => {
                    e.currentTarget.innerHTML = originalSvg;
                }, 2000);
            });
        });

        // Simple smooth scroll spy (highlight active link)
        const sections = document.querySelectorAll('div[id^="api-"], div[id^="pc-"]');
        const navLinks = document.querySelectorAll('aside a');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('text-white', 'bg-slate-800');
                if (link.getAttribute('href').substring(1) === current) {
                    link.classList.add('text-white', 'bg-slate-800');
                }
            });
        }, { passive: true });
    </script>
</body>
</html>`;
};

module.exports = { generateLandingPage };
