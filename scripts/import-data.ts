import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parse } from 'csv-parse';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database
const db = new Database(path.join(process.cwd(), 'lokahi.db'));

async function importCSV(filePath: string, tableName: string, columns: Array<{csv: string, db: string}>) {
  console.log(`Importing ${filePath} into ${tableName}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({ columns: true, skip_empty_lines: true }));

  const insertStmt = db.prepare(
    `INSERT INTO ${tableName} (${columns.map(col => col.db).join(', ')}) 
     VALUES (${columns.map(() => '?').join(', ')})`
  );

  let count = 0;
  for await (const record of parser) {
    const values = columns.map(col => record[col.csv]);
    insertStmt.run(values);
    count++;
  }
  console.log(`Imported ${count} records into ${tableName}`);
}

async function importAllData() {
  const dataDir = path.join(process.cwd(), 'Data');
  console.log('Looking for data in:', dataDir);

  try {
    // Clear existing data
    const tables = ['condition_prevalence', 'demographic_summary', 'monthly_cost_trends', 'service_setting_summary'];
    tables.forEach(table => {
      db.prepare(`DELETE FROM ${table}`).run();
      console.log(`Cleared table: ${table}`);
    });

    // Import condition prevalence data
    await importCSV(
      path.join(dataDir, 'condition_prevalence.csv'),
      'condition_prevalence',
      [
        { csv: 'MEMBER_MONTH_START_DATE', db: 'date' },
        { csv: 'PRIMARY_CHRONIC_CONDITION_ROLLUP_DESC', db: 'condition' },
        { csv: 'count', db: 'count' },
        { csv: 'prevalence_pct', db: 'prevalence_percentage' }
      ]
    );

    // Import demographic summary data
    await importCSV(
      path.join(dataDir, 'demographic_summary.csv'),
      'demographic_summary',
      [
        { csv: 'MEM_GENDER', db: 'gender' },
        { csv: 'MEM_RACE', db: 'race' },
        { csv: 'MEM_ETHNICITY', db: 'ethnicity' },
        { csv: 'MEM_STATE', db: 'state' },
        { csv: 'PRIMARY_CHRONIC_CONDITION_ROLLUP_DESC', db: 'condition' },
        { csv: 'member_count', db: 'count' }
      ]
    );

    // Import monthly cost trends data
    await importCSV(
      path.join(dataDir, 'monthly_cost_trends.csv'),
      'monthly_cost_trends',
      [
        { csv: 'FROM_DATE', db: 'date' },
        { csv: 'total_cost', db: 'total_cost' },
        { csv: 'avg_cost_per_service', db: 'avg_cost_per_service' },
        { csv: 'unique_members', db: 'unique_members' }
      ]
    );

    // Import service setting summary data
    await importCSV(
      path.join(dataDir, 'service_setting_summary.csv'),
      'service_setting_summary',
      [
        { csv: 'SERVICE_SETTING', db: 'setting_type' },
        { csv: 'service_count', db: 'total_count' },
        { csv: 'avg_cost', db: 'avg_cost' },
        { csv: 'unique_members', db: 'unique_members' }
      ]
    );

    console.log('Data import completed successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importAllData(); 