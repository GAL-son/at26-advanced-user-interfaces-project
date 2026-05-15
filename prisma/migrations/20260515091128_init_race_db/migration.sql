-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "track" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "resultsJsonUrl" TEXT NOT NULL,
    "server" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Driver" (
    "guid" TEXT NOT NULL PRIMARY KEY,
    "mainName" TEXT NOT NULL,
    "altNames" TEXT,
    "currentElo" REAL NOT NULL DEFAULT 1200.0
);

-- CreateTable
CREATE TABLE "EloHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" TEXT NOT NULL,
    "driverGuid" TEXT NOT NULL,
    "eloBefore" REAL NOT NULL,
    "eloAfter" REAL NOT NULL,
    "eloChange" REAL NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EloHistory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EloHistory_driverGuid_fkey" FOREIGN KEY ("driverGuid") REFERENCES "Driver" ("guid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_resultsJsonUrl_key" ON "Event"("resultsJsonUrl");

-- CreateIndex
CREATE INDEX "EloHistory_driverGuid_idx" ON "EloHistory"("driverGuid");

-- CreateIndex
CREATE INDEX "EloHistory_eventId_idx" ON "EloHistory"("eventId");
