import { PropTrackETL } from '../ingestion/proptrack-etl';

async function main() {
    console.log('Starting daily PropTrack sync job...');
    
    const etl = new PropTrackETL();
    
    try {
        await etl.run();
        console.log('Daily sync job completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Daily sync job failed:', error);
        process.exit(1);
    }
}

main();

