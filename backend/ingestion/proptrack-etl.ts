import { PropTrackClient, type PropTrackProperty } from '../lib/proptrack';
import { supabase, type Property } from '../lib/supabase';
import { generateEmbedding, createPropertyTextString } from '../lib/embeddings';

export class PropTrackETL {
    private client: PropTrackClient;

    constructor() {
        this.client = new PropTrackClient();
    }

    /**
     * Run the ETL pipeline
     */
    async run() {
        console.log('[ETL] Starting PropTrack sync...');
        const startTime = Date.now();

        try {
            // 1. Extract
            const listings = await this.client.fetchListings(50); // Fetch 50 mock listings
            console.log(`[ETL] Extracted ${listings.length} listings.`);

            let processedCount = 0;
            let errorCount = 0;

            // 2. Transform & Load
            for (const listing of listings) {
                try {
                    await this.processListing(listing);
                    processedCount++;
                } catch (error) {
                    console.error(`[ETL] Error processing listing ${listing.listingId}:`, error);
                    errorCount++;
                }
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`[ETL] Sync complete in ${duration}s. Processed: ${processedCount}, Errors: ${errorCount}`);

        } catch (error) {
            console.error('[ETL] Fatal error:', error);
            throw error;
        }
    }

    private async processListing(listing: PropTrackProperty) {
        // Transform
        const property = await this.transform(listing);

        // Generate Embedding
        const textForEmbedding = createPropertyTextString(property);
        const embedding = await generateEmbedding(textForEmbedding);
        
        property.embedding = embedding;

        // Load (Upsert based on external_id)
        // Note: This assumes 'external_id' has a unique constraint in the database
        const { error } = await supabase
            .from('properties')
            .upsert(property, { onConflict: 'external_id' });

        if (error) {
            throw new Error(`Supabase upsert error: ${error.message}`);
        }
    }

    private async transform(listing: PropTrackProperty): Promise<Partial<Property>> {
        return {
            external_id: listing.listingId,
            source: 'proptrack',
            street_number: listing.address.streetNumber,
            street_name: listing.address.street,
            suburb: listing.address.suburb,
            state: listing.address.state,
            postcode: listing.address.postcode,
            latitude: listing.address.lat,
            longitude: listing.address.lon,
            property_type: listing.propertyType.toUpperCase().replace(' ', '_'),
            bedrooms: listing.features.bedrooms,
            bathrooms: listing.features.bathrooms,
            car_spaces: listing.features.carSpaces,
            rent_weekly: listing.rental.weeklyPrice,
            rent_monthly: Math.round(listing.rental.weeklyPrice * 4.33),
            bond: listing.rental.bond,
            is_negotiable: false, // default
            features: listing.attributes, // Map appropriately
            amenities: [], // Could infer from description
            utilities: [],
            description: listing.description,
            images: listing.images,
            available_from: listing.rental.availableDate,
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
            // created_at is handled by DB default if new
        };
    }
}

