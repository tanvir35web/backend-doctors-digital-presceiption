import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLabsTable1777210844211 implements MigrationInterface {
  name = 'CreateLabsTable1777210844211';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`labs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`license_no\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_bd3c477b7843534c3ca03204bc\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(`ALTER TABLE \`patients\` DROP COLUMN \`gender\``);
    await queryRunner.query(
      `ALTER TABLE \`patients\` ADD \`gender\` enum ('male', 'female', 'other') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`patients\` DROP COLUMN \`gender\``);
    await queryRunner.query(
      `ALTER TABLE \`patients\` ADD \`gender\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bd3c477b7843534c3ca03204bc\` ON \`labs\``,
    );
    await queryRunner.query(`DROP TABLE \`labs\``);
  }
}
