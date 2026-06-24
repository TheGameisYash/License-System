# Ultra License System — API Documentation

> **Version**: 2.0.0  
> **Base URL**: `https://your-domain.com` (Vercel) or `http://localhost:3000` (local)  
> **Content-Type**: `application/json`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Rate Limiting](#rate-limiting)
5. [API Endpoints](#api-endpoints)
   - [Register Device](#1-register-device)
   - [Validate License](#2-validate-license)
   - [Get License Info](#3-get-license-info)
   - [Request HWID Reset](#4-request-hwid-reset)
   - [Check Reset Status](#5-check-reset-request-status)
   - [Check HWID Ban](#6-check-hwid-ban)
   - [Health Check](#7-health-check)
   - [Detailed Health](#8-detailed-health-check)
   - [Software Version](#9-get-software-version)
   - [Software Announcements](#10-get-software-announcements)
   - [User Registration](#11-user-registration)
   - [User Login](#12-user-login)
6. [Error Codes Reference](#error-codes-reference)
7. [Webhook Events](#webhook-events)
8. [Integration Examples](#integration-examples)
9. [Software Configuration](#software-configuration)

---

## Overview

The Ultra License System provides a REST API for managing software licenses with:

- **HWID-based device binding** — locks licenses to specific hardware
- **Multi-software support** — manage multiple products from one system
- **Per-software authentication** — API keys per product
- **User accounts** — optional username/password auth mode
- **Response signing** — HMAC-SHA256 signature on responses for tamper detection
- **Caching** — aggressive caching for minimal Firestore reads
- **Webhook notifications** — Discord/custom webhooks for all events
- **Ban system** — license-level and HWID-level banning

---

## Authentication

### API Key (per-software)

Most endpoints require an API key. Each software product created in the admin panel gets a unique API key (format: `SDK_XXXXXXXXXX`).

**Send the key in one of three ways** (in order of precedence):

| Method | Location | Example |
|--------|----------|---------|
| Header (recommended) | `X-Software-API-Key` | `X-Software-API-Key: SDK_A1B2C3D4E5F6...` |
| Query parameter | `?api_key=...` | `?api_key=SDK_A1B2C3D4E5F6...` |
| Request body | `api_key` field | `{"api_key": "SDK_A1B2C3D4E5F6..."}` |

> **Note**: If the software has no API key configured, the endpoint is accessible without authentication.

### Response Signature Verification

When an API key is configured, responses include an `X-Response-Signature` header. This is an HMAC-SHA256 of the JSON response body, signed with the API key. Verify it client-side to detect tampering:

```javascript
const crypto = require('crypto');

function verifyResponse(responseBody, signature, apiKey) {
  const expected = crypto.createHmac('sha256', apiKey)
    .update(JSON.stringify(responseBody))
    .digest('hex');
  return signature === expected;
}
```

---

## Response Format

All responses follow a consistent JSON structure:

```json
{
  "success": true,           // boolean — did the request succeed?
  "code": "VALID",           // string — machine-readable status code
  "message": "License is valid",  // string — human-readable message
  "data": { ... },           // object|null — response payload
  "announcements": [ ... ],  // array (optional) — active announcements
  "software": { ... }        // object (optional) — software metadata
}
```

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| `200` | Success | Request completed successfully |
| `201` | Created | New resource created (registration) |
| `400` | Bad Request | Missing or invalid parameters |
| `401` | Unauthorized | Invalid API key or credentials |
| `403` | Forbidden | Banned, mismatch, or access denied |
| `404` | Not Found | License, software, or endpoint not found |
| `409` | Conflict | Already registered, duplicate, or HWID conflict |
| `410` | Gone | License has expired |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server failure |
| `503` | Service Unavailable | API disabled or maintenance mode |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/register` | 5 requests | 60 seconds |
| `POST /api/request-hwid-reset` | 3 requests | 60 minutes |
| `GET /api/license-info` | 20 requests | 60 seconds |
| `GET /api/check-ban` | 30 requests | 60 seconds |
| `POST /api/users/register` | 3 requests | 60 seconds |
| `POST /api/users/login` | 10 requests | 60 seconds |
| All other endpoints | 100 requests | 15 minutes |

Rate limit responses return status `429`:
```json
{
  "success": false,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Maximum 5 requests per minute.",
  "data": null
}
```

---

## API Endpoints

---

### 1. Register Device

Register a device (HWID) to a license key. This activates the license.

```
POST /api/register
```

**Authentication**: `X-Software-API-Key` header

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `license` | string | ✅ Yes | The license key |
| `hwid` | string | ✅ If binding=hwid | Hardware ID (10-256 characters) |
| `software_id` | string | No | Software product ID (default: `"default"`) |
| `device_name` | string | No | Friendly name for the device |
| `device_info` | string | No | Device details (falls back to User-Agent) |
| `user_id` | string | No | User identifier (for `user_id` binding mode) |
| `username` | string | Conditional | Required if `authMode = license_credentials` |
| `password` | string | Conditional | Required if `authMode = license_credentials` |
| `cpu_info` | string | No | CPU identifier for hardware fingerprint |
| `gpu_info` | string | No | GPU identifier for hardware fingerprint |
| `motherboard_uuid` | string | No | Motherboard UUID for hardware fingerprint |

**Success Response** (`201 Created`):
```json
{
  "success": true,
  "code": "DEVICE_REGISTERED",
  "message": "Device registered successfully",
  "data": {
    "license": "LIC-A1B2C3D4-E5F6A7B8-C9D0E1F2",
    "hwid": "ABC123DEF456GHIJ...",
    "deviceName": "My Gaming PC",
    "registeredAt": "2024-01-15T10:30:00.000Z",
    "expiry": "2025-01-15T00:00:00.000Z",
    "metadata": null
  },
  "announcements": [],
  "software": {
    "name": "MyApp",
    "latestVersion": "2.1.0",
    "downloadUrl": "https://example.com/download"
  }
}
```

**Already Registered** (`200 OK`):
```json
{
  "success": true,
  "code": "ALREADY_REGISTERED",
  "message": "Device already registered. Re-validation successful.",
  "data": { ... }
}
```

**Error Codes**:

| Code | Status | Cause |
|------|--------|-------|
| `MISSING_LICENSE` | 400 | License key not provided |
| `MISSING_HWID` | 400 | HWID required but not provided |
| `INVALID_HWID` | 400 | HWID format invalid (must be 10-256 chars) |
| `API_DISABLED` | 503 | API is disabled for this software |
| `MAINTENANCE_MODE` | 503 | Software is under maintenance |
| `CREDENTIALS_REQUIRED` | 401 | Username/password required (credentials auth mode) |
| `INVALID_CREDENTIALS` | 401 | Wrong username or password |
| `USER_BANNED` | 403 | User account is banned |
| `LICENSE_USER_MISMATCH` | 403 | License doesn't belong to this user |
| `HWID_ALREADY_REGISTERED` | 409 | HWID is registered to a different license |
| `BANNED_HWID` | 403 | Hardware ID is banned |
| `INVALID_LICENSE` | 404 | License key not found |
| `SOFTWARE_MISMATCH` | 403 | License belongs to a different software |
| `LICENSE_BANNED` | 403 | License is banned |
| `EXPIRED` | 410 | License has expired |
| `LICENSE_ALREADY_ACTIVATED` | 409 | License already bound to a different device |

**cURL Example**:
```bash
curl -X POST https://your-domain.com/api/register \
  -H "Content-Type: application/json" \
  -H "X-Software-API-Key: SDK_YOUR_KEY_HERE" \
  -d '{
    "license": "LIC-A1B2C3D4-E5F6A7B8-C9D0E1F2",
    "hwid": "ABC123DEF456GHIJ7890KLMN",
    "device_name": "My PC",
    "software_id": "my-app"
  }'
```

---

### 2. Validate License

Check if a license + HWID combination is valid. This is the primary endpoint your software should call on startup and periodically.

```
GET /api/validate
```

**Authentication**: `X-Software-API-Key` header

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `license` | string | ✅ Yes | License key |
| `hwid` | string | ✅ If binding=hwid | Hardware ID |
| `software_id` | string | No | Software ID (default: `"default"`) |
| `username` | string | Conditional | Required if `authMode = license_credentials` |
| `password` | string | Conditional | Required if `authMode = license_credentials` |

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "code": "VALID",
  "message": "License is valid",
  "data": {
    "license": "LIC-A1B2C3D4-E5F6A7B8-C9D0E1F2",
    "hwid": "ABC123DEF456GHIJ...",
    "deviceName": "My Gaming PC",
    "expiry": "2025-01-15T00:00:00.000Z",
    "expiryDate": "1/15/2025",
    "daysRemaining": 180,
    "lastValidated": "2024-07-15T10:30:00.000Z",
    "validationCount": 42,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "metadata": { "plan": "pro" },
    "cached": false,
    "responseTime": "12ms"
  },
  "announcements": [
    {
      "id": "abc123",
      "title": "Update Available",
      "message": "Version 2.2.0 is now available!",
      "type": "info",
      "createdAt": "2024-07-10T00:00:00.000Z"
    }
  ],
  "software": {
    "name": "MyApp",
    "latestVersion": "2.2.0",
    "downloadUrl": "https://example.com/download"
  }
}
```

**Cached Response** (`200 OK`) — returned when validated within the last 5 minutes:
```json
{
  "success": true,
  "code": "VALID_CACHED",
  "message": "License valid (cached)",
  "data": { "cached": true, "responseTime": "1ms", ... }
}
```

**Error Codes**:

| Code | Status | Cause |
|------|--------|-------|
| `MISSING_PARAMETERS` | 400 | License not provided |
| `MISSING_HWID` | 400 | HWID required for this software |
| `INVALID_HWID` | 400 | Invalid HWID format |
| `INVALID_SOFTWARE` | 404 | Software ID not found |
| `API_DISABLED` | 503 | API disabled |
| `MAINTENANCE_MODE` | 503 | Software under maintenance |
| `BANNED_HWID` | 403 | HWID is banned |
| `INVALID_LICENSE` | 404 | License not found |
| `SOFTWARE_MISMATCH` | 403 | License belongs to different software |
| `LICENSE_BANNED` | 403 | License is banned |
| `LICENSE_EXPIRED` | 410 | License expired |
| `NOT_REGISTERED` | 409 | License exists but not bound to any device |
| `HWID_MISMATCH` | 409 | HWID doesn't match the registered device |
| `MISSING_USER_ID` | 400 | User ID required (user_id binding) |
| `USER_ID_MISMATCH` | 403 | License bound to a different user |

**cURL Example**:
```bash
curl "https://your-domain.com/api/validate?license=LIC-A1B2C3D4-E5F6A7B8-C9D0E1F2&hwid=ABC123DEF456GHIJ7890KLMN&software_id=my-app" \
  -H "X-Software-API-Key: SDK_YOUR_KEY_HERE"
```

---

### 3. Get License Info

Retrieve detailed information about a license key.

```
GET /api/license-info
```

**Authentication**: `X-Software-API-Key` header

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `license` | string | ✅ Yes | License key to look up |

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "code": "LICENSE_INFO",
  "message": "License information retrieved",
  "data": {
    "license": "LIC-A1B2C3D4-E5F6A7B8-C9D0E1F2",
    "isActivated": true,
    "isBanned": false,
    "isExpired": false,
    "expiry": "2025-01-15T00:00:00.000Z",
    "expiryDate": "1/15/2025",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdDate": "1/1/2024",
    "daysRemaining": 180,
    "deviceName": "My Gaming PC",
    "activatedAt": "2024-01-15T10:30:00.000Z",
    "lastValidated": "2024-07-15T10:30:00.000Z",
    "validationCount": 42,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "metadata": { "plan": "pro" },
    "status": "Active"
  }
}
```

**Status values**: `Active`, `Inactive`, `Expired`, `Banned`

---

### 4. Request HWID Reset

Submit a request to reset the HWID bound to a license. Requires admin approval.

```
POST /api/request-hwid-reset
```

**Authentication**: `X-Software-API-Key` header

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `license` | string | ✅ Yes | License key |
| `hwid` | string | ✅ Yes | Current HWID (must be valid format) |
| `reason` | string | No | Reason for reset (max 500 chars) |

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "code": "REQUEST_SUBMITTED",
  "message": "HWID reset request submitted successfully. An admin will review your request.",
  "data": {
    "requestId": "abc123def456",
    "license": "LIC-A1B2C3D4-E5F6A7B8-C9D0E1F2",
    "submittedAt": "2024-07-15T10:30:00.000Z",
    "status": "pending",
    "estimatedReviewTime": "24-48 hours",
    "note": "You will be able to check the status using /api/check-request-status"
  }
}
```

**Error Codes**:

| Code | Status | Cause |
|------|--------|-------|
| `MISSING_PARAMETERS` | 400 | License or HWID not provided |
| `INVALID_HWID` | 400 | Invalid HWID format |
| `REASON_TOO_LONG` | 400 | Reason exceeds 500 characters |
| `INVALID_LICENSE` | 404 | License not found |
| `LICENSE_BANNED` | 403 | Cannot reset a banned license |
| `NOT_ACTIVATED` | 400 | License not registered to any device |
| `REQUEST_ALREADY_EXISTS` | 409 | A pending request already exists |
| `REQUEST_RECENTLY_DENIED` | 429 | Request denied within last 24 hours |
| `TOO_MANY_REQUESTS` | 429 | More than 3 requests in 1 hour |

---

### 5. Check Reset Request Status

Check the status of your most recent HWID reset request.

```
GET /api/check-request-status
```

**Authentication**: `X-Software-API-Key` header

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `license` | string | ✅ Yes | License key |

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "code": "REQUEST_FOUND",
  "message": "Reset request found",
  "data": {
    "requestId": "abc123def456",
    "license": "LIC-A1B2C3D4-E5F6A7B8-C9D0E1F2",
    "status": "approved",
    "reason": "Changed motherboard",
    "requestedAt": "2024-07-15T10:30:00.000Z",
    "processedAt": "2024-07-16T08:00:00.000Z",
    "processedBy": "admin",
    "adminNote": "Approved - HWID reset completed",
    "statusMessage": "Your request has been approved. HWID has been reset."
  }
}
```

**Status values**: `pending`, `approved`, `denied`

---

### 6. Check HWID Ban

Check if a specific hardware ID is on the ban list.

```
GET /api/check-ban
```

**Authentication**: `X-Software-API-Key` header

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hwid` | string | ✅ Yes | Hardware ID to check |

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "code": "NOT_BANNED",
  "message": "HWID is not banned",
  "data": {
    "hwid": "ABC123DEF456GHIJ...",
    "isBanned": false,
    "checkedAt": "2024-07-15T10:30:00.000Z",
    "note": null
  }
}
```

---

### 7. Health Check

Basic API health check. **No authentication required.**

```
GET /api/health
```

**Response** (`200 OK`):
```json
{
  "success": true,
  "status": "healthy",
  "message": "API is running normally",
  "data": {
    "version": "2.0.0",
    "timestamp": "2024-07-15T10:30:00.000Z",
    "uptime": {
      "seconds": 86400,
      "formatted": "1d 0h 0m 0s"
    },
    "cache": {
      "licenses": 15,
      "validations": 42,
      "pendingLogs": 3,
      "settings": 1,
      "banlist": 2
    },
    "system": {
      "apiEnabled": true,
      "nodeVersion": "v18.17.0",
      "platform": "linux",
      "arch": "x64",
      "memoryUsage": {
        "heapUsed": "45 MB",
        "heapTotal": "64 MB",
        "rss": "80 MB"
      }
    }
  }
}
```

---

### 8. Detailed Health Check

Extended system status with database and cache statistics. **No authentication required.**

```
GET /api/health/detailed
```

Returns additional fields: `database.connected`, `database.pendingResetRequests`, `memory` breakdown, `performance.cacheHitRate`, and `cache` details with max sizes.

---

### 9. Get Software Version

Check the latest version of a software product. Only works if `versionCheck` is enabled for that software.

```
GET /api/software/:id/version
```

**No authentication required.**

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "name": "MyApp",
    "latestVersion": "2.2.0",
    "downloadUrl": "https://example.com/download",
    "updatedAt": "2024-07-10T00:00:00.000Z"
  }
}
```

---

### 10. Get Software Announcements

Retrieve active announcements for a software product. Expired announcements are automatically filtered out.

```
GET /api/software/:id/announcements
```

**No authentication required.**

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "software": "MyApp",
    "announcements": [
      {
        "id": "abc123",
        "title": "Scheduled Maintenance",
        "message": "Server maintenance on Sunday 2AM-4AM UTC",
        "type": "warning",
        "active": true,
        "createdAt": "2024-07-14T00:00:00.000Z",
        "expiresAt": "2024-07-21T00:00:00.000Z"
      }
    ]
  }
}
```

**Announcement types**: `info`, `warning`, `error`, `success`

---

### 11. User Registration

Create a user account linked to a license key. Used when `authMode = license_credentials`.

```
POST /api/users/register
```

**No API key required** (rate-limited to 3/min).

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ Yes | 3-20 chars, letters/numbers/underscores only |
| `password` | string | ✅ Yes | 4-64 characters |
| `email` | string | No | Email address |
| `license_key` | string | ✅ Yes | Valid, unclaimed license key |
| `software_id` | string | No | Software ID (default: `"default"`) |

**Success Response** (`201 Created`):
```json
{
  "success": true,
  "code": "USER_REGISTERED",
  "message": "Account created and license activated successfully",
  "data": {
    "username": "johndoe",
    "softwareId": "my-app",
    "licenseKey": "LIC-A1B2C3D4-E5F6A7B8-C9D0E1F2",
    "isPremium": false,
    "licenseStatus": "active",
    "expiresAt": "2025-01-15T00:00:00.000Z",
    "activatedAt": "2024-07-15T10:30:00.000Z"
  }
}
```

**Error Codes**:

| Code | Status | Cause |
|------|--------|-------|
| `MISSING_FIELDS` | 400 | Username, password, or license_key missing |
| `USERNAME_TOO_SHORT` | 400 | Username less than 3 characters |
| `USERNAME_TOO_LONG` | 400 | Username more than 20 characters |
| `INVALID_USERNAME` | 400 | Username contains invalid characters |
| `PASSWORD_TOO_SHORT` | 400 | Password less than 4 characters |
| `PASSWORD_TOO_LONG` | 400 | Password more than 64 characters |
| `INVALID_LICENSE_FORMAT` | 400 | License key too short |
| `LICENSE_NOT_FOUND` | 404 | License key doesn't exist |
| `LICENSE_BANNED` | 403 | License is banned |
| `LICENSE_EXPIRED` | 403 | License has expired |
| `LICENSE_ALREADY_USED` | 409 | License already linked to another account |
| `USER_EXISTS` | 409 | Username is already taken |

---

### 12. User Login

Authenticate a user and retrieve live license status. The response always reflects the current state of the linked license (not stale data).

```
POST /api/users/login
```

**No API key required** (rate-limited to 10/min).

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ Yes | Username |
| `password` | string | ✅ Yes | Password |
| `software_id` | string | No | Software ID (default: `"default"`) |

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "code": "LOGIN_OK",
  "message": "Login successful",
  "data": {
    "username": "johndoe",
    "email": "john@example.com",
    "softwareId": "my-app",
    "licenseKey": "LIC-A1B2C3D4-E5F6A7B8-C9D0E1F2",
    "isPremium": true,
    "licenseStatus": "active",
    "licenseWarning": null,
    "expiresAt": "2025-01-15T00:00:00.000Z",
    "lastLogin": "2024-07-14T08:00:00.000Z"
  }
}
```

**`licenseStatus` values**:

| Value | Meaning |
|-------|---------|
| `active` | License is valid and active |
| `LICENSE_BANNED` | License was banned after registration |
| `LICENSE_EXPIRED` | License expired after registration |
| `LICENSE_NOT_FOUND` | License was deleted after registration |
| `NO_LICENSE` | User has no linked license |

---

## Error Codes Reference

### Universal Codes (any endpoint)

| Code | Description |
|------|-------------|
| `SERVER_ERROR` | Unexpected internal error |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `ENDPOINT_NOT_FOUND` | Invalid API path |
| `INVALID_API_KEY` | Invalid or missing X-Software-API-Key |

### License Codes

| Code | Description |
|------|-------------|
| `MISSING_LICENSE` | License key parameter missing |
| `INVALID_LICENSE` | License key doesn't exist in database |
| `LICENSE_BANNED` | License is banned (check `banReason`, `banUntil`) |
| `EXPIRED` / `LICENSE_EXPIRED` | License expiry date has passed |
| `SOFTWARE_MISMATCH` | License belongs to a different software product |

### Device / HWID Codes

| Code | Description |
|------|-------------|
| `MISSING_HWID` | HWID parameter missing |
| `INVALID_HWID` | HWID format invalid (must be 10-256 characters) |
| `BANNED_HWID` / `HWID_BANNED` | Hardware ID is on the ban list |
| `HWID_ALREADY_REGISTERED` | HWID bound to a different license |
| `HWID_MISMATCH` | HWID doesn't match the registered device |
| `NOT_REGISTERED` | License exists but not bound to any device |

### System Codes

| Code | Description |
|------|-------------|
| `API_DISABLED` | API is disabled globally or per-software |
| `MAINTENANCE_MODE` | Software is in maintenance mode |

---

## Webhook Events

Configure a Discord webhook URL in the admin panel (global or per-software) to receive notifications for these events:

| Event | Trigger |
|-------|---------|
| `device_registered` | New device registered to a license |
| `license_validated` | License validated (0.5% sampling) |
| `hwid_conflict` | HWID tried to register to a different license |
| `activation_conflict` | License tried to activate on a different device |
| `hwid_mismatch` | Validation with wrong HWID |
| `banned_hwid_validation` | Banned HWID attempted validation |
| `banned_license_validation` | Banned license attempted validation |
| `license_auto_unbanned` | Temp ban expired, license auto-unbanned |
| `invalid_license_attempt` | Tried to register with non-existent license |
| `reset_request` | New HWID reset request submitted |
| `reset_approved` | Admin approved a reset request |
| `reset_denied` | Admin denied a reset request |
| `license_generated` | New license created via admin panel |
| `bulk_licenses_generated` | Bulk license batch created |
| `license_deleted` | License deleted from admin |
| `license_banned` | License banned by admin |
| `license_unbanned` | License unbanned by admin |
| `hwid_reset` | Admin manually reset a license's HWID |
| `hwid_banned` | HWID added to ban list |
| `hwid_unbanned` | HWID removed from ban list |
| `software_created` | New software product created |
| `software_updated` | Software settings updated |
| `software_enabled` | Software API re-enabled |
| `software_disabled` | Software API disabled |
| `api_error` | Internal server error on an API endpoint |

---

## Integration Examples

### JavaScript / Node.js

```javascript
const BASE_URL = 'https://your-domain.com';
const API_KEY = 'SDK_YOUR_KEY_HERE';

async function validateLicense(licenseKey, hwid) {
  const url = `${BASE_URL}/api/validate?license=${encodeURIComponent(licenseKey)}&hwid=${encodeURIComponent(hwid)}`;
  
  const res = await fetch(url, {
    headers: { 'X-Software-API-Key': API_KEY }
  });
  
  const data = await res.json();
  
  if (!data.success) {
    console.error(`License invalid: ${data.code} — ${data.message}`);
    return false;
  }
  
  console.log(`License valid! Expires: ${data.data.expiryDate}`);
  
  // Check for update notifications
  if (data.software?.latestVersion) {
    console.log(`Latest version: ${data.software.latestVersion}`);
  }
  
  // Show announcements
  if (data.announcements?.length > 0) {
    data.announcements.forEach(a => console.log(`[${a.type}] ${a.title}: ${a.message}`));
  }
  
  return true;
}

async function registerDevice(licenseKey, hwid, deviceName) {
  const res = await fetch(`${BASE_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Software-API-Key': API_KEY
    },
    body: JSON.stringify({
      license: licenseKey,
      hwid: hwid,
      device_name: deviceName,
      software_id: 'my-app'
    })
  });
  
  return await res.json();
}
```

### Python

```python
import requests

BASE_URL = "https://your-domain.com"
API_KEY = "SDK_YOUR_KEY_HERE"
HEADERS = {"X-Software-API-Key": API_KEY}

def validate_license(license_key: str, hwid: str) -> dict:
    response = requests.get(
        f"{BASE_URL}/api/validate",
        params={"license": license_key, "hwid": hwid},
        headers=HEADERS
    )
    data = response.json()
    
    if not data["success"]:
        raise Exception(f"License invalid: {data['code']} - {data['message']}")
    
    return data["data"]

def register_device(license_key: str, hwid: str, device_name: str = "Unknown") -> dict:
    response = requests.post(
        f"{BASE_URL}/api/register",
        json={
            "license": license_key,
            "hwid": hwid,
            "device_name": device_name,
            "software_id": "my-app"
        },
        headers=HEADERS
    )
    return response.json()
```

### C# / .NET

```csharp
using System.Net.Http;
using System.Text.Json;

public class LicenseClient
{
    private readonly HttpClient _http;
    private readonly string _baseUrl;
    
    public LicenseClient(string baseUrl, string apiKey)
    {
        _baseUrl = baseUrl;
        _http = new HttpClient();
        _http.DefaultRequestHeaders.Add("X-Software-API-Key", apiKey);
    }
    
    public async Task<LicenseResult> ValidateAsync(string license, string hwid)
    {
        var url = $"{_baseUrl}/api/validate?license={Uri.EscapeDataString(license)}&hwid={Uri.EscapeDataString(hwid)}";
        var response = await _http.GetAsync(url);
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<LicenseResult>(json);
    }
    
    public async Task<LicenseResult> RegisterAsync(string license, string hwid, string deviceName)
    {
        var payload = JsonSerializer.Serialize(new {
            license, hwid,
            device_name = deviceName,
            software_id = "my-app"
        });
        var content = new StringContent(payload, System.Text.Encoding.UTF8, "application/json");
        var response = await _http.PostAsync($"{_baseUrl}/api/register", content);
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<LicenseResult>(json);
    }
}

public class LicenseResult
{
    public bool Success { get; set; }
    public string Code { get; set; }
    public string Message { get; set; }
    public JsonElement? Data { get; set; }
}
```

### Go

```go
package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

const BaseUrl = "https://your-domain.com"
const ApiKey = "SDK_YOUR_KEY_HERE"

// Validate a license and cryptographically check responses for tamper-proofing
func ValidateLicense(licenseKey, hwid string) (string, error) {
	url := fmt.Sprintf("%s/api/validate?license=%s&hwid=%s", BaseUrl, licenseKey, hwid)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("X-Software-API-Key", ApiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode == 200 {
		// Response integrity check
		sig := resp.Header.Get("X-Response-Signature")
		mac := hmac.New(sha256.New, []byte(ApiKey))
		mac.Write(body)
		expected := hex.EncodeToString(mac.Sum(nil))
		if sig != expected {
			return "", fmt.Errorf("security check failed: response signature mismatch")
		}
		return string(body), nil
	}
	return "", fmt.Errorf("status error: %d", resp.StatusCode)
}

// Register a new client device
func RegisterDevice(licenseKey, hwid, deviceName string) (string, error) {
	url := fmt.Sprintf("%s/api/register", BaseUrl)
	payload, _ := json.Marshal(map[string]string{
		"license":     licenseKey,
		"hwid":        hwid,
		"device_name": deviceName,
		"software_id": "my-app",
	})
	
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Software-API-Key", ApiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}
```

### Rust

```rust
use hmac::{Hmac, Mac};
use sha2::Sha256;
use hex;

type HmacSha256 = Hmac<Sha256>;

const BASE_URL: &str = "https://your-domain.com";
const API_KEY: &str = "SDK_YOUR_KEY_HERE";

// Validate license with signature check
fn validate_license(license_key: &str, hwid: &str) -> Result<String, Box<dyn std::error::Error>> {
    let url = format!("{}/api/validate?license={}&hwid={}", BASE_URL, license_key, hwid);
    let client = reqwest::blocking::Client::new();
    
    let resp = client.get(&url).header("X-Software-API-Key", API_KEY).send()?;
    let status = resp.status();
    
    let signature = resp.headers().get("X-Response-Signature")
        .and_then(|v| v.to_str().ok()).unwrap_or("").to_string();
    let text = resp.text()?;
    
    if status.is_success() {
        let mut mac = HmacSha256::new_from_slice(API_KEY.as_bytes())?;
        mac.update(text.as_bytes());
        let expected = hex::encode(mac.finalize().into_bytes());
        
        if signature != expected {
            return Err("Security Check Failed: Tampered response detected!".into());
        }
        return Ok(text);
    }
    Err(format!("Server returned error code: {}", status).into())
}

// Register device to a license
fn register_device(license_key: &str, hwid: &str, device_name: &str) -> Result<String, Box<dyn std::error::Error>> {
    let url = format!("{}/api/register", BASE_URL);
    let client = reqwest::blocking::Client::new();
    
    let body = serde_json::json!({
        "license": license_key,
        "hwid": hwid,
        "device_name": device_name,
        "software_id": "my-app"
    });
    
    let resp = client.post(&url)
        .header("X-Software-API-Key", API_KEY)
        .json(&body).send()?;
    Ok(resp.text()?)
}
```

### Java

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class LicenseClient {
    private static final String BASE_URL = "https://your-domain.com";
    private static final String API_KEY = "SDK_YOUR_KEY_HERE";

    // Validate a device license and verify response signature
    public static String validateLicense(String license, String hwid) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String url = BASE_URL + "/api/validate?license=" + license + "&hwid=" + hwid;
        
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
                throw new Exception("Security Error: response verification signature mismatch");
            }
            return response.body();
        }
        throw new Exception("Validation failed: HTTP status " + response.statusCode());
    }

    // Register a new client device
    public static String registerDevice(String license, String hwid, String deviceName) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String json = "{\"license\":\"" + license + "\",\"hwid\":\"" + hwid + 
                      "\",\"device_name\":\"" + deviceName + "\",\"software_id\":\"my-app\"}";
                      
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "/api/register"))
            .header("Content-Type", "application/json")
            .header("X-Software-API-Key", API_KEY)
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
            
        return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
    }

    private static String hmacSha256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes("UTF-8"), "HmacSHA256"));
        byte[] raw = mac.doFinal(data.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : raw) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
```

### C++

```cpp
// Requires libcurl and OpenSSL libraries
#include <iostream>
#include <string>
#include <curl/curl.h>
#include <openssl/hmac.h>
#include <openssl/evp.h>

const std::string BASE_URL = "https://your-domain.com";
const std::string API_KEY = "SDK_YOUR_KEY_HERE";

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

// Validate license and check HMAC-SHA256 signature
bool ValidateLicense(const std::string& license, const std::string& hwid, std::string& responseBody) {
    CURL* curl = curl_easy_init();
    if (!curl) return false;
    
    std::string url = BASE_URL + "/api/validate?license=" + license + "&hwid=" + hwid;
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, ("X-Software-API-Key: " + API_KEY).c_str());
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &responseBody);
    
    CURLcode res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    
    // Validate signature from headers in your request loop
    return res == CURLE_OK;
}
```

### cURL Quick Reference

```bash
# Register
curl -X POST https://your-domain.com/api/register \
  -H "Content-Type: application/json" \
  -H "X-Software-API-Key: SDK_KEY" \
  -d '{"license":"LIC-XXX","hwid":"YOUR_HWID","device_name":"PC"}'

# Validate
curl "https://your-domain.com/api/validate?license=LIC-XXX&hwid=YOUR_HWID" \
  -H "X-Software-API-Key: SDK_KEY"

# License Info
curl "https://your-domain.com/api/license-info?license=LIC-XXX" \
  -H "X-Software-API-Key: SDK_KEY"

# Check Ban
curl "https://your-domain.com/api/check-ban?hwid=YOUR_HWID" \
  -H "X-Software-API-Key: SDK_KEY"

# Request Reset
curl -X POST https://your-domain.com/api/request-hwid-reset \
  -H "Content-Type: application/json" \
  -H "X-Software-API-Key: SDK_KEY" \
  -d '{"license":"LIC-XXX","hwid":"YOUR_HWID","reason":"Changed PC"}'

# Check Reset Status
curl "https://your-domain.com/api/check-request-status?license=LIC-XXX" \
  -H "X-Software-API-Key: SDK_KEY"

# Health Check
curl https://your-domain.com/api/health

# User Register
curl -X POST https://your-domain.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"pass123","license_key":"LIC-XXX","software_id":"my-app"}'

# User Login
curl -X POST https://your-domain.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"pass123","software_id":"my-app"}'
```

---

## Software Configuration

Each software product can be configured with these options via the admin panel:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `authMode` | string | `license_only` | `license_only` or `license_credentials` |
| `bindingMode` | string | `hwid` | `none`, `hwid`, `user_id`, or `hwid_and_user_id` |
| `maxDevices` | number | `1` | Max devices per license |
| `apiEnabled` | boolean | `true` | Enable/disable API for this software |
| `maintenanceMode` | boolean | `false` | Put software in maintenance mode |
| `maintenanceMessage` | string | `""` | Custom maintenance message |
| `versionCheck` | boolean | `false` | Enable version checking endpoint |
| `latestVersion` | string | `"1.0.0"` | Current latest version |
| `downloadUrl` | string | `""` | Download URL for updates |
| `webhookUrl` | string | `""` | Per-software Discord webhook URL |
| `allowSelfReset` | boolean | `false` | Allow users to self-reset HWID |
| `selfResetCooldown` | number | `24` | Hours between self-resets |

### Auth Modes

| Mode | Description | Required Fields |
|------|-------------|-----------------|
| `license_only` | Only license key needed | `license`, `hwid` |
| `license_credentials` | License + username/password | `license`, `hwid`, `username`, `password` |

### Binding Modes

| Mode | Description | Required Fields |
|------|-------------|-----------------|
| `none` | No device binding | `license` only |
| `hwid` | Bind to hardware ID | `license`, `hwid` |
| `user_id` | Bind to user ID | `license`, `user_id` |
| `hwid_and_user_id` | Bind to both | `license`, `hwid`, `user_id` |
