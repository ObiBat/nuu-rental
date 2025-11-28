/**
 * Database Seeding Script
 * Populates the Supabase database with realistic Sydney rental properties
 * 
 * Run: npx tsx backend/scripts/seed-database.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { SEED_PROPERTIES } from '../data/seed-properties';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('  ⚠️  Embedding generation failed:', error);
    return null;
  }
}

function createPropertyText(property: typeof SEED_PROPERTIES[0]): string {
  return `
    ${property.title}
    ${property.description}
    ${property.property_type} in ${property.suburb}, ${property.state}
    ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms
    $${property.rent_weekly} per week
    Features: ${property.features.join(', ')}
    ${property.pet_friendly ? 'Pet friendly' : 'No pets'}
    ${property.furnished ? 'Furnished' : 'Unfurnished'}
  `.trim();
}

async function seedDatabase() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║   🌱 NUU Property Database Seeder                            ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Properties to seed: ${SEED_PROPERTIES.length}`);
  console.log('🏖️  Suburbs covered: Bondi, Manly, Coogee, Surry Hills, + more\n');

  // Check current database state
  const { count: existingCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  console.log(`📁 Existing properties in database: ${existingCount || 0}\n`);

  let successCount = 0;
  let errorCount = 0;
  let embeddingCount = 0;

  for (let i = 0; i < SEED_PROPERTIES.length; i++) {
    const property = SEED_PROPERTIES[i];
    const progress = `[${i + 1}/${SEED_PROPERTIES.length}]`;
    
    console.log(`${progress} Processing: ${property.suburb} - ${property.property_type}`);
    console.log(`        💰 $${property.rent_weekly}/wk | 🛏️  ${property.bedrooms}BR | 🚗 ${property.parking} parking`);

    // Generate embedding
    const propertyText = createPropertyText(property);
    const embedding = await generateEmbedding(propertyText);
    
    if (embedding) {
      console.log('        ✓ Embedding generated');
      embeddingCount++;
    }

    // Parse address into street_number and street_name
    const addressParts = property.address.match(/^(\d+)\s+(.+)$/);
    const streetNumber = addressParts ? addressParts[1] : '';
    const streetName = addressParts ? addressParts[2] : property.address;

    // Prepare property data for database (matching existing schema)
    const dbProperty = {
      external_id: property.external_id,
      description: property.description,
      property_type: property.property_type.toUpperCase(),
      rent_weekly: property.rent_weekly,
      rent_monthly: Math.round(property.rent_weekly * 4.33),
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      car_spaces: property.parking,
      street_number: streetNumber,
      street_name: streetName,
      suburb: property.suburb,
      state: property.state,
      postcode: property.postcode,
      latitude: property.latitude,
      longitude: property.longitude,
      features: property.features,
      amenities: property.features.filter(f => 
        ['pool', 'gym', 'sauna', 'tennis court', 'concierge', 'rooftop', 'bbq'].some(a => f.toLowerCase().includes(a))
      ),
      utilities: property.furnished ? ['furnished'] : [],
      images: property.images,
      available_from: property.available_date,
      bond: property.bond,
      is_negotiable: false,
      building_age: property.features.some(f => f.includes('new') || f.includes('modern')) ? 'NEW' : 
                    property.features.some(f => f.includes('heritage') || f.includes('art deco')) ? 'HERITAGE' : 'ESTABLISHED',
      embedding: embedding,
      source: 'seed_data',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString()
    };

    // Upsert to database (update if exists, insert if new)
    const { error } = await supabase
      .from('properties')
      .upsert(dbProperty, { onConflict: 'external_id' });

    if (error) {
      console.log(`        ❌ Error: ${error.message}`);
      errorCount++;
    } else {
      console.log('        ✓ Saved to database');
      successCount++;
    }

    console.log('');

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Final summary
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     SEEDING COMPLETE                         ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║   ✅ Successfully seeded: ${String(successCount).padStart(2)} properties                      ║`);
  console.log(`║   🧠 Embeddings created:  ${String(embeddingCount).padStart(2)} vectors                        ║`);
  console.log(`║   ❌ Errors:              ${String(errorCount).padStart(2)}                                   ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Verify final count
  const { count: finalCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total properties in database: ${finalCount}\n`);

  // Show sample of what's in the database
  const { data: samples } = await supabase
    .from('properties')
    .select('suburb, property_type, rent_weekly, bedrooms')
    .order('rent_weekly', { ascending: true })
    .limit(5);

  if (samples && samples.length > 0) {
    console.log('💡 Sample properties (lowest rent first):');
    samples.forEach(p => {
      console.log(`   • ${p.suburb}: ${p.property_type}, $${p.rent_weekly}/wk, ${p.bedrooms}BR`);
    });
  }

  console.log('\n🚀 Database is ready for testing!\n');
}

// Run the seeder
seedDatabase().catch(console.error);

