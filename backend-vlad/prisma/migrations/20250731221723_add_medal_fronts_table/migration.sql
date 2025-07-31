-- CreateTable
CREATE TABLE "medal_fronts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "file_name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "background_color" TEXT NOT NULL,
    "logo_color" TEXT NOT NULL,
    "logo_size" DOUBLE PRECISION NOT NULL,
    "logo_x" DOUBLE PRECISION NOT NULL,
    "logo_y" DOUBLE PRECISION NOT NULL,
    "border_radius" DOUBLE PRECISION NOT NULL,
    "use_background_image" BOOLEAN NOT NULL,
    "background_image" TEXT,
    "background_image_size" DOUBLE PRECISION NOT NULL,
    "background_image_x" DOUBLE PRECISION NOT NULL,
    "background_image_y" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "medal_fronts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medal_fronts" ADD CONSTRAINT "medal_fronts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
