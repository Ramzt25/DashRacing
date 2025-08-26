-- CreateTable
CREATE TABLE "VehicleDatabase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "generation" TEXT,
    "category" TEXT,
    "bodyStyle" TEXT,
    "vehicleClass" TEXT,
    "segment" TEXT,
    "engineDisplacement" REAL,
    "engineConfiguration" TEXT,
    "aspiration" TEXT,
    "fuelType" TEXT,
    "horsepower" INTEGER,
    "horsepowerWheel" INTEGER,
    "torque" INTEGER,
    "acceleration0to60" REAL,
    "quarterMile" REAL,
    "topSpeed" INTEGER,
    "powerToWeight" REAL,
    "weight" INTEGER,
    "weightKg" INTEGER,
    "length" REAL,
    "width" REAL,
    "height" REAL,
    "wheelbase" REAL,
    "drivetrain" TEXT,
    "transmission" TEXT,
    "gears" INTEGER,
    "originalMSRP" INTEGER,
    "currentMarketValue" INTEGER,
    "productionYears" TEXT,
    "productionNumbers" INTEGER,
    "aiInsights" JSONB,
    "commonModifications" JSONB,
    "reliabilityScore" REAL,
    "performanceScore" REAL,
    "valueScore" REAL,
    "dataSource" TEXT NOT NULL DEFAULT 'AI-Generated',
    "confidence" REAL NOT NULL DEFAULT 0.8,
    "aiModel" TEXT,
    "generatedBy" TEXT,
    "verifiedBy" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationDate" DATETIME,
    "lookupCount" INTEGER NOT NULL DEFAULT 1,
    "lastUsed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "popularityScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ModificationDatabase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "partNumber" TEXT,
    "compatibleWith" JSONB NOT NULL,
    "restrictedTo" JSONB,
    "predictedPowerGain" REAL,
    "actualPowerGain" REAL,
    "predictedTorqueGain" REAL,
    "actualTorqueGain" REAL,
    "predictedCost" REAL,
    "actualCost" REAL,
    "totalInstalls" INTEGER NOT NULL DEFAULT 0,
    "dynoResultCount" INTEGER NOT NULL DEFAULT 0,
    "accuracy" REAL,
    "confidenceLevel" REAL NOT NULL DEFAULT 0.5,
    "reliabilityScore" REAL,
    "popularityScore" REAL NOT NULL DEFAULT 0,
    "valueScore" REAL,
    "avgInstallTime" REAL,
    "difficultyRating" REAL,
    "toolsRequired" JSONB,
    "priceHistory" JSONB,
    "availability" TEXT,
    "lastLearningUpdate" DATETIME,
    "dataSource" TEXT NOT NULL DEFAULT 'AI-Generated',
    "aiModel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DynoResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carId" TEXT NOT NULL,
    "modificationId" TEXT,
    "modDatabaseId" TEXT,
    "dynoType" TEXT,
    "dynoShop" TEXT,
    "operator" TEXT,
    "baselinePower" REAL,
    "baselineTorque" REAL,
    "baselineRPM" INTEGER,
    "resultPower" REAL NOT NULL,
    "resultTorque" REAL NOT NULL,
    "resultRPM" INTEGER,
    "powerGain" REAL NOT NULL,
    "torqueGain" REAL NOT NULL,
    "percentGain" REAL,
    "temperature" REAL,
    "humidity" REAL,
    "barometricPressure" REAL,
    "correctionFactor" TEXT,
    "modificationCost" REAL,
    "installationTime" REAL,
    "installationNotes" TEXT,
    "satisfactionRating" INTEGER,
    "wouldRecommend" BOOLEAN,
    "notes" TEXT,
    "usedForLearning" BOOLEAN NOT NULL DEFAULT false,
    "confidenceScore" REAL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verificationDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DynoResult_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DynoResult_modificationId_fkey" FOREIGN KEY ("modificationId") REFERENCES "Modification" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DynoResult_modDatabaseId_fkey" FOREIGN KEY ("modDatabaseId") REFERENCES "ModificationDatabase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "trim" TEXT,
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
    "vehicleDataId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Car_vehicleDataId_fkey" FOREIGN KEY ("vehicleDataId") REFERENCES "VehicleDatabase" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Car_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Car" ("aiAnalysisDate", "basePower", "baseTorque", "baseWeight", "class", "color", "createdAt", "currentPower", "currentTorque", "currentWeight", "drivetrain", "estimatedValue", "id", "imageUrl", "make", "model", "name", "owned", "performanceScore", "updatedAt", "userId", "weightKg", "whp", "year") SELECT "aiAnalysisDate", "basePower", "baseTorque", "baseWeight", "class", "color", "createdAt", "currentPower", "currentTorque", "currentWeight", "drivetrain", "estimatedValue", "id", "imageUrl", "make", "model", "name", "owned", "performanceScore", "updatedAt", "userId", "weightKg", "whp", "year" FROM "Car";
DROP TABLE "Car";
ALTER TABLE "new_Car" RENAME TO "Car";
CREATE TABLE "new_Modification" (
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
    "modDatabaseId" TEXT,
    "predictedGains" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Modification_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Modification_modDatabaseId_fkey" FOREIGN KEY ("modDatabaseId") REFERENCES "ModificationDatabase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Modification" ("aiConfidence", "availability", "brand", "carId", "category", "compatibilityScore", "createdAt", "id", "lastPriceUpdate", "marketPrice", "name", "notes", "performanceGain", "powerGain", "reliabilityImpact", "reviews", "torqueGain", "updatedAt", "vendorUrl", "weightChange") SELECT "aiConfidence", "availability", "brand", "carId", "category", "compatibilityScore", "createdAt", "id", "lastPriceUpdate", "marketPrice", "name", "notes", "performanceGain", "powerGain", "reliabilityImpact", "reviews", "torqueGain", "updatedAt", "vendorUrl", "weightChange" FROM "Modification";
DROP TABLE "Modification";
ALTER TABLE "new_Modification" RENAME TO "Modification";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "VehicleDatabase_make_model_idx" ON "VehicleDatabase"("make", "model");

-- CreateIndex
CREATE INDEX "VehicleDatabase_category_bodyStyle_idx" ON "VehicleDatabase"("category", "bodyStyle");

-- CreateIndex
CREATE INDEX "VehicleDatabase_year_make_idx" ON "VehicleDatabase"("year", "make");

-- CreateIndex
CREATE INDEX "VehicleDatabase_popularityScore_idx" ON "VehicleDatabase"("popularityScore");

-- CreateIndex
CREATE INDEX "VehicleDatabase_lookupCount_idx" ON "VehicleDatabase"("lookupCount");

-- CreateIndex
CREATE INDEX "VehicleDatabase_dataSource_isVerified_idx" ON "VehicleDatabase"("dataSource", "isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleDatabase_year_make_model_trim_key" ON "VehicleDatabase"("year", "make", "model", "trim");

-- CreateIndex
CREATE INDEX "ModificationDatabase_category_brand_idx" ON "ModificationDatabase"("category", "brand");

-- CreateIndex
CREATE INDEX "ModificationDatabase_popularityScore_idx" ON "ModificationDatabase"("popularityScore");

-- CreateIndex
CREATE INDEX "ModificationDatabase_accuracy_idx" ON "ModificationDatabase"("accuracy");

-- CreateIndex
CREATE INDEX "ModificationDatabase_totalInstalls_idx" ON "ModificationDatabase"("totalInstalls");

-- CreateIndex
CREATE INDEX "ModificationDatabase_confidenceLevel_idx" ON "ModificationDatabase"("confidenceLevel");

-- CreateIndex
CREATE INDEX "DynoResult_carId_idx" ON "DynoResult"("carId");

-- CreateIndex
CREATE INDEX "DynoResult_modDatabaseId_idx" ON "DynoResult"("modDatabaseId");

-- CreateIndex
CREATE INDEX "DynoResult_powerGain_idx" ON "DynoResult"("powerGain");

-- CreateIndex
CREATE INDEX "DynoResult_isVerified_idx" ON "DynoResult"("isVerified");

-- CreateIndex
CREATE INDEX "DynoResult_usedForLearning_idx" ON "DynoResult"("usedForLearning");
