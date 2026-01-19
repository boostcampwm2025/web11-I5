import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1768472444486 implements MigrationInterface {
  name = 'AutoMigration1768472444486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types first
    await queryRunner.query(
      `CREATE TYPE "public"."graph_nodes_type_enum" AS ENUM('QUESTION', 'KEYWORD')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."answer_submissions_quiz_mode_enum" AS ENUM('DAILY', 'INTERVIEW')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."answer_submissions_input_type_enum" AS ENUM('VOICE', 'TEXT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."answer_submissions_stt_status_enum" AS ENUM('PENDING', 'DONE', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."answer_submissions_evaluation_status_enum" AS ENUM('COMPLETED', 'PENDING', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."answer_evaluations_accuracy_eval_enum" AS ENUM('PERFECT', 'MINOR_ERROR', 'WRONG')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."answer_evaluations_logic_eval_enum" AS ENUM('CLEAR', 'WEAK', 'NONE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."answer_evaluations_depth_eval_enum" AS ENUM('DEEP', 'BASIC', 'NONE')`,
    );

    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "nickname" character varying NOT NULL, "password" character varying NOT NULL, "total_point" integer NOT NULL DEFAULT '0', "total_score" double precision NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "streaks" ("id" SERIAL NOT NULL, "acitivity_date" date NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_52547016a1a6409f6e5287ed859" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "depth" integer NOT NULL DEFAULT '1', "parent_id" integer, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "questions" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "tts_url" character varying(255), "avg_score" double precision NOT NULL DEFAULT '0', "avg_importance" double precision NOT NULL DEFAULT '0', "category_id" integer, CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "question_solutions" ("id" SERIAL NOT NULL, "question_id" integer NOT NULL, "reference_source" character varying(255) NOT NULL, "standard_definition" text NOT NULL, "technical_mechanism" jsonb NOT NULL, "key_terminology" jsonb NOT NULL, "practical_application" text NOT NULL, "common_misconceptions" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_8481ef9b038dfcb760c1be88fd" UNIQUE ("question_id"), CONSTRAINT "PK_d2033af57d5c21a4b504d5ac669" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "graph_nodes" ("id" SERIAL NOT NULL, "type" "public"."graph_nodes_type_enum" NOT NULL, "label" character varying(255) NOT NULL, "question_id" integer, CONSTRAINT "PK_2a5943b287182cb16fd26aa0aaa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_00dfdfb739bba04a520dfb3885" ON "graph_nodes" ("type", "label") WHERE type = 'KEYWORD'`,
    );
    await queryRunner.query(
      `CREATE TABLE "graph_edges" ("id" SERIAL NOT NULL, "source_id" integer NOT NULL, "target_id" integer NOT NULL, CONSTRAINT "PK_c7b6e013f3760ab6dd3e85b20b8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_54dbd9fbd60f8c1ed1325e11e4" ON "graph_edges" ("source_id", "target_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "audio_assets" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "storage_url" text NOT NULL, "object_key" text, "duration_ms" integer, "byte_size" bigint NOT NULL, "codec" character varying(20) NOT NULL, "sample_rate" integer NOT NULL, "channels" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_693b5e6613dd63d1c304ab2c41e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "answer_submissions" ("id" SERIAL NOT NULL, "quiz_mode" "public"."answer_submissions_quiz_mode_enum" NOT NULL, "input_type" "public"."answer_submissions_input_type_enum" NOT NULL, "raw_answer" text NOT NULL, "taken_time" integer NOT NULL, "score" integer NOT NULL DEFAULT '0', "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), "stt_status" "public"."answer_submissions_stt_status_enum" NOT NULL DEFAULT 'PENDING', "evaluation_status" "public"."answer_submissions_evaluation_status_enum" NOT NULL DEFAULT 'PENDING', "user_id" integer NOT NULL, "question_id" integer NOT NULL, "audio_asset_id" integer, CONSTRAINT "UQ_15512c14382aa6609260879a7aa" UNIQUE ("audio_asset_id"), CONSTRAINT "REL_15512c14382aa6609260879a7a" UNIQUE ("audio_asset_id"), CONSTRAINT "PK_5e33ef0002975ae5bd3a123fc39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "answer_evaluations" ("id" SERIAL NOT NULL, "submission_id" integer NOT NULL, "feedback_message" text, "detail_analysis" jsonb, "score_details" jsonb, "accuracy_eval" "public"."answer_evaluations_accuracy_eval_enum", "logic_eval" "public"."answer_evaluations_logic_eval_enum", "depth_eval" "public"."answer_evaluations_depth_eval_enum", "has_application" boolean NOT NULL DEFAULT false, "is_complete_sentence" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_8583883ebbb589313987b62628" UNIQUE ("submission_id"), CONSTRAINT "PK_c5515cb44c2a12833fba69d52c5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_6004e23393f2a8efe414480b75d" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_solutions" ADD CONSTRAINT "FK_8481ef9b038dfcb760c1be88fd5" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "graph_nodes" ADD CONSTRAINT "FK_e0de4d6e6ed2be66c63f12bb437" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "graph_edges" ADD CONSTRAINT "FK_16f09c64c126e7380673e1f2a53" FOREIGN KEY ("source_id") REFERENCES "graph_nodes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "graph_edges" ADD CONSTRAINT "FK_a524073c6db4eda0336c823a59c" FOREIGN KEY ("target_id") REFERENCES "graph_nodes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_submissions" ADD CONSTRAINT "FK_b42e28b00fa8722a585911cbacc" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_submissions" ADD CONSTRAINT "FK_15512c14382aa6609260879a7aa" FOREIGN KEY ("audio_asset_id") REFERENCES "audio_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_evaluations" ADD CONSTRAINT "FK_8583883ebbb589313987b626282" FOREIGN KEY ("submission_id") REFERENCES "answer_submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "answer_evaluations" DROP CONSTRAINT "FK_8583883ebbb589313987b626282"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_submissions" DROP CONSTRAINT "FK_15512c14382aa6609260879a7aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_submissions" DROP CONSTRAINT "FK_b42e28b00fa8722a585911cbacc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "graph_edges" DROP CONSTRAINT "FK_a524073c6db4eda0336c823a59c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "graph_edges" DROP CONSTRAINT "FK_16f09c64c126e7380673e1f2a53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "graph_nodes" DROP CONSTRAINT "FK_e0de4d6e6ed2be66c63f12bb437"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_solutions" DROP CONSTRAINT "FK_8481ef9b038dfcb760c1be88fd5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_6004e23393f2a8efe414480b75d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`,
    );
    await queryRunner.query(`DROP TABLE "answer_evaluations"`);
    await queryRunner.query(`DROP TABLE "answer_submissions"`);
    await queryRunner.query(`DROP TABLE "audio_assets"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_54dbd9fbd60f8c1ed1325e11e4"`,
    );
    await queryRunner.query(`DROP TABLE "graph_edges"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_00dfdfb739bba04a520dfb3885"`,
    );
    await queryRunner.query(`DROP TABLE "graph_nodes"`);
    await queryRunner.query(`DROP TABLE "question_solutions"`);
    await queryRunner.query(`DROP TABLE "questions"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "streaks"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enum types
    await queryRunner.query(
      `DROP TYPE "public"."answer_evaluations_depth_eval_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."answer_evaluations_logic_eval_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."answer_evaluations_accuracy_eval_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."answer_submissions_evaluation_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."answer_submissions_stt_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."answer_submissions_input_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."answer_submissions_quiz_mode_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."graph_nodes_type_enum"`);
  }
}
