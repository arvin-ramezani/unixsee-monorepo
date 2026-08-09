/*
  Warnings:

  - You are about to drop the `NewsletterSubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestAssessment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "NewsletterSubscription";

-- DropTable
DROP TABLE "RequestAssessment";

-- CreateTable
CREATE TABLE "request_assessments" (
    "id" TEXT NOT NULL,
    "fullName" VARCHAR(120) NOT NULL,
    "workEmail" VARCHAR(254) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "serviceType" VARCHAR(120) NOT NULL,
    "locale" VARCHAR(5) NOT NULL DEFAULT 'fa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "source" VARCHAR(80),
    "locale" VARCHAR(5) NOT NULL DEFAULT 'fa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "newsletter_subscriptions"("email");
