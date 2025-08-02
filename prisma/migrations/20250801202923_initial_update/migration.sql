-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "microphoneDeepgramKey" JSONB,
    "capturescreenDeepgramKey" JSONB,
    "blocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "conversation" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "chat" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "summary" TEXT,
    "meeting_template_id" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileUrl" VARCHAR(2048) NOT NULL,
    "awsFileUrl" VARCHAR(2048),
    "uploadedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "fileSize" BIGINT,
    "mimeType" VARCHAR(100),
    "fileName" VARCHAR(255),
    "isEmbedded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" VARCHAR(500) NOT NULL,
    "goal" TEXT NOT NULL,
    "additionalInfo" TEXT,
    "duration" VARCHAR(50) NOT NULL DEFAULT '30 mins',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "meeting_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentToMeetingTemplate" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentToMeetingTemplate_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DocumentToSession" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentToSession_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_blocked_idx" ON "users"("blocked");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_meeting_template_id_idx" ON "sessions"("meeting_template_id");

-- CreateIndex
CREATE INDEX "sessions_createdAt_idx" ON "sessions"("createdAt");

-- CreateIndex
CREATE INDEX "sessions_isActive_idx" ON "sessions"("isActive");

-- CreateIndex
CREATE INDEX "sessions_isDeleted_idx" ON "sessions"("isDeleted");

-- CreateIndex
CREATE INDEX "sessions_userId_isActive_isDeleted_idx" ON "sessions"("userId", "isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "documents"("userId");

-- CreateIndex
CREATE INDEX "documents_uploadedAt_idx" ON "documents"("uploadedAt");

-- CreateIndex
CREATE INDEX "documents_isEmbedded_idx" ON "documents"("isEmbedded");

-- CreateIndex
CREATE INDEX "documents_mimeType_idx" ON "documents"("mimeType");

-- CreateIndex
CREATE INDEX "documents_userId_isEmbedded_idx" ON "documents"("userId", "isEmbedded");

-- CreateIndex
CREATE INDEX "meeting_templates_userId_idx" ON "meeting_templates"("userId");

-- CreateIndex
CREATE INDEX "meeting_templates_createdAt_idx" ON "meeting_templates"("createdAt");

-- CreateIndex
CREATE INDEX "meeting_templates_isActive_idx" ON "meeting_templates"("isActive");

-- CreateIndex
CREATE INDEX "meeting_templates_userId_isActive_idx" ON "meeting_templates"("userId", "isActive");

-- CreateIndex
CREATE INDEX "_DocumentToMeetingTemplate_B_index" ON "_DocumentToMeetingTemplate"("B");

-- CreateIndex
CREATE INDEX "_DocumentToSession_B_index" ON "_DocumentToSession"("B");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_meeting_template_id_fkey" FOREIGN KEY ("meeting_template_id") REFERENCES "meeting_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_templates" ADD CONSTRAINT "meeting_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToMeetingTemplate" ADD CONSTRAINT "_DocumentToMeetingTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToMeetingTemplate" ADD CONSTRAINT "_DocumentToMeetingTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "meeting_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToSession" ADD CONSTRAINT "_DocumentToSession_A_fkey" FOREIGN KEY ("A") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToSession" ADD CONSTRAINT "_DocumentToSession_B_fkey" FOREIGN KEY ("B") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
