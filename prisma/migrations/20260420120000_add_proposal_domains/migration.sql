-- CreateEnum
CREATE TYPE "ProposalDomain" AS ENUM (
    'WEBSITE',
    'SAAS_SOFTWARE',
    'EDUCATION_SCHOOL',
    'MEDICAL_HEALTHCARE',
    'INTERNAL_TOOL',
    'FINANCE',
    'OTHER'
);

-- AlterTable
ALTER TABLE "ProposalSeed"
ADD COLUMN "projectDomain" "ProposalDomain",
ADD COLUMN "projectDomainOther" TEXT;

-- AlterTable
ALTER TABLE "Proposal"
ADD COLUMN "projectType" TEXT,
ADD COLUMN "projectDomain" "ProposalDomain",
ADD COLUMN "projectDomainOther" TEXT;
