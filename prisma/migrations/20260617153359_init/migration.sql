-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "laps" INTEGER,
    "time" INTEGER,
    "server" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Driver" (
    "guid" TEXT NOT NULL PRIMARY KEY,
    "mainName" TEXT NOT NULL,
    "altNames" TEXT,
    "currentElo" REAL NOT NULL DEFAULT 1000.0,
    "combo" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "RaceResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "driverGuid" TEXT NOT NULL,
    "started" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "car" TEXT NOT NULL,
    "laps" INTEGER NOT NULL,
    "totalTime" REAL NOT NULL,
    "bestLap" REAL NOT NULL,
    "gap" TEXT,
    "eloBefore" REAL,
    "eloAfter" REAL,
    "combo" INTEGER DEFAULT 0,
    "eloAlg" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RaceResult_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RaceResult_driverGuid_fkey" FOREIGN KEY ("driverGuid") REFERENCES "Driver" ("guid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RaceResult_driverGuid_idx" ON "RaceResult"("driverGuid");

-- CreateIndex
CREATE INDEX "RaceResult_eventId_idx" ON "RaceResult"("eventId");
