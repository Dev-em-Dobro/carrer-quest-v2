-- CreateEnum
CREATE TYPE "ResumeSyncStatus" AS ENUM ('NOT_UPLOADED', 'UPLOADED', 'PROCESSING', 'READY');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "city" TEXT,
    "professionalSummary" TEXT,
    "experiences" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "knownTechnologies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "resumeFileName" TEXT,
    "resumeSyncStatus" "ResumeSyncStatus" NOT NULL DEFAULT 'NOT_UPLOADED',
    "resumeUploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
