CREATE TABLE "GlobalTankConfig" (
    "id" INTEGER NOT NULL,
    "siteName" TEXT NOT NULL,
    "sampleRateSeconds" INTEGER NOT NULL,
    "alertThresholdPercent" DOUBLE PRECISION NOT NULL,
    "calibrationOffset" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalTankConfig_pkey" PRIMARY KEY ("id")
);
