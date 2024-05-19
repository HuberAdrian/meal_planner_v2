-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventType" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ingredient1" TEXT,
    "ingredient2" TEXT,
    "ingredient3" TEXT,
    "ingredient4" TEXT,
    "ingredient5" TEXT,
    "ingredient6" TEXT,
    "ingredient7" TEXT,
    "ingredient8" TEXT,
    "ingredient9" TEXT,
    "ingredient10" TEXT,
    "ingredient11" TEXT,
    "ingredient12" TEXT,
    "ingredient13" TEXT,
    "ingredient14" TEXT,
    "ingredient15" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemGroceryList" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usageDate" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ItemGroceryList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Meal_createdAt_idx" ON "Meal"("createdAt");

-- CreateIndex
CREATE INDEX "ItemGroceryList_createdAt_idx" ON "ItemGroceryList"("createdAt");
