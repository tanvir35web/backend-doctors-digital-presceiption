import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDoctorFields1738051200000 implements MigrationInterface {
  name = 'AddDoctorFields1738051200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`doctors\` ADD \`bmdc_reg_no\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`doctors\` ADD \`education\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`doctors\` ADD \`doctor_chamber\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`doctors\` ADD \`visit_fee\` decimal(10,2) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`visit_fee\``);
    await queryRunner.query(
      `ALTER TABLE \`doctors\` DROP COLUMN \`doctor_chamber\``,
    );
    await queryRunner.query(`ALTER TABLE \`doctors\` DROP COLUMN \`education\``);
    await queryRunner.query(
      `ALTER TABLE \`doctors\` DROP COLUMN \`bmdc_reg_no\``,
    );
  }
}
