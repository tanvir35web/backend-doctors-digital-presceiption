import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMedicalReportsTable1777212121926 implements MigrationInterface {
  name = 'CreateMedicalReportsTable1777212121926';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`medical_reports\` (\`id\` int NOT NULL AUTO_INCREMENT, \`lab_id\` int NOT NULL, \`patient_id\` int NOT NULL, \`report_type\` enum ('xray', 'mri', 'ct_scan', 'blood_test', 'ultrasound', 'other') NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`file_url\` varchar(255) NOT NULL, \`file_type\` enum ('image', 'pdf') NOT NULL, \`original_filename\` varchar(255) NOT NULL, \`report_date\` date NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`medical_reports\` ADD CONSTRAINT \`FK_bc4b68141abeb7f3e3b10494872\` FOREIGN KEY (\`lab_id\`) REFERENCES \`labs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`medical_reports\` ADD CONSTRAINT \`FK_251c373f7e33e9c319df8c79c7f\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`medical_reports\` DROP FOREIGN KEY \`FK_251c373f7e33e9c319df8c79c7f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`medical_reports\` DROP FOREIGN KEY \`FK_bc4b68141abeb7f3e3b10494872\``,
    );
    await queryRunner.query(`DROP TABLE \`medical_reports\``);
  }
}
