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
                    <p class="text-sm text-slate-400">Validate a license key and bound hardware fingerprint. Returns custom metadata configuration flags.</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">Query Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">license</code> <span class="text-red-400 font-semibold">(Required)</span>: The license key string.</li>
                            <li><code class="text-indigo-300 font-mono">hwid</code> <span class="text-red-400 font-semibold">(Required if bound)</span>: Client device Hardware ID.</li>
                            <li><code class="text-indigo-300 font-mono">software_id</code> <span class="text-slate-500">(Optional)</span>: The unique software identifier.</li>
                        </ul>
                    </div>
                </div>

                <!-- Register -->
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded-lg text-xs font-mono">POST</span>
                        <code class="text-white font-bold font-mono">/api/register</code>
                    </div>
                    <p class="text-sm text-slate-400">Register a new client device and bind the hardware hardware fingerprint to a license key.</p>
                    <div class="bg-black/30 rounded-xl border border-white/5 p-4 space-y-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase">Request Body Parameters</h4>
                        <ul class="text-xs space-y-2 text-slate-300">
                            <li><code class="text-indigo-300 font-mono">license</code> <span class="text-red-400 font-semibold">(Required)</span>: License key string.</li>
                            <li><code class="text-indigo-300 font-mono">hwid</code> <span class="text-red-400 font-semibold">(Required)</span>: Hardware fingerprint lock value.</li>
                            <li><code class="text-indigo-300 font-mono">device_name</code> <span class="text-slate-500">(Optional)</span>: Client device name string.</li>
                            <li><code class="text-indigo-300 font-mono">cpu_info</code> <span class="text-slate-500">(Optional)</span>: Client processor description.</li>
                            <li><code class="text-indigo-300 font-mono">gpu_info</code> <span class="text-slate-500">(Optional)</span>: Client graphics hardware description.</li>
                            <li><code class="text-indigo-300 font-mono">motherboard_uuid</code> <span class="text-slate-500">(Optional)</span>: Base motherboard UUID string.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>

        <!-- Loader Integration Hub (Language Code Tabs) -->
        <aside class="lg:col-span-5 space-y-6">
            <div class="glass-panel rounded-2xl overflow-hidden flex flex-col h-[650px] border border-white/5">
                <div class="border-b border-white/5 bg-slate-900/30 flex justify-between items-center px-4">
                    <span class="text-xs font-bold uppercase text-slate-400 tracking-wider">Client Integration Loaders</span>
                </div>
                
                <!-- Language selection tabs -->
                <div class="flex border-b border-white/5 bg-[#0a0f1d] text-xs">
                    <button class="tab-btn active px-4 py-3 flex-1 text-center font-semibold transition-all" onclick="selectTab('csharp')">C#</button>
                    <button class="tab-btn px-4 py-3 flex-1 text-center font-semibold transition-all" onclick="selectTab('cpp')">C++</button>
                    <button class="tab-btn px-4 py-3 flex-1 text-center font-semibold transition-all" onclick="selectTab('python')">Python</button>
                    <button class="tab-btn px-4 py-3 flex-1 text-center font-semibold transition-all" onclick="selectTab('nodejs')">Node.js</button>
                </div>

                <!-- Code blocks containers -->
                <div class="flex-1 p-4 bg-[#050810] overflow-y-auto text-xs relative group">
                    <button onclick="copyActiveCode()" class="absolute top-3 right-3 p-1.5 bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-400 rounded-md transition-colors">
                        📋 Copy Code
                    </button>

                    <!-- C# Code -->
                    <pre id="code-csharp" class="language-code text-slate-300 select-all"><code class="language-csharp">using System;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

public class LicenseValidator
{
    private static readonly string API_KEY = "YOUR_SDK_API_KEY";
    private static readonly string BASE_URL = "http://localhost:3000";

    public static async Task&lt;bool&gt; ValidateLicense(string key, string hwid)
    {
        using (var client = new HttpClient())
        {
            var url = $"{BASE_URL}/api/validate?license={key}&hwid={hwid}";
            client.DefaultRequestHeaders.Add("X-Software-API-Key", API_KEY);
            
            var response = await client.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode) return false;

            // Integrity verification
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
        var encoding = new ASCIIEncoding();
        byte[] keyByte = encoding.GetBytes(secret);
        byte[] messageBytes = encoding.GetBytes(message);
        using (var hmacsha256 = new HMACSHA256(keyByte))
        {
            byte[] hashmessage = hmacsha256.ComputeHash(messageBytes);
            return BitConverter.ToString(hashmessage).Replace("-", "").ToLower();
        }
    }
}</code></pre>

                    <!-- C++ Code -->
                    <pre id="code-cpp" class="language-code hidden text-slate-300"><code class="language-cpp">// Requires libcurl and openssl
#include &lt;iostream&gt;
#include &lt;string&gt;
#include &lt;curl/curl.h&gt;
#include &lt;openssl/hmac.h&gt;
#include &lt;openssl/evp.h&gt;

const std::string API_KEY = "YOUR_SDK_API_KEY";
const std::string BASE_URL = "http://localhost:3000";

std::string compute_hmac(const std::string& data, const std::string& key) {
    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int hlen = 0;
    HMAC(EVP_sha256(), key.c_str(), key.length(), 
         (unsigned char*)data.c_str(), data.length(), hash, &hlen);
    
    char hex[65];
    for (unsigned int i = 0; i &lt; hlen; ++i) {
        sprintf(hex + i * 2, "%02x", hash[i]);
    }
    return std::string(hex, hlen * 2);
}

// Complete request loop details inside client loader...</code></pre>

                    <!-- Python Code -->
                    <pre id="code-python" class="language-code hidden text-slate-300"><code class="language-python">import requests
import hmac
import hashlib

API_KEY = "YOUR_SDK_API_KEY"
BASE_URL = "http://localhost:3000"

def validate_license(license_key, hwid):
    url = f"{BASE_URL}/api/validate"
    headers = {"X-Software-API-Key": API_KEY}
    params = {"license": license_key, "hwid": hwid}
    
    res = requests.get(url, headers=headers, params=params)
    if res.status_code != 200:
        return False, "Unauthorized/Expired"

    # Integrity verification
    signature = res.headers.get("X-Response-Signature")
    if not signature:
        return False, "Response not signed"
        
    computed = hmac.new(
        API_KEY.encode(), 
        res.text.encode(), 
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, computed):
        return False, "Response tampered!"
        
    return True, res.json()</code></pre>

                    <!-- Node.js Code -->
                    <pre id="code-nodejs" class="language-code hidden text-slate-300"><code class="language-javascript">const crypto = require('crypto');

const API_KEY = "YOUR_SDK_API_KEY";
const BASE_URL = "http://localhost:3000";

async function validateLicense(license, hwid) {
    const url = \`\${BASE_URL}/api/validate?license=\${license}&hwid=\${hwid}\`;
    
    const res = await fetch(url, {
        headers: { "X-Software-API-Key": API_KEY }
    });
    
    const text = await res.text();
    if (!res.ok) throw new Error("Invalid request");
    
    const signature = res.headers.get("X-Response-Signature");
    const computed = crypto
        .createHmac('sha256', API_KEY)
        .update(text)
        .digest('hex');
        
    if (signature !== computed) {
        throw new Error("Response validation signature mismatch!");
    }
    
    return JSON.parse(text);
}</code></pre>
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

        function selectTab(lang) {
            // Remove active classes
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.language-code').forEach(pre => pre.classList.add('hidden'));

            // Find current tab button
            const event = window.event;
            if(event) {
                event.currentTarget.classList.add('active');
            } else {
                // Find by text matching if event is not passed
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    if(btn.textContent.toLowerCase().includes(lang)) btn.classList.add('active');
                });
            }

            // Show active pre
            document.getElementById('code-' + lang).classList.remove('hidden');
        }

        function copyActiveCode() {
            const activePre = document.querySelector('.language-code:not(.hidden)');
            if(activePre) {
                navigator.clipboard.writeText(activePre.textContent);
                alert("Code snippet copied successfully!");
            }
        }
    </script>
</body>
</html>`;
};

module.exports = { generateLandingPage };
