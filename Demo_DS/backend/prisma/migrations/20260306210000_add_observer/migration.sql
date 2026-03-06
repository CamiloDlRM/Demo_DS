-- CreateTable
CREATE TABLE "Tank" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacityLiters" DOUBLE PRECISION NOT NULL,
    "geometry" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TankThreshold" (
    "id" SERIAL NOT NULL,
    "tankId" INTEGER NOT NULL,
    "minLevel" DOUBLE PRECISION NOT NULL,
    "criticalMin" DOUBLE PRECISION NOT NULL,
    "maxLevel" DOUBLE PRECISION NOT NULL,
    "leakThreshold" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TankThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "tankId" INTEGER NOT NULL,
    "alertType" TEXT NOT NULL,
    "currentLevel" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TankThreshold_tankId_key" ON "TankThreshold"("tankId");

-- AddForeignKey
ALTER TABLE "TankThreshold" ADD CONSTRAINT "TankThreshold_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "Tank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "Tank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
