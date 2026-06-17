-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "laps" INTEGER,
    "time" INTEGER,
    "server" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "guid" TEXT NOT NULL,
    "mainName" TEXT NOT NULL,
    "altNames" TEXT,
    "currentElo" DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    "combo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("guid")
);

-- CreateTable
CREATE TABLE "RaceResult" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "driverGuid" TEXT NOT NULL,
    "started" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "car" TEXT NOT NULL,
    "laps" INTEGER NOT NULL,
    "totalTime" DOUBLE PRECISION NOT NULL,
    "bestLap" DOUBLE PRECISION NOT NULL,
    "gap" TEXT,
    "eloBefore" DOUBLE PRECISION,
    "eloAfter" DOUBLE PRECISION,
    "combo" INTEGER DEFAULT 0,
    "eloAlg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaceResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RaceResult_driverGuid_idx" ON "RaceResult"("driverGuid");

-- CreateIndex
CREATE INDEX "RaceResult_eventId_idx" ON "RaceResult"("eventId");

-- AddForeignKey
ALTER TABLE "RaceResult" ADD CONSTRAINT "RaceResult_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceResult" ADD CONSTRAINT "RaceResult_driverGuid_fkey" FOREIGN KEY ("driverGuid") REFERENCES "Driver"("guid") ON DELETE RESTRICT ON UPDATE CASCADE;
