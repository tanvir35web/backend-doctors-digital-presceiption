import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrescriptionFields1738400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add weight column to patients table
    await queryRunner.query(`
      ALTER TABLE patients 
      ADD COLUMN weight DECIMAL(5,2) NULL
    `);

    // Add notes column to medicines table
    await queryRunner.query(`
      ALTER TABLE medicines 
      ADD COLUMN notes TEXT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE patients 
      DROP COLUMN weight
    `);

    await queryRunner.query(`
      ALTER TABLE medicines 
      DROP COLUMN notes
    `);
  }
}
