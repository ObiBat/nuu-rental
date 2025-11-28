#!/usr/bin/env tsx

import { importPropertiesFromCSV } from './ingestion/csv-import';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    console.log('🏠 NUU Property Data Import Tool\n');

    const csvPath = path.join(__dirname, 'data', 'sample_properties.csv');

    console.log(`📂 Importing from: ${csvPath}\n`);

    try {
        const result = await importPropertiesFromCSV(csvPath);

        console.log(`✅ Successfully imported ${result.imported} properties`);

        if (result.errors.length > 0) {
            console.log(`\n⚠️  ${result.errors.length} errors occurred:`);
            result.errors.forEach(err => console.log(`  - ${err}`));
        }

        console.log('\n✨ Import complete!');

    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
}

main();
