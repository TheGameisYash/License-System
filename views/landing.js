// views/landing.js - Premium API Documentation Hub & Integration Center
const { CONFIG } = require('../config/constants');

const generateLandingPage = () => {
    return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth bg-[#06080f] text-slate-300 antialiased">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integration & API Documentation | License System</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; }
        code, pre { font-family: 'JetBrains Mono', monospace; }
        
        .glass-panel {
            background: rgba(13, 18, 30, 0.45);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        }

        .ambient-glow {
            position: absolute;
            width: 800px;
            height: 500px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(0,0,0,0) 80%);
            top: -200px;
            right: -200px;
            z-index: -1;
            pointer-events: none;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #06080f; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        
        .tab-btn.active {
            color: #818cf8;
            border-bottom: 2px solid #6366f1;
            background: rgba(99, 102, 241, 0.03);
        }
    </style>
</head>
<body class="selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen relative overflow-x-hidden">
    <div class="ambient-glow"></div>

    <!-- Header Navigation -->
    <header class="fixed top-0 left-0 right-0 h-16 glass-panel border-b border-white/5 z-50 px-6 md:px-12 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                🔐
            </div>
            <span class="text-white font-bold tracking-tight text-lg">Ultra License Hub</span>
            <span class="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold ml-2">v${CONFIG.API_VERSION}</span>
        </div>
        <div class="flex items-center gap-4">
            <a href="/admin" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">🔐 Admin Dashboard</a>
        </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-24 grid lg:grid-cols-12 gap-12">
        <!-- Documentation Content -->
        <main class="lg:col-span-7 space-y-12">
            <div>
                <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">API Documentation</h1>
                <p class="text-lg text-slate-400 leading-relaxed max-w-xl">
                    Secure, ultra-optimized REST endpoints supporting Hardware Fingerprinting, Custom Configuration Metadata payloads, and HMAC-SHA256 Response integrity signing.
                </p>
            </div>

            <!-- API Key Warning -->
            <div class="glass-panel p-6 rounded-2xl border-indigo-500/20 bg-indigo-500/5 space-y-2">
                <h3 class="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">🔑 API Key Authentication</h3>
                <p class="text-sm text-slate-300 leading-relaxed">
                    All API queries request authentication using the Software Product SDK Key. Send this secret value inside the request header as <code class="text-indigo-300 font-semibold bg-indigo-950/40 px-1.5 py-0.5 rounded">X-Software-API-Key</code>.
                </p>
            </div>

            <!-- Anti-Crack Signing Section -->
            <div class="glass-panel p-6 rounded-2xl border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <h3 class="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">🛡️ Response Integrity Verification</h3>
                <p class="text-sm text-slate-300 leading-relaxed">
                    To prevent local proxy cracks (e.g. host redirects via Fiddler/Charles), validation responses include an <code class="text-emerald-300 font-semibold bg-emerald-950/40 px-1.5 py-0.5 rounded">X-Response-Signature</code> header. This is an HMAC-SHA256 hash of the response JSON string using the software's SDK API Key as the secret. Verify this signature in your client before unlocking application features.
                </p>
            </div>

            <!-- Base URL -->
            <div class="glass-panel p-6 rounded-2xl space-y-3">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Base Endpoint Address</h3>
                <div class="flex items-center gap-3">
                    <code class="flex-1 text-white font-mono bg-black/40 px-4 py-3 rounded-lg border border-white/5 text-sm" id="base-url-display">http://localhost:3000</code>
                    <button onclick="navigator.clipboard.writeText(window.location.origin); alert('Copied Base URL')" class="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors border border-white/5">
                        📋
                    </button>
                </div>
            </div>

            <!-- Endpoints Specification -->
            <div class="space-y-8">
                <h2 class="text-2xl font-bold text-white border-b border-slate-800 pb-3">REST Endpoints</h2>

                <!-- Validate -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold rounded-lg text-xs font-mono">GET</span>
                        <code class="text-white font-bold font-mono">/api/validate</code>
                    </div>
                    <p class="text-sm text-slate-400">Validate a license key and bound hardware fingerprint. Returns custom metadata, announcements, and version info.</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">Query Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">license</code> <span class="text-red-400 font-semibold">(Required)</span>: The license key string.</li>
                            <li><code class="text-indigo-300 font-mono">hwid</code> <span class="text-red-400 font-semibold">(Required if binding=hwid)</span>: Client device Hardware ID (10-256 chars).</li>
                            <li><code class="text-indigo-300 font-mono">software_id</code> <span class="text-slate-500">(Optional)</span>: Software product identifier. Default: <code class="text-slate-400 font-mono">"default"</code></li>
                            <li><code class="text-indigo-300 font-mono">username</code> <span class="text-amber-400 font-semibold">(Conditional)</span>: Required if authMode is <code class="text-slate-400 font-mono">license_credentials</code></li>
                            <li><code class="text-indigo-300 font-mono">password</code> <span class="text-amber-400 font-semibold">(Conditional)</span>: Required if authMode is <code class="text-slate-400 font-mono">license_credentials</code></li>
                        </ul>
                    </div>
                </div>

                <!-- Register -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded-lg text-xs font-mono">POST</span>
                        <code class="text-white font-bold font-mono">/api/register</code>
                    </div>
                    <p class="text-sm text-slate-400">Register a new client device and bind the hardware fingerprint to a license key.</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">Request Body Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">license</code> <span class="text-red-400 font-semibold">(Required)</span>: License key string.</li>
                            <li><code class="text-indigo-300 font-mono">hwid</code> <span class="text-red-400 font-semibold">(Required if binding=hwid)</span>: Hardware ID (10-256 chars).</li>
                            <li><code class="text-indigo-300 font-mono">software_id</code> <span class="text-slate-500">(Optional)</span>: Software product identifier.</li>
                            <li><code class="text-indigo-300 font-mono">device_name</code> <span class="text-slate-500">(Optional)</span>: Client device name string.</li>
                            <li><code class="text-indigo-300 font-mono">device_info</code> <span class="text-slate-500">(Optional)</span>: Device details. Falls back to User-Agent.</li>
                            <li><code class="text-indigo-300 font-mono">cpu_info</code> <span class="text-slate-500">(Optional)</span>: Client processor description.</li>
                            <li><code class="text-indigo-300 font-mono">gpu_info</code> <span class="text-slate-500">(Optional)</span>: Client graphics hardware description.</li>
                            <li><code class="text-indigo-300 font-mono">motherboard_uuid</code> <span class="text-slate-500">(Optional)</span>: Base motherboard UUID string.</li>
                            <li><code class="text-indigo-300 font-mono">username</code> <span class="text-amber-400 font-semibold">(Conditional)</span>: Required if authMode is <code class="text-slate-400 font-mono">license_credentials</code></li>
                            <li><code class="text-indigo-300 font-mono">password</code> <span class="text-amber-400 font-semibold">(Conditional)</span>: Required if authMode is <code class="text-slate-400 font-mono">license_credentials</code></li>
                        </ul>
                    </div>
                </div>

                <!-- License Info -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold rounded-lg text-xs font-mono">GET</span>
                        <code class="text-white font-bold font-mono">/api/license-info</code>
                    </div>
                    <p class="text-sm text-slate-400">Retrieve detailed license information including status, expiry, activation date, and customer metadata.</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">Query Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">license</code> <span class="text-red-400 font-semibold">(Required)</span>: License key to look up.</li>
                        </ul>
                    </div>
                </div>

                <!-- Request HWID Reset -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded-lg text-xs font-mono">POST</span>
                        <code class="text-white font-bold font-mono">/api/request-hwid-reset</code>
                    </div>
                    <p class="text-sm text-slate-400">Submit a request to reset the device binding for a license. Requires admin approval (24-48 hours).</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">Request Body Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">license</code> <span class="text-red-400 font-semibold">(Required)</span>: License key.</li>
                            <li><code class="text-indigo-300 font-mono">hwid</code> <span class="text-red-400 font-semibold">(Required)</span>: Current Hardware ID (10-256 chars).</li>
                            <li><code class="text-indigo-300 font-mono">reason</code> <span class="text-slate-500">(Optional)</span>: Reason for reset (max 500 characters).</li>
                        </ul>
                    </div>
                </div>

                <!-- Check Reset Status -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold rounded-lg text-xs font-mono">GET</span>
                        <code class="text-white font-bold font-mono">/api/check-request-status</code>
                    </div>
                    <p class="text-sm text-slate-400">Check the status of the most recent HWID reset request for a license.</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">Query Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">license</code> <span class="text-red-400 font-semibold">(Required)</span>: License key.</li>
                        </ul>
                        <h4 class="text-xs font-bold text-slate-400 uppercase mt-3">Status Values</h4>
                        <ul class="text-xs space-y-1 text-slate-300">
                            <li><code class="text-amber-300 font-mono">pending</code> — Waiting for admin review</li>
                            <li><code class="text-emerald-300 font-mono">approved</code> — HWID has been reset</li>
                            <li><code class="text-red-300 font-mono">denied</code> — Request was rejected</li>
                        </ul>
                    </div>
                </div>

                <!-- Check Ban -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold rounded-lg text-xs font-mono">GET</span>
                        <code class="text-white font-bold font-mono">/api/check-ban</code>
                    </div>
                    <p class="text-sm text-slate-400">Check if a specific Hardware ID is on the system ban list.</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">Query Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">hwid</code> <span class="text-red-400 font-semibold">(Required)</span>: Hardware ID to check.</li>
                        </ul>
                    </div>
                </div>

                <!-- Software Version -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold rounded-lg text-xs font-mono">GET</span>
                        <code class="text-white font-bold font-mono">/api/software/:id/version</code>
                    </div>
                    <p class="text-sm text-slate-400">Get the latest version and download URL for a software product. Requires <code class="text-slate-300 font-mono text-xs">versionCheck</code> enabled.</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">URL Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">:id</code> <span class="text-red-400 font-semibold">(Required)</span>: Software product ID.</li>
                        </ul>
                    </div>
                </div>

                <!-- Software Announcements -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold rounded-lg text-xs font-mono">GET</span>
                        <code class="text-white font-bold font-mono">/api/software/:id/announcements</code>
                    </div>
                    <p class="text-sm text-slate-400">Retrieve active announcements for a software product. Expired announcements are filtered out.</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">URL Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">:id</code> <span class="text-red-400 font-semibold">(Required)</span>: Software product ID.</li>
                        </ul>
                    </div>
                </div>

                <!-- User Register -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded-lg text-xs font-mono">POST</span>
                        <code class="text-white font-bold font-mono">/api/users/register</code>
                    </div>
                    <p class="text-sm text-slate-400">Create a new user account and link it to a license key. Used when <code class="text-slate-300 font-mono text-xs">authMode = license_credentials</code>.</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">Request Body Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">username</code> <span class="text-red-400 font-semibold">(Required)</span>: 3-20 chars, alphanumeric + underscore only.</li>
                            <li><code class="text-indigo-300 font-mono">password</code> <span class="text-red-400 font-semibold">(Required)</span>: 4-64 characters.</li>
                            <li><code class="text-indigo-300 font-mono">license_key</code> <span class="text-red-400 font-semibold">(Required)</span>: Valid, unclaimed license key to link.</li>
                            <li><code class="text-indigo-300 font-mono">software_id</code> <span class="text-slate-500">(Optional)</span>: Software product ID. Default: <code class="text-slate-400 font-mono">"default"</code></li>
                            <li><code class="text-indigo-300 font-mono">email</code> <span class="text-slate-500">(Optional)</span>: Email address.</li>
                        </ul>
                    </div>
                </div>

                <!-- User Login -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded-lg text-xs font-mono">POST</span>
                        <code class="text-white font-bold font-mono">/api/users/login</code>
                    </div>
                    <p class="text-sm text-slate-400">Authenticate a user and get live license status. Always reflects current license state (premium, banned, expired).</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">Request Body Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">username</code> <span class="text-red-400 font-semibold">(Required)</span>: Username.</li>
                            <li><code class="text-indigo-300 font-mono">password</code> <span class="text-red-400 font-semibold">(Required)</span>: Password.</li>
                            <li><code class="text-indigo-300 font-mono">software_id</code> <span class="text-slate-500">(Optional)</span>: Software product ID. Default: <code class="text-slate-400 font-mono">"default"</code></li>
                        </ul>
                    </div>
                </div>

                <!-- Health Check -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold rounded-lg text-xs font-mono">GET</span>
                        <code class="text-white font-bold font-mono">/api/health</code>
                        <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700">NO AUTH</span>
                    </div>
                    <p class="text-sm text-slate-400">Basic API health check. Returns system status, uptime, cache stats, and memory usage. No authentication required.</p>
                </div>

                <!-- Health Detailed -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold rounded-lg text-xs font-mono">GET</span>
                        <code class="text-white font-bold font-mono">/api/health/detailed</code>
                        <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700">NO AUTH</span>
                    </div>
                    <p class="text-sm text-slate-400">Extended system status with database connectivity, pending reset requests, detailed cache sizes, and performance metrics.</p>
                </div>
            </div>

            <!-- Response Format Reference -->
            <div class="space-y-4 mt-12">
                <h2 class="text-2xl font-bold text-white border-b border-slate-800 pb-3">Response Format</h2>
                <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                    <p class="text-sm text-slate-400 mb-3">All API responses use a consistent JSON structure:</p>
                    <pre class="text-xs text-slate-300 font-mono leading-relaxed"><code>{
  "success": true,           // boolean
  "code":    "VALID",         // machine-readable status
  "message": "License valid", // human-readable message
  "data":    { ... },         // response payload or null
  "announcements": [ ... ],   // active announcements (optional)
  "software": { ... }         // software metadata (optional)
}</code></pre>
                </div>
            </div>

            <!-- Error Codes Quick Reference -->
            <div class="space-y-4 mt-8">
                <h2 class="text-2xl font-bold text-white border-b border-slate-800 pb-3">Error Codes</h2>
                <div class="bg-black/30 rounded-xl border border-white/5 p-4">
                    <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                        <div class="flex items-center gap-2"><span class="text-blue-400 font-mono font-bold w-8">200</span> <span class="text-slate-300">Success</span></div>
                        <div class="flex items-center gap-2"><span class="text-emerald-400 font-mono font-bold w-8">201</span> <span class="text-slate-300">Created</span></div>
                        <div class="flex items-center gap-2"><span class="text-amber-400 font-mono font-bold w-8">400</span> <span class="text-slate-300">Bad Request</span></div>
                        <div class="flex items-center gap-2"><span class="text-amber-400 font-mono font-bold w-8">401</span> <span class="text-slate-300">Unauthorized</span></div>
                        <div class="flex items-center gap-2"><span class="text-red-400 font-mono font-bold w-8">403</span> <span class="text-slate-300">Forbidden / Banned</span></div>
                        <div class="flex items-center gap-2"><span class="text-red-400 font-mono font-bold w-8">404</span> <span class="text-slate-300">Not Found</span></div>
                        <div class="flex items-center gap-2"><span class="text-orange-400 font-mono font-bold w-8">409</span> <span class="text-slate-300">Conflict / Already Registered</span></div>
                        <div class="flex items-center gap-2"><span class="text-orange-400 font-mono font-bold w-8">410</span> <span class="text-slate-300">License Expired</span></div>
                        <div class="flex items-center gap-2"><span class="text-red-400 font-mono font-bold w-8">429</span> <span class="text-slate-300">Rate Limit Exceeded</span></div>
                        <div class="flex items-center gap-2"><span class="text-red-400 font-mono font-bold w-8">503</span> <span class="text-slate-300">API Disabled / Maintenance</span></div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Loader Integration Hub (Interactive Developer Integration Center) -->
        <aside class="lg:col-span-5 space-y-6">
            <div class="glass-panel rounded-2xl overflow-hidden flex flex-col h-[750px] border border-white/5 shadow-2xl">
                <!-- Sidebar Header -->
                <div class="border-b border-white/5 bg-slate-900/40 p-4">
                    <h3 class="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
                        <span>🔌</span> Developer Integration Hub
                    </h3>
                    <p class="text-xs text-slate-400 mt-1">Select your language and action to get integration code snippets.</p>
                </div>
                
                <!-- Programming Languages Selector -->
                <div class="p-3 bg-[#0a0f1d] border-b border-white/5 flex flex-wrap gap-1.5 justify-start">
                    <button class="lang-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white/5 text-slate-400 border border-transparent [&.active]:bg-indigo-500/10 [&.active]:text-indigo-400 [&.active]:border-indigo-500/20 active" onclick="selectLanguage('csharp')">C#</button>
                    <button class="lang-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white/5 text-slate-400 border border-transparent [&.active]:bg-indigo-500/10 [&.active]:text-indigo-400 [&.active]:border-indigo-500/20" onclick="selectLanguage('cpp')">C++</button>
                    <button class="lang-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white/5 text-slate-400 border border-transparent [&.active]:bg-indigo-500/10 [&.active]:text-indigo-400 [&.active]:border-indigo-500/20" onclick="selectLanguage('python')">Python</button>
                    <button class="lang-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white/5 text-slate-400 border border-transparent [&.active]:bg-indigo-500/10 [&.active]:text-indigo-400 [&.active]:border-indigo-500/20" onclick="selectLanguage('nodejs')">Node.js</button>
                    <button class="lang-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white/5 text-slate-400 border border-transparent [&.active]:bg-indigo-500/10 [&.active]:text-indigo-400 [&.active]:border-indigo-500/20" onclick="selectLanguage('go')">Go</button>
                    <button class="lang-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white/5 text-slate-400 border border-transparent [&.active]:bg-indigo-500/10 [&.active]:text-indigo-400 [&.active]:border-indigo-500/20" onclick="selectLanguage('rust')">Rust</button>
                    <button class="lang-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white/5 text-slate-400 border border-transparent [&.active]:bg-indigo-500/10 [&.active]:text-indigo-400 [&.active]:border-indigo-500/20" onclick="selectLanguage('java')">Java</button>
                </div>

                <!-- API Action Selector -->
                <div class="p-3 bg-slate-900/20 border-b border-white/5 flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select API Operation</label>
                    <select id="action-select" onchange="selectAction(this.value)" class="w-full bg-[#06080f] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                        <option value="validate">GET /api/validate — Validate License & HWID</option>
                        <option value="register">POST /api/register — Register Client Device</option>
                        <option value="reset">POST /api/request-hwid-reset — Request HWID Reset</option>
                        <option value="check_reset">GET /api/check-request-status — Check Reset Status</option>
                        <option value="user_register">POST /api/users/register — User Register</option>
                        <option value="user_login">POST /api/users/login — User Login</option>
                        <option value="check_ban">GET /api/check-ban — Check HWID Ban</option>
                        <option value="version">GET /api/software/:id/version — Get Version</option>
                        <option value="announcements">GET /api/software/:id/announcements — Get Announcements</option>
                    </select>
                </div>

                <!-- Code Block Area -->
                <div class="flex-1 p-4 bg-[#050810] overflow-y-auto text-[11px] relative group flex flex-col">
                    <button onclick="copyCode()" class="absolute top-3 right-3 px-3 py-1.5 bg-[#0d121e] border border-white/10 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white text-slate-400 rounded-lg transition-all text-[11px] font-semibold flex items-center gap-1.5 shadow-md">
                        <span>📋</span> Copy Snippet
                    </button>
                    <pre class="text-slate-300 font-mono leading-relaxed select-all mt-8 whitespace-pre overflow-x-auto"><code id="code-content"></code></pre>
                </div>
            </div>
        </aside>
    </div>

    <!-- Footer -->
    <footer class="py-8 border-t border-white/5 text-center text-xs text-slate-500">
        <p>&copy; ${new Date().getFullYear()} Ultra License System. All rights reserved.</p>
    </footer>

    <script>
        document.getElementById('base-url-display').textContent = window.location.origin;

        let activeLang = 'csharp';
        let activeAction = 'validate';

        // Pre-compile all 63 code snippets inside client-side JS object
        const CODE_SNIPPETS = {
            csharp: {
                validate: \`using System;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

public class LicenseValidator
{
    private static readonly string API_KEY = "YOUR_SDK_API_KEY";
    private static readonly string BASE_URL = "http://localhost:3000";

    public static async Task<bool> ValidateLicense(string license, string hwid, string softwareId = "default")
    {
        using (var client = new HttpClient())
        {
            client.DefaultRequestHeaders.Add("X-Software-API-Key", API_KEY);
            var url = BASE_URL + "/api/validate?license=" + Uri.EscapeDataString(license) + 
                      "&hwid=" + Uri.EscapeDataString(hwid) + "&software_id=" + Uri.EscapeDataString(softwareId);
            
            var response = await client.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode) return false;

            // Optional: HMAC-SHA256 Response signature verification
            if (response.Headers.TryGetValues("X-Response-Signature", out var values))
            {
                var receivedSignature = string.Join("", values);
                var computedSignature = HmacSha256(content, API_KEY);
                return receivedSignature.Equals(computedSignature, StringComparison.OrdinalIgnoreCase);
            }
            return false;
        }
    }

    private static string HmacSha256(string message, string secret)
    {
        byte[] key = Encoding.UTF8.GetBytes(secret);
        byte[] msg = Encoding.UTF8.GetBytes(message);
        using (var hmac = new HMACSHA256(key))
        {
            byte[] hash = hmac.ComputeHash(msg);
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
}\`,
                register: \`using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public static async Task<string> RegisterDevice(string license, string hwid, string deviceName, string softwareId = "default")
{
    using (var client = new HttpClient())
    {
        client.DefaultRequestHeaders.Add("X-Software-API-Key", "YOUR_SDK_API_KEY");
        var payload = JsonSerializer.Serialize(new { 
            license = license, 
            hwid = hwid, 
            device_name = deviceName, 
            software_id = softwareId 
        });
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var res = await client.PostAsync("http://localhost:3000/api/register", content);
        return await res.Content.ReadAsStringAsync();
    }
}\`,
                reset: \`using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public static async Task<string> RequestHwidReset(string license, string hwid, string reason)
{
    using (var client = new HttpClient())
    {
        client.DefaultRequestHeaders.Add("X-Software-API-Key", "YOUR_SDK_API_KEY");
        var payload = JsonSerializer.Serialize(new { 
            license = license, 
            hwid = hwid, 
            reason = reason 
        });
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var res = await client.PostAsync("http://localhost:3000/api/request-hwid-reset", content);
        return await res.Content.ReadAsStringAsync();
    }
}\`,
                check_reset: \`using System.Net.Http;
using System.Threading.Tasks;

public static async Task<string> CheckHwidResetStatus(string license)
{
    using (var client = new HttpClient())
    {
        client.DefaultRequestHeaders.Add("X-Software-API-Key", "YOUR_SDK_API_KEY");
        return await client.GetStringAsync("http://localhost:3000/api/check-request-status?license=" + license);
    }
}\`,
                user_register: \`using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public static async Task<string> RegisterUser(string username, string password, string licenseKey, string softwareId = "default")
{
    using (var client = new HttpClient())
    {
        var payload = JsonSerializer.Serialize(new { 
            username = username, 
            password = password, 
            license_key = licenseKey, 
            software_id = softwareId 
        });
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var res = await client.PostAsync("http://localhost:3000/api/users/register", content);
        return await res.Content.ReadAsStringAsync();
    }
}\`,
                user_login: \`using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public static async Task<string> LoginUser(string username, string password, string softwareId = "default")
{
    using (var client = new HttpClient())
    {
        var payload = JsonSerializer.Serialize(new { 
            username = username, 
            password = password, 
            software_id = softwareId 
        });
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var res = await client.PostAsync("http://localhost:3000/api/users/login", content);
        return await res.Content.ReadAsStringAsync();
    }
}\`,
                check_ban: \`using System.Net.Http;
using System.Threading.Tasks;

public static async Task<string> CheckHwidBan(string hwid)
{
    using (var client = new HttpClient())
    {
        client.DefaultRequestHeaders.Add("X-Software-API-Key", "YOUR_SDK_API_KEY");
        return await client.GetStringAsync("http://localhost:3000/api/check-ban?hwid=" + hwid);
    }
}\`,
                version: \`using System.Net.Http;
using System.Threading.Tasks;

public static async Task<string> CheckLatestVersion(string softwareId)
{
    using (var client = new HttpClient())
    {
        return await client.GetStringAsync("http://localhost:3000/api/software/" + softwareId + "/version");
    }
}\`,
                announcements: \`using System.Net.Http;
using System.Threading.Tasks;

public static async Task<string> RetrieveAnnouncements(string softwareId)
{
    using (var client = new HttpClient())
    {
        return await client.GetStringAsync("http://localhost:3000/api/software/" + softwareId + "/announcements");
    }
}\`
            },
            cpp: {
                validate: \`// Requires libcurl and openssl
#include <iostream>
#include <string>
#include <curl/curl.h>
#include <openssl/hmac.h>
#include <openssl/evp.h>

const std::string API_KEY = "YOUR_SDK_API_KEY";

size_t WriteCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

std::string hmac_sha256(const std::string& data, const std::string& key) {
    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int hlen = 0;
    HMAC(EVP_sha256(), key.c_str(), key.length(), (unsigned char*)data.c_str(), data.length(), hash, &hlen);
    char hex[65];
    for (unsigned int i = 0; i < hlen; ++i) sprintf(hex + i * 2, "%02x", hash[i]);
    return std::string(hex, hlen * 2);
}

bool ValidateLicense(const std::string& license, const std::string& hwid, const std::string& softwareId) {
    CURL* curl = curl_easy_init();
    if (!curl) return false;
    std::string readBuffer;
    std::string url = "http://localhost:3000/api/validate?license=" + license + "&hwid=" + hwid + "&software_id=" + softwareId;
    
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, ("X-Software-API-Key: " + API_KEY).c_str());
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
    
    CURLcode res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    
    // In production, capture X-Response-Signature header and verify:
    // hmac_sha256(readBuffer, API_KEY) == signature_header
    return res == CURLE_OK;
}\`,
                register: \`// Requires libcurl
#include <curl/curl.h>
#include <string>

std::string RegisterDevice(const std::string& license, const std::string& hwid, const std::string& deviceName) {
    CURL* curl = curl_easy_init();
    if (!curl) return "";
    std::string readBuffer;
    std::string jsonPayload = "{\\"license\\":\\"" + license + "\\",\\"hwid\\":\\"" + hwid + "\\",\\"device_name\\":\\"" + deviceName + "\\"}";
    
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    headers = curl_slist_append(headers, "X-Software-API-Key: YOUR_SDK_API_KEY");
    
    curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:3000/api/register");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonPayload.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
    
    curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return readBuffer;
}\`,
                reset: \`// Requires libcurl
#include <curl/curl.h>
#include <string>

std::string RequestHwidReset(const std::string& license, const std::string& hwid, const std::string& reason) {
    CURL* curl = curl_easy_init();
    if (!curl) return "";
    std::string readBuffer;
    std::string jsonPayload = "{\\"license\\":\\"" + license + "\\",\\"hwid\\":\\"" + hwid + "\\",\\"reason\\":\\"" + reason + "\\"}";
    
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    headers = curl_slist_append(headers, "X-Software-API-Key: YOUR_SDK_API_KEY");
    
    curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:3000/api/request-hwid-reset");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonPayload.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
    
    curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return readBuffer;
}\`,
                check_reset: \`// Requires libcurl
#include <curl/curl.h>
#include <string>

std::string CheckHwidResetStatus(const std::string& license) {
    CURL* curl = curl_easy_init();
    if (!curl) return "";
    std::string readBuffer;
    std::string url = "http://localhost:3000/api/check-request-status?license=" + license;
    
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "X-Software-API-Key: YOUR_SDK_API_KEY");
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
    
    curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return readBuffer;
}\`,
                user_register: \`// Requires libcurl
#include <curl/curl.h>
#include <string>

std::string RegisterUser(const std::string& username, const std::string& password, const std::string& licenseKey) {
    CURL* curl = curl_easy_init();
    if (!curl) return "";
    std::string readBuffer;
    std::string jsonPayload = "{\\"username\\":\\"" + username + "\\",\\"password\\":\\"" + password + "\\",\\"license_key\\":\\"" + licenseKey + "\\"}";
    
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    
    curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:3000/api/users/register");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonPayload.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
    
    curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return readBuffer;
}\`,
                user_login: \`// Requires libcurl
#include <curl/curl.h>
#include <string>

std::string LoginUser(const std::string& username, const std::string& password) {
    CURL* curl = curl_easy_init();
    if (!curl) return "";
    std::string readBuffer;
    std::string jsonPayload = "{\\"username\\":\\"" + username + "\\",\\"password\\":\\"" + password + "\\"}";
    
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    
    curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:3000/api/users/login");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonPayload.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
    
    curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return readBuffer;
}\`,
                check_ban: \`// Requires libcurl
#include <curl/curl.h>
#include <string>

std::string CheckHwidBan(const std::string& hwid) {
    CURL* curl = curl_easy_init();
    if (!curl) return "";
    std::string readBuffer;
    std::string url = "http://localhost:3000/api/check-ban?hwid=" + hwid;
    
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "X-Software-API-Key: YOUR_SDK_API_KEY");
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
    
    curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return readBuffer;
}\`,
                version: \`// Requires libcurl
#include <curl/curl.h>
#include <string>

std::string GetSoftwareVersion(const std::string& softwareId) {
    CURL* curl = curl_easy_init();
    if (!curl) return "";
    std::string readBuffer;
    std::string url = "http://localhost:3000/api/software/" + softwareId + "/version";
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
    
    curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return readBuffer;
}\`,
                announcements: \`// Requires libcurl
#include <curl/curl.h>
#include <string>

std::string GetAnnouncements(const std::string& softwareId) {
    CURL* curl = curl_easy_init();
    if (!curl) return "";
    std::string readBuffer;
    std::string url = "http://localhost:3000/api/software/" + softwareId + "/announcements";
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
    
    curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return readBuffer;
}\`
            },
            python: {
                validate: \`import requests
import hmac
import hashlib

API_KEY = "YOUR_SDK_API_KEY"
BASE_URL = "http://localhost:3000"

def validate_license(license_key, hwid, software_id="default"):
    url = BASE_URL + "/api/validate"
    headers = {"X-Software-API-Key": API_KEY}
    params = {"license": license_key, "hwid": hwid, "software_id": software_id}
    
    res = requests.get(url, headers=headers, params=params)
    if res.status_code != 200:
        return False, "Validation HTTP Error: " + str(res.status_code)

    # Cryptographic anti-crack verification
    signature = res.headers.get("X-Response-Signature")
    if not signature:
        return False, "Security Error: Response not signed by server"
        
    computed = hmac.new(API_KEY.encode(), res.text.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, computed):
        return False, "Security Error: Response signature tampered!"
        
    return True, res.json()\`,
                register: \`import requests

API_KEY = "YOUR_SDK_API_KEY"

def register_device(license_key, hwid, device_name="Unknown Device", software_id="default"):
    url = "http://localhost:3000/api/register"
    headers = {"X-Software-API-Key": API_KEY}
    body = {
        "license": license_key,
        "hwid": hwid,
        "device_name": device_name,
        "software_id": software_id
    }
    
    res = requests.post(url, headers=headers, json=body)
    return res.json()\`,
                reset: \`import requests

API_KEY = "YOUR_SDK_API_KEY"

def request_hwid_reset(license_key, hwid, reason):
    url = "http://localhost:3000/api/request-hwid-reset"
    headers = {"X-Software-API-Key": API_KEY}
    body = {
        "license": license_key,
        "hwid": hwid,
        "reason": reason
    }
    
    res = requests.post(url, headers=headers, json=body)
    return res.json()\`,
                check_reset: \`import requests

API_KEY = "YOUR_SDK_API_KEY"

def check_reset_status(license_key):
    url = "http://localhost:3000/api/check-request-status"
    headers = {"X-Software-API-Key": API_KEY}
    params = {"license": license_key}
    
    res = requests.get(url, headers=headers, params=params)
    return res.json()\`,
                user_register: \`import requests

def register_user(username, password, license_key, software_id="default", email=""):
    url = "http://localhost:3000/api/users/register"
    body = {
        "username": username,
        "password": password,
        "license_key": license_key,
        "software_id": software_id,
        "email": email
    }
    
    res = requests.post(url, json=body)
    return res.json()\`,
                user_login: \`import requests

def login_user(username, password, software_id="default"):
    url = "http://localhost:3000/api/users/login"
    body = {
        "username": username,
        "password": password,
        "software_id": software_id
    }
    
    res = requests.post(url, json=body)
    return res.json()\`,
                check_ban: \`import requests

API_KEY = "YOUR_SDK_API_KEY"

def check_hwid_ban(hwid):
    url = "http://localhost:3000/api/check-ban"
    headers = {"X-Software-API-Key": API_KEY}
    params = {"hwid": hwid}
    
    res = requests.get(url, headers=headers, params=params)
    return res.json()\`,
                version: \`import requests

def get_software_version(software_id):
    url = "http://localhost:3000/api/software/" + software_id + "/version"
    res = requests.get(url)
    return res.json()\`,
                announcements: \`import requests

def get_announcements(software_id):
    url = "http://localhost:3000/api/software/" + software_id + "/announcements"
    res = requests.get(url)
    return res.json()\`
            },
            nodejs: {
                validate: \`const crypto = require('crypto');

const API_KEY = "YOUR_SDK_API_KEY";
const BASE_URL = "http://localhost:3000";

async function validateLicense(license, hwid, softwareId = "default") {
    const url = BASE_URL + "/api/validate?license=" + encodeURIComponent(license) + 
                "&hwid=" + encodeURIComponent(hwid) + "&software_id=" + encodeURIComponent(softwareId);
    
    const res = await fetch(url, {
        headers: { "X-Software-API-Key": API_KEY }
    });
    
    const text = await res.text();
    if (!res.ok) throw new Error("Validation server responded with status: " + res.status);
    
    // Check HMAC-SHA256 Response signature for anti-tamper
    const signature = res.headers.get("X-Response-Signature");
    const computed = crypto.createHmac('sha256', API_KEY).update(text).digest('hex');
    if (signature !== computed) throw new Error("Security Error: Response validation signature mismatch!");
    
    return JSON.parse(text);
}\`,
                register: \`const API_KEY = "YOUR_SDK_API_KEY";

async function registerDevice(license, hwid, deviceName = "Unknown Device", softwareId = "default") {
    const url = "http://localhost:3000/api/register";
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Software-API-Key": API_KEY
        },
        body: JSON.stringify({ license, hwid, device_name: deviceName, software_id: softwareId })
    });
    return await res.json();
}\`,
                reset: \`const API_KEY = "YOUR_SDK_API_KEY";

async function requestHwidReset(license, hwid, reason) {
    const url = "http://localhost:3000/api/request-hwid-reset";
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Software-API-Key": API_KEY
        },
        body: JSON.stringify({ license, hwid, reason })
    });
    return await res.json();
}\`,
                check_reset: \`const API_KEY = "YOUR_SDK_API_KEY";

async function checkHwidResetStatus(license) {
    const url = "http://localhost:3000/api/check-request-status?license=" + encodeURIComponent(license);
    const res = await fetch(url, {
        headers: { "X-Software-API-Key": API_KEY }
    });
    return await res.json();
}\`,
                user_register: \`async function registerUser(username, password, licenseKey, softwareId = "default", email = "") {
    const url = "http://localhost:3000/api/users/register";
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, license_key: licenseKey, software_id: softwareId, email })
    });
    return await res.json();
}\`,
                user_login: \`async function loginUser(username, password, softwareId = "default") {
    const url = "http://localhost:3000/api/users/login";
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, software_id: softwareId })
    });
    return await res.json();
}\`,
                check_ban: \`const API_KEY = "YOUR_SDK_API_KEY";

async function checkHwidBan(hwid) {
    const url = "http://localhost:3000/api/check-ban?hwid=" + encodeURIComponent(hwid);
    const res = await fetch(url, {
        headers: { "X-Software-API-Key": API_KEY }
    });
    return await res.json();
}\`,
                version: \`async function getSoftwareVersion(softwareId) {
    const url = "http://localhost:3000/api/software/" + encodeURIComponent(softwareId) + "/version";
    const res = await fetch(url);
    return await res.json();
}\`,
                announcements: \`async function getAnnouncements(softwareId) {
    const url = "http://localhost:3000/api/software/" + encodeURIComponent(softwareId) + "/announcements";
    const res = await fetch(url);
    return await res.json();
}\`
            },
            go: {
                validate: \`package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
)

const ApiKey = "YOUR_SDK_API_KEY"

func ValidateLicense(license, hwid, softwareId string) (string, error) {
	url := "http://localhost:3000/api/validate?license=" + license + "&hwid=" + hwid + "&software_id=" + softwareId
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("X-Software-API-Key", ApiKey)
	
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	
	if resp.StatusCode == 200 {
		sig := resp.Header.Get("X-Response-Signature")
		mac := hmac.New(sha256.New, []byte(ApiKey))
		mac.Write(body)
		expected := hex.EncodeToString(mac.Sum(nil))
		if sig != expected {
			return "", fmt.Errorf("security check failed: response signature mismatch")
		}
		return string(body), nil
	}
	return "", fmt.Errorf("validation returned status %d", resp.StatusCode)
}\`,
                register: \`package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

func RegisterDevice(license, hwid, deviceName, softwareId string) (string, error) {
	payload, _ := json.Marshal(map[string]string{
		"license":     license,
		"hwid":        hwid,
		"device_name": deviceName,
		"software_id": softwareId,
	})
	req, _ := http.NewRequest("POST", "http://localhost:3000/api/register", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Software-API-Key", "YOUR_SDK_API_KEY")
	
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}\`,
                reset: \`package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

func RequestHwidReset(license, hwid, reason string) (string, error) {
	payload, _ := json.Marshal(map[string]string{
		"license": license,
		"hwid":    hwid,
		"reason":  reason,
	})
	req, _ := http.NewRequest("POST", "http://localhost:3000/api/request-hwid-reset", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Software-API-Key", "YOUR_SDK_API_KEY")
	
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}\`,
                check_reset: \`package main

import (
	"io"
	"net/http"
)

func CheckResetStatus(license string) (string, error) {
	url := "http://localhost:3000/api/check-request-status?license=" + license
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("X-Software-API-Key", "YOUR_SDK_API_KEY")
	
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}\`,
                user_register: \`package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

func RegisterUser(username, password, licenseKey, softwareId string) (string, error) {
	payload, _ := json.Marshal(map[string]string{
		"username":    username,
		"password":    password,
		"license_key": licenseKey,
		"software_id": softwareId,
	})
	resp, err := http.Post("http://localhost:3000/api/users/register", "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}\`,
                user_login: \`package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

func LoginUser(username, password, softwareId string) (string, error) {
	payload, _ := json.Marshal(map[string]string{
		"username":    username,
		"password":    password,
		"software_id": softwareId,
	})
	resp, err := http.Post("http://localhost:3000/api/users/login", "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}\`,
                check_ban: \`package main

import (
	"io"
	"net/http"
)

func CheckHwidBan(hwid string) (string, error) {
	url := "http://localhost:3000/api/check-ban?hwid=" + hwid
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("X-Software-API-Key", "YOUR_SDK_API_KEY")
	
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}\`,
                version: \`package main

import (
	"io"
	"net/http"
)

func GetSoftwareVersion(softwareId string) (string, error) {
	resp, err := http.Get("http://localhost:3000/api/software/" + softwareId + "/version")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}\`,
                announcements: \`package main

import (
	"io"
	"net/http"
)

func GetAnnouncements(softwareId string) (string, error) {
	resp, err := http.Get("http://localhost:3000/api/software/" + softwareId + "/announcements")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}\`
            },
            rust: {
                validate: \`use hmac::{Hmac, Mac};
use sha2::Sha256;
use hex;

type HmacSha256 = Hmac<Sha256>;

fn validate_license(license: &str, hwid: &str, api_key: &str, software_id: &str) -> Result<String, Box<dyn std::error::Error>> {
    let url = format!("http://localhost:3000/api/validate?license={}&hwid={}&software_id={}", license, hwid, software_id);
    let client = reqwest::blocking::Client::new();
    
    let resp = client.get(&url).header("X-Software-API-Key", api_key).send()?;
    let status = resp.status();
    
    let signature = resp.headers().get("X-Response-Signature")
        .and_then(|v| v.to_str().ok()).unwrap_or("").to_string();
    let text = resp.text()?;
    
    if status.is_success() {
        let mut mac = HmacSha256::new_from_slice(api_key.as_bytes())?;
        mac.update(text.as_bytes());
        let expected = hex::encode(mac.finalize().into_bytes());
        if signature != expected {
            return Err("Security Error: Response validation signature mismatch!".into());
        }
        return Ok(text);
    }
    Err(format!("Server responded with code: {}", status).into())
}\`,
                register: \`fn register_device(license: &str, hwid: &str, device_name: &str, software_id: &str) -> reqwest::Result<String> {
    let client = reqwest::blocking::Client::new();
    let body = serde_json::json!({
        "license": license,
        "hwid": hwid,
        "device_name": device_name,
        "software_id": software_id
    });
    
    let res = client.post("http://localhost:3000/api/register")
        .header("X-Software-API-Key", "YOUR_SDK_API_KEY")
        .json(&body).send()?;
    res.text()
}\`,
                reset: \`fn request_hwid_reset(license: &str, hwid: &str, reason: &str) -> reqwest::Result<String> {
    let client = reqwest::blocking::Client::new();
    let body = serde_json::json!({
        "license": license,
        "hwid": hwid,
        "reason": reason
    });
    
    let res = client.post("http://localhost:3000/api/request-hwid-reset")
        .header("X-Software-API-Key", "YOUR_SDK_API_KEY")
        .json(&body).send()?;
    res.text()
}\`,
                check_reset: \`fn check_reset_status(license: &str) -> reqwest::Result<String> {
    let client = reqwest::blocking::Client::new();
    let url = format!("http://localhost:3000/api/check-request-status?license={}", license);
    
    let res = client.get(&url)
        .header("X-Software-API-Key", "YOUR_SDK_API_KEY")
        .send()?;
    res.text()
}\`,
                user_register: \`fn register_user(username: &str, password: &str, license_key: &str, software_id: &str) -> reqwest::Result<String> {
    let client = reqwest::blocking::Client::new();
    let body = serde_json::json!({
        "username": username,
        "password": password,
        "license_key": license_key,
        "software_id": software_id
    });
    
    let res = client.post("http://localhost:3000/api/users/register").json(&body).send()?;
    res.text()
}\`,
                user_login: \`fn login_user(username: &str, password: &str, software_id: &str) -> reqwest::Result<String> {
    let client = reqwest::blocking::Client::new();
    let body = serde_json::json!({
        "username": username,
        "password": password,
        "software_id": software_id
    });
    
    let res = client.post("http://localhost:3000/api/users/login").json(&body).send()?;
    res.text()
}\`,
                check_ban: \`fn check_hwid_ban(hwid: &str) -> reqwest::Result<String> {
    let client = reqwest::blocking::Client::new();
    let url = format!("http://localhost:3000/api/check-ban?hwid={}", hwid);
    
    let res = client.get(&url)
        .header("X-Software-API-Key", "YOUR_SDK_API_KEY")
        .send()?;
    res.text()
}\`,
                version: \`fn get_software_version(software_id: &str) -> reqwest::Result<String> {
    let url = format!("http://localhost:3000/api/software/{}/version", software_id);
    reqwest::blocking::get(&url)?.text()
}\`,
                announcements: \`fn get_announcements(software_id: &str) -> reqwest::Result<String> {
    let url = format!("http://localhost:3000/api/software/{}/announcements", software_id);
    reqwest::blocking::get(&url)?.text()
}\`
            },
            java: {
                validate: \`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class LicenseValidator {
    private static final String API_KEY = "YOUR_SDK_API_KEY";

    public static String validate(String license, String hwid, String softwareId) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String url = "http://localhost:3000/api/validate?license=" + license + "&hwid=" + hwid + "&software_id=" + softwareId;
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("X-Software-API-Key", API_KEY)
            .GET()
            .build();
            
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            String signature = response.headers().firstValue("X-Response-Signature").orElse("");
            String computed = hmacSha256(response.body(), API_KEY);
            if (!signature.equalsIgnoreCase(computed)) {
                throw new Exception("Security Error: Response signature validation failed!");
            }
            return response.body();
        }
        throw new Exception("Server validation failed: HTTP " + response.statusCode());
    }

    private static String hmacSha256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes("UTF-8"), "HmacSHA256"));
        byte[] raw = mac.doFinal(data.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : raw) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}\`,
                register: \`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public static String registerDevice(String license, String hwid, String deviceName, String softwareId) throws Exception {
    HttpClient client = HttpClient.newHttpClient();
    String jsonBody = "{\\"license\\":\\"" + license + "\\",\\"hwid\\":\\"" + hwid + 
                      "\\",\\"device_name\\":\\"" + deviceName + "\\",\\"software_id\\":\\"" + softwareId + "\\"}";
                      
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("http://localhost:3000/api/register"))
        .header("Content-Type", "application/json")
        .header("X-Software-API-Key", "YOUR_SDK_API_KEY")
        .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
        .build();
        
    return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
}\`,
                reset: \`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public static String requestReset(String license, String hwid, String reason) throws Exception {
    HttpClient client = HttpClient.newHttpClient();
    String jsonBody = "{\\"license\\":\\"" + license + "\\",\\"hwid\\":\\"" + hwid + "\\",\\"reason\\":\\"" + reason + "\\"}";
                      
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("http://localhost:3000/api/request-hwid-reset"))
        .header("Content-Type", "application/json")
        .header("X-Software-API-Key", "YOUR_SDK_API_KEY")
        .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
        .build();
        
    return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
}\`,
                check_reset: \`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public static String checkResetStatus(String license) throws Exception {
    HttpClient client = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("http://localhost:3000/api/check-request-status?license=" + license))
        .header("X-Software-API-Key", "YOUR_SDK_API_KEY")
        .GET()
        .build();
        
    return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
}\`,
                user_register: \`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public static String registerUser(String username, String password, String licenseKey, String softwareId) throws Exception {
    HttpClient client = HttpClient.newHttpClient();
    String jsonBody = "{\\"username\\":\\"" + username + "\\",\\"password\\":\\"" + password + 
                      "\\",\\"license_key\\":\\"" + licenseKey + "\\",\\"software_id\\":\\"" + softwareId + "\\"}";
                      
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("http://localhost:3000/api/users/register"))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
        .build();
        
    return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
}\`,
                user_login: \`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public static String loginUser(String username, String password, String softwareId) throws Exception {
    HttpClient client = HttpClient.newHttpClient();
    String jsonBody = "{\\"username\\":\\"" + username + "\\",\\"password\\":\\"" + password + 
                      "\\",\\"software_id\\":\\"" + softwareId + "\\"}";
                      
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("http://localhost:3000/api/users/login"))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
        .build();
        
    return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
}\`,
                check_ban: \`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public static String checkHwidBan(String hwid) throws Exception {
    HttpClient client = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("http://localhost:3000/api/check-ban?hwid=" + hwid))
        .header("X-Software-API-Key", "YOUR_SDK_API_KEY")
        .GET()
        .build();
        
    return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
}\`,
                version: \`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public static String getVersion(String softwareId) throws Exception {
    HttpClient client = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("http://localhost:3000/api/software/" + softwareId + "/version"))
        .GET()
        .build();
        
    return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
}\`,
                announcements: \`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public static String getAnnouncements(String softwareId) throws Exception {
    HttpClient client = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("http://localhost:3000/api/software/" + softwareId + "/announcements"))
        .GET()
        .build();
        
    return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
}\`
            }
        };

        function selectLanguage(lang) {
            activeLang = lang;
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('onclick').includes(lang)) {
                    btn.classList.add('active');
                }
            });
            updateSnippet();
        }

        function selectAction(action) {
            activeAction = action;
            updateSnippet();
        }

        function updateSnippet() {
            const codeEl = document.getElementById('code-content');
            if (codeEl && CODE_SNIPPETS[activeLang] && CODE_SNIPPETS[activeLang][activeAction]) {
                codeEl.textContent = CODE_SNIPPETS[activeLang][activeAction];
            }
        }

        function copyCode() {
            const codeEl = document.getElementById('code-content');
            if (codeEl) {
                navigator.clipboard.writeText(codeEl.textContent).then(() => {
                    alert("Integration snippet copied to clipboard!");
                }).catch(err => {
                    console.error("Clipboard copy failed: ", err);
                });
            }
        }

        // Initialize display
        updateSnippet();
    </script>
</body>
</html>`;
};

module.exports = { generateLandingPage };

