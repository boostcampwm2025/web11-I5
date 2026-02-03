import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleOAuth1770086522131 implements MigrationInterface {
  name = 'AddGoogleOAuth1770086522131';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create auth_provider enum type
    await queryRunner.query(
      `CREATE TYPE "public"."users_auth_provider_enum" AS ENUM('LOCAL', 'GOOGLE')`,
    );

    // Add google_id column (nullable, unique)
    await queryRunner.query(
      `ALTER TABLE "users" ADD "google_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_google_id" UNIQUE ("google_id")`,
    );

    // Add auth_provider column with default LOCAL
    await queryRunner.query(
      `ALTER TABLE "users" ADD "auth_provider" "public"."users_auth_provider_enum" NOT NULL DEFAULT 'LOCAL'`,
    );

    // Make password nullable
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Make password NOT NULL again (set empty string for null values first)
    await queryRunner.query(
      `UPDATE "users" SET "password" = '' WHERE "password" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
    );

    // Drop auth_provider column
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "auth_provider"`);

    // Drop auth_provider enum type
    await queryRunner.query(`DROP TYPE "public"."users_auth_provider_enum"`);

    // Drop google_id unique constraint and column
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_google_id"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
  }
}
