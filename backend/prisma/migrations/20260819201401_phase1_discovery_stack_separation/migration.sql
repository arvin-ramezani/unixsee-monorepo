/*
  Warnings:

  - Added the required column `discovered_at` to the `website_discoveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `virtual_host_name` to the `website_discoveries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "website_discoveries" ADD COLUMN     "discovered_at" TIMESTAMPTZ(6) NOT NULL,
ADD COLUMN     "virtual_host_name" TEXT NOT NULL;
