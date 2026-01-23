import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1769177226052 implements MigrationInterface {
  name = 'InitialSchema1769177226052';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`doctors\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`specialization\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_62069f52ebba471c91de5d59d6\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`patients\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`age\` int NOT NULL, \`gender\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8e8e6b29f954d02d0cf410dbaf\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`prescription_emails\` (\`id\` int NOT NULL AUTO_INCREMENT, \`prescription_id\` int NOT NULL, \`recipient_email\` varchar(255) NOT NULL, \`sent_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`status\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`prescriptions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`doctor_id\` int NOT NULL, \`patient_id\` int NOT NULL, \`chief_complaints\` text NULL, \`diagnosis\` text NULL, \`investigation\` text NULL, \`advice\` text NULL, \`pdf_url\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`medicines\` (\`id\` int NOT NULL AUTO_INCREMENT, \`prescription_id\` int NOT NULL, \`medicine_name\` varchar(255) NOT NULL, \`dosage\` varchar(255) NOT NULL, \`timing\` varchar(255) NOT NULL, \`duration\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`prescription_emails\` ADD CONSTRAINT \`FK_935a16a846a7748427afd2db568\` FOREIGN KEY (\`prescription_id\`) REFERENCES \`prescriptions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`prescriptions\` ADD CONSTRAINT \`FK_2d6a1941bd705056030c2b9e07d\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`doctors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`prescriptions\` ADD CONSTRAINT \`FK_9389db557647131856661f7d7b5\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`medicines\` ADD CONSTRAINT \`FK_dcb12db653c2ae84b2ca664ca18\` FOREIGN KEY (\`prescription_id\`) REFERENCES \`prescriptions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`medicines\` DROP FOREIGN KEY \`FK_dcb12db653c2ae84b2ca664ca18\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`prescriptions\` DROP FOREIGN KEY \`FK_9389db557647131856661f7d7b5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`prescriptions\` DROP FOREIGN KEY \`FK_2d6a1941bd705056030c2b9e07d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`prescription_emails\` DROP FOREIGN KEY \`FK_935a16a846a7748427afd2db568\``,
    );
    await queryRunner.query(`DROP TABLE \`medicines\``);
    await queryRunner.query(`DROP TABLE \`prescriptions\``);
    await queryRunner.query(`DROP TABLE \`prescription_emails\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_8e8e6b29f954d02d0cf410dbaf\` ON \`patients\``,
    );
    await queryRunner.query(`DROP TABLE \`patients\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_62069f52ebba471c91de5d59d6\` ON \`doctors\``,
    );
    await queryRunner.query(`DROP TABLE \`doctors\``);
  }
}
