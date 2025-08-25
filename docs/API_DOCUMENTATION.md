# DASH RACING API DOCUMENTATION

## Overview
The Dash Racing API is a RESTful backend service for the GridGhost Dash mobile racing application. It provides endpoints for user authentication, race management, vehicle data, and real-time racing features.

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-container-app.azurecontainerapps.io`

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-08-24T10:00:00Z"
  },
  "token": "jwt-token-string"
}
```

**Error Responses:**
- `400` - Invalid request data
- `409` - Email already exists

### POST /auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt-token-string"
}
```

**Error Responses:**
- `401` - Invalid credentials
- `400` - Invalid request data

### GET /auth/profile
Get the current user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "stats": {
    "totalRaces": 15,
    "wins": 8,
    "totalDistance": 1250.5
  }
}
```

**Error Responses:**
- `401` - Unauthorized (invalid or missing token)

---

## 🏁 RACE ENDPOINTS

### GET /races
List all available races.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by race status (`scheduled`, `active`, `completed`, `cancelled`)
- `limit` (optional): Number of races to return (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
[
  {
    "id": "race-uuid",
    "name": "Downtown Street Race",
    "status": "scheduled",
    "startTime": "2025-08-25T20:00:00Z",
    "location": {
      "latitude": 34.0522,
      "longitude": -118.2437,
      "address": "Los Angeles, CA"
    },
    "organizer": {
      "id": "user-uuid",
      "name": "John Doe"
    },
    "participants": 5,
    "maxParticipants": 8,
    "raceType": "street",
    "distance": 2.5
  }
]
```

### POST /races
Create a new race.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Evening Street Race",
  "location": {
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "startTime": "2025-08-25T20:00:00Z",
  "maxParticipants": 8,
  "raceType": "street",
  "distance": 3.2,
  "buyIn": 50,
  "description": "Fast-paced street race through downtown"
}
```

**Response (201):**
```json
{
  "id": "race-uuid",
  "name": "Evening Street Race",
  "status": "scheduled",
  "organizer": {
    "id": "user-uuid",
    "name": "John Doe"
  },
  "participants": [
    {
      "id": "user-uuid",
      "name": "John Doe",
      "vehicle": {
        "make": "Ford",
        "model": "Mustang GT"
      }
    }
  ],
  "location": {
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "startTime": "2025-08-25T20:00:00Z",
  "maxParticipants": 8,
  "raceType": "street",
  "createdAt": "2025-08-24T10:00:00Z"
}
```

### GET /races/nearby
Find races near a specific location.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate  
- `radius` (optional): Search radius in kilometers (default: 10)
- `status` (optional): Filter by race status

**Response (200):**
```json
[
  {
    "id": "race-uuid",
    "name": "Nearby Race",
    "distance": 2.3,
    "location": {
      "latitude": 34.0522,
      "longitude": -118.2437
    },
    "startTime": "2025-08-25T20:00:00Z",
    "participants": 3,
    "maxParticipants": 6
  }
]
```

### POST /races/:id/join
Join an existing race.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "vehicleId": "vehicle-uuid"
}
```

**Response (200):**
```json
{
  "message": "Successfully joined race",
  "race": {
    "id": "race-uuid",
    "participants": [
      {
        "id": "user-uuid",
        "name": "John Doe",
        "vehicle": {
          "make": "Ford",
          "model": "Mustang GT"
        }
      }
    ]
  }
}
```

### DELETE /races/:id
Cancel a race (only race organizer).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Race cancelled successfully",
  "race": {
    "id": "race-uuid",
    "status": "cancelled"
  }
}
```

---

## 🚗 VEHICLE ENDPOINTS

### GET /vehicles
Get user's vehicles.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "vehicle-uuid",
    "make": "Ford",
    "model": "Mustang GT",
    "year": 2023,
    "horsepower": 450,
    "weight": 3800,
    "transmission": "manual",
    "drivetrain": "rwd",
    "isActive": true,
    "stats": {
      "totalRaces": 12,
      "wins": 7,
      "bestTime": 145.2
    }
  }
]
```

### POST /vehicles
Add a new vehicle.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "make": "Chevrolet",
  "model": "Camaro SS",
  "year": 2024,
  "horsepower": 455,
  "weight": 3685,
  "transmission": "automatic",
  "drivetrain": "rwd"
}
```

**Response (201):**
```json
{
  "id": "vehicle-uuid",
  "make": "Chevrolet",
  "model": "Camaro SS",
  "year": 2024,
  "horsepower": 455,
  "weight": 3685,
  "transmission": "automatic",
  "drivetrain": "rwd",
  "isActive": true,
  "createdAt": "2025-08-24T10:00:00Z"
}
```

---

## 📊 STATISTICS ENDPOINTS

### GET /stats/user
Get current user's racing statistics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "totalRaces": 25,
  "wins": 14,
  "winRate": 0.56,
  "totalDistance": 87.5,
  "averageSpeed": 65.2,
  "bestTime": 142.8,
  "earnings": 2450,
  "ranking": 158
}
```

### GET /stats/leaderboard
Get global leaderboard.

**Query Parameters:**
- `type` (optional): Leaderboard type (`wins`, `earnings`, `races`) (default: `wins`)
- `limit` (optional): Number of entries (default: 10)

**Response (200):**
```json
[
  {
    "rank": 1,
    "user": {
      "id": "user-uuid",
      "name": "Speed Demon"
    },
    "wins": 45,
    "totalRaces": 52,
    "winRate": 0.87
  }
]
```

---

## 🌐 REAL-TIME ENDPOINTS

### WebSocket Connection
Connect to real-time race updates via WebSocket.

**URL:** `ws://localhost:3000/ws`
**Headers:** `Authorization: Bearer <token>`

**Message Types:**

#### Race Position Update
```json
{
  "type": "position_update",
  "raceId": "race-uuid",
  "userId": "user-uuid",
  "position": {
    "latitude": 34.0522,
    "longitude": -118.2437,
    "speed": 65.5,
    "heading": 180
  },
  "timestamp": "2025-08-24T20:30:15Z"
}
```

#### Race Status Change
```json
{
  "type": "race_status",
  "raceId": "race-uuid",
  "status": "active",
  "participants": [
    {
      "userId": "user-uuid",
      "position": 1,
      "lapTime": 142.5
    }
  ]
}
```

---

## 🔧 UTILITY ENDPOINTS

### GET /health
Health check endpoint.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-24T10:00:00Z",
  "version": "1.0.0"
}
```

### GET /
API information.

**Response (200):**
```json
{
  "ok": true,
  "service": "Dash API",
  "version": "1.0.0"
}
```

---

## 🚨 ERROR RESPONSES

All endpoints may return these common error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request data",
  "details": {
    "field": "email",
    "issue": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## 📝 RATE LIMITING

- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **Real-time updates**: 1000 messages per minute per user

---

## 🔒 SECURITY

- All passwords are hashed using Argon2
- JWT tokens expire after 24 hours
- CORS is configured for allowed origins only
- All sensitive data is transmitted over HTTPS
- API implements request validation and sanitization

---

## 📋 CHANGELOG

### v1.0.0 (2025-08-24)
- Initial API release
- User authentication and management
- Race creation and participation
- Vehicle management
- Real-time race tracking
- Statistics and leaderboards

---

*Last updated: August 24, 2025*