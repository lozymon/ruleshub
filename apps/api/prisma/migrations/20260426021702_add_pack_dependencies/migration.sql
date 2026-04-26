-- CreateTable
CREATE TABLE "PackageDependency" (
    "packId" TEXT NOT NULL,
    "depId" TEXT NOT NULL,
    "versionRange" TEXT NOT NULL,

    CONSTRAINT "PackageDependency_pkey" PRIMARY KEY ("packId","depId")
);

-- CreateIndex
CREATE INDEX "PackageDependency_depId_idx" ON "PackageDependency"("depId");

-- AddForeignKey
ALTER TABLE "PackageDependency" ADD CONSTRAINT "PackageDependency_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageDependency" ADD CONSTRAINT "PackageDependency_depId_fkey" FOREIGN KEY ("depId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
