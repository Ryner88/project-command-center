CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING','ACTIVE','ON_HOLD','COMPLETED','CANCELLED');
CREATE TYPE "WorkPriority" AS ENUM ('LOW','MEDIUM','HIGH','URGENT');
ALTER TABLE "Proposal" ADD COLUMN "projectId" TEXT;
CREATE TABLE "Project" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "clientName" TEXT NOT NULL, "description" TEXT NOT NULL,
  "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
  "priority" "WorkPriority" NOT NULL DEFAULT 'MEDIUM',
  "startDate" TEXT, "dueDate" TEXT, "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Task" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "projectId" TEXT NOT NULL,
  "title" TEXT NOT NULL, "description" TEXT,
  "priority" "WorkPriority" NOT NULL DEFAULT 'MEDIUM', "position" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3), "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProposalVersion" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "proposalId" TEXT NOT NULL,
  "version" INTEGER NOT NULL, "snapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProposalVersion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Project_userId_id_key" ON "Project"("userId","id");
CREATE INDEX "Project_userId_archivedAt_priority_updatedAt_idx" ON "Project"("userId","archivedAt","priority","updatedAt");
CREATE INDEX "Project_userId_status_updatedAt_idx" ON "Project"("userId","status","updatedAt");
CREATE INDEX "Task_userId_projectId_completedAt_position_idx" ON "Task"("userId","projectId","completedAt","position");
CREATE UNIQUE INDEX "ProposalVersion_proposalId_version_key" ON "ProposalVersion"("proposalId","version");
CREATE INDEX "ProposalVersion_userId_proposalId_createdAt_idx" ON "ProposalVersion"("userId","proposalId","createdAt");
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_owner_project_fkey" FOREIGN KEY ("userId","projectId") REFERENCES "Project"("userId","id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_owner_project_fkey" FOREIGN KEY ("userId","projectId") REFERENCES "Project"("userId","id") ON DELETE SET NULL ("projectId") ON UPDATE CASCADE;
ALTER TABLE "ProposalVersion" ADD CONSTRAINT "ProposalVersion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProposalVersion" ADD CONSTRAINT "ProposalVersion_owner_proposal_fkey" FOREIGN KEY ("userId","proposalId") REFERENCES "Proposal"("userId","id") ON DELETE CASCADE ON UPDATE CASCADE;
