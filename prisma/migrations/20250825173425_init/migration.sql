-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "presenceMode" TEXT NOT NULL DEFAULT 'METRO',
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionTier" TEXT,
    "subscriptionStart" DATETIME,
    "subscriptionEnd" DATETIME,
    "subscriptionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "color" TEXT,
    "class" TEXT,
    "owned" BOOLEAN NOT NULL DEFAULT false,
    "estimatedValue" REAL,
    "imageUrl" TEXT,
    "weightKg" INTEGER,
    "whp" INTEGER,
    "drivetrain" TEXT,
    "basePower" REAL,
    "baseTorque" REAL,
    "baseWeight" REAL,
    "currentPower" REAL,
    "currentTorque" REAL,
    "currentWeight" REAL,
    "performanceScore" REAL,
    "aiAnalysisDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Car_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Modification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "notes" TEXT,
    "powerGain" REAL,
    "torqueGain" REAL,
    "weightChange" REAL,
    "reliabilityImpact" REAL,
    "compatibilityScore" REAL,
    "performanceGain" REAL,
    "aiConfidence" REAL,
    "marketPrice" REAL,
    "availability" TEXT,
    "vendorUrl" TEXT,
    "reviews" JSONB,
    "lastPriceUpdate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Modification_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdById" TEXT NOT NULL,
    "name" TEXT,
    "raceType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "maxParticipants" INTEGER NOT NULL DEFAULT 8,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "distance" REAL,
    "entryFee" REAL,
    "prizePayout" REAL,
    "locationName" TEXT,
    "locationAddress" TEXT,
    "locationLat" REAL,
    "locationLon" REAL,
    "rules" JSONB,
    "weather" JSONB,
    "trackConditions" JSONB,
    "safetyFeatures" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Race_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RaceParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "racerId" TEXT NOT NULL,
    "carId" TEXT,
    "position" INTEGER,
    "time" REAL,
    CONSTRAINT "RaceParticipant_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RaceParticipant_racerId_fkey" FOREIGN KEY ("racerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RaceParticipant_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RaceResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "carId" TEXT,
    "position" INTEGER,
    "timeSeconds" REAL,
    "topSpeed" REAL,
    "lapTimes" JSONB,
    "performanceScore" REAL,
    "accelerationScore" REAL,
    "handlingScore" REAL,
    "consistencyScore" REAL,
    "skillRating" REAL,
    "carPotential" REAL,
    "telemetryData" JSONB,
    "weatherConditions" TEXT,
    "trackCondition" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RaceResult_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RaceResult_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RaceResult_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RaceSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT,
    "userId" TEXT NOT NULL,
    "carId" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "sessionType" TEXT NOT NULL DEFAULT 'practice',
    "totalDistance" REAL,
    "maxSpeed" REAL,
    "averageSpeed" REAL,
    "zeroToSixty" REAL,
    "quarterMile" REAL,
    "halfMile" REAL,
    "lapTimes" JSONB,
    "gForces" JSONB,
    "performanceScore" REAL,
    "drivingStyle" TEXT,
    "improvementTips" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RaceSession_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RaceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RaceSession_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GPSPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "altitude" REAL,
    "timestamp" DATETIME NOT NULL,
    "accuracy" REAL,
    "speed" REAL,
    "heading" REAL,
    "sequenceIndex" INTEGER NOT NULL,
    CONSTRAINT "GPSPoint_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RaceSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "locationName" TEXT,
    "locationAddress" TEXT,
    "locationLat" REAL,
    "locationLon" REAL,
    "maxAttendees" INTEGER,
    "entryFee" REAL,
    "requirements" JSONB,
    "tags" TEXT,
    "imageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "carId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'going',
    "notes" TEXT,
    CONSTRAINT "Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attendance_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrls" TEXT,
    "tags" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "RaceParticipant_raceId_racerId_key" ON "RaceParticipant"("raceId", "racerId");

-- CreateIndex
CREATE UNIQUE INDEX "RaceResult_raceId_participantId_key" ON "RaceResult"("raceId", "participantId");

-- CreateIndex
CREATE INDEX "GPSPoint_sessionId_sequenceIndex_idx" ON "GPSPoint"("sessionId", "sequenceIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_eventId_userId_key" ON "Attendance"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");
