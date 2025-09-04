# Dash AI Assistant - Tool Catalog

This document defines the available function calls for the Dash AI Assistant. All tool signatures mirror the client/Edge Function APIs.

## Vehicle Functions

### resolveVehicle(params)
Resolve vehicle specifications from VIN or Make/Model/Year.

**Parameters:**
```typescript
{
  vin?: string;           // Optional VIN number
  make?: string;          // Vehicle make (required if no VIN)
  model?: string;         // Vehicle model (required if no VIN)
  year?: number;          // Vehicle year (required if no VIN)
  region?: string;        // Region code (default: 'us')
}
```

**Returns:**
```typescript
{
  make: string;
  model: string;
  year: number;
  trim: string;
  specs?: VehicleSpecs;
}
```

### suggestUpgrades(params) [Premium Only]
Generate AI-powered upgrade suggestions for a vehicle.

**Parameters:**
```typescript
{
  vehicleSpec: VehicleResolveOutput;
  goals?: string[];       // Performance goals
  budget?: number;        // Budget in USD
  experience?: string;    // User experience level
}
```

**Returns:**
```typescript
{
  recommendations: Modification[];
  totalCost: number;
  timeframe: string;
  expertInsights: string[];
  nextSteps: string[];
}
```

## Community Functions

### getNearbyMeets(params)
Find meets near a location.

**Parameters:**
```typescript
{
  lat: number;           // Latitude
  lon: number;           // Longitude
  radius?: number;       // Search radius in meters (default: 25000)
  limit?: number;        // Result limit (default: 20)
}
```

**Returns:**
```typescript
{
  meets: Meet[];
  total: number;
}
```

### createMeet(params)
Create a new community meet (requires validation).

**Parameters:**
```typescript
{
  title: string;
  description?: string;
  startAt: string;       // ISO timestamp
  endAt: string;         // ISO timestamp
  latitude: number;
  longitude: number;
  radiusMeters: number;
  visibility: 'public' | 'private' | 'club';
  rules?: string;
  maxAttendees?: number;
}
```

**Returns:**
```typescript
{
  meet: Meet;
  success: boolean;
}
```

## Safety Functions

### reportPin(params)
Report a community pin for safety or abuse.

**Parameters:**
```typescript
{
  pinId: string;
  reason: string;        // Report reason
  description?: string;  // Additional context
}
```

**Returns:**
```typescript
{
  reportId: string;
  success: boolean;
  message: string;
}
```

### createPin(params)
Create a community safety pin.

**Parameters:**
```typescript
{
  type: 'police' | 'hazard' | 'construction' | 'camera' | 'pothole';
  latitude: number;
  longitude: number;
  description?: string;
  photo?: string;        // Base64 or URL
}
```

**Returns:**
```typescript
{
  pin: Pin;
  success: boolean;
}
```

## User Functions

### getUserProfile()
Get current user's profile information.

**Returns:**
```typescript
{
  user: User;
  entitlements: UserEntitlements;
}
```

### updateProfile(params)
Update user profile settings.

**Parameters:**
```typescript
{
  displayName?: string;
  bio?: string;
  liveSharingScope?: 'friends' | 'events' | 'nobody';
  quietHours?: {
    start: string;       // HH:MM format
    end: string;         // HH:MM format
  };
}
```

**Returns:**
```typescript
{
  user: User;
  success: boolean;
}
```

## Important Notes

- All functions require authentication
- Premium functions verify entitlements server-side
- Location-based functions respect privacy settings
- Rate limiting is enforced on create operations
- All responses include success status and error handling

## Usage Guidelines

1. Always validate user permissions before calling functions
2. Handle errors gracefully with user-friendly messages
3. Respect rate limits and cooldown periods
4. Provide context for required parameters
5. Explain premium feature requirements clearly