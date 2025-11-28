import { supabase, type Property } from '../lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

export interface PropertyImportRow {
    suburb: string;
    state: string;
    postcode: string;
    property_type: string;
    bedrooms?: number;
    bathrooms?: number;
    car_spaces?: number;
    rent_weekly: number;
    street_number?: string;
    street_name?: string;
    latitude?: number;
    longitude?: number;
    features?: string; // Comma-separated
    amenities?: string; // Comma-separated
    utilities?: string; // Comma-separated
    building_age?: string;
    description?: string;
    images?: string; // Comma-separated URLs
    available_from?: string;
    is_negotiable?: boolean;
}

/**
 * Parse CSV string to array of objects
 */
function parseCSV(csvContent: string): PropertyImportRow[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};

        headers.forEach((header, index) => {
            const value = values[index];

            // Parse numbers
            if (['bedrooms', 'bathrooms', 'car_spaces', 'rent_weekly', 'latitude', 'longitude'].includes(header)) {
                row[header] = value ? parseFloat(value) : undefined;
            }
            // Parse booleans
            else if (header === 'is_negotiable') {
                row[header] = value?.toLowerCase() === 'true';
            }
            // Parse arrays (comma-separated in cell)
            else if (['features', 'amenities', 'utilities', 'images'].includes(header)) {
                row[header] = value;
            }
            // Strings
            else {
                row[header] = value || undefined;
            }
        });

        return row as PropertyImportRow;
    });
}

/**
 * Transform import row to Property object
 */
function transformToProperty(row: PropertyImportRow): Omit<Property, 'id' | 'created_at' | 'updated_at'> {
    return {
        external_id: undefined,
        source: 'manual',
        street_number: row.street_number,
        street_name: row.street_name,
        suburb: row.suburb,
        state: row.state,
        postcode: row.postcode,
        latitude: row.latitude,
        longitude: row.longitude,
        property_type: row.property_type,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        car_spaces: row.car_spaces,
        rent_weekly: row.rent_weekly,
        rent_monthly: row.rent_weekly ? Math.round(row.rent_weekly * 4.33) : undefined,
        bond: row.rent_weekly ? row.rent_weekly * 4 : undefined,
        is_negotiable: row.is_negotiable || false,
        features: row.features ? row.features.split(';').map(f => f.trim()) : [],
        amenities: row.amenities ? row.amenities.split(';').map(a => a.trim()) : [],
        utilities: row.utilities ? row.utilities.split(';').map(u => u.trim()) : [],
        building_age: row.building_age,
        description: row.description,
        images: row.images ? row.images.split(';').map(i => i.trim()) : [],
        available_from: row.available_from,
        lease_term: undefined,
        last_synced_at: undefined,
        embedding: undefined
    };
}

/**
 * Import properties from CSV file
 */
export async function importPropertiesFromCSV(filePath: string): Promise<{
    imported: number;
    errors: string[];
}> {
    try {
        const csvContent = fs.readFileSync(filePath, 'utf-8');
        const rows = parseCSV(csvContent);

        const errors: string[] = [];
        let imported = 0;

        for (const row of rows) {
            try {
                const property = transformToProperty(row);

                const { error } = await supabase
                    .from('properties')
                    .insert([property]);

                if (error) {
                    errors.push(`Row ${imported + 1}: ${error.message}`);
                } else {
                    imported++;
                }
            } catch (err) {
                errors.push(`Row ${imported + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }

        return { imported, errors };

    } catch (error) {
        console.error('CSV import error:', error);
        throw error;
    }
}

/**
 * Import properties from JSON array
 */
export async function importPropertiesFromJSON(properties: PropertyImportRow[]): Promise<{
    imported: number;
    errors: string[];
}> {
    const errors: string[] = [];
    let imported = 0;

    for (const row of properties) {
        try {
            const property = transformToProperty(row);

            const { error } = await supabase
                .from('properties')
                .insert([property]);

            if (error) {
                errors.push(`Property ${imported + 1}: ${error.message}`);
            } else {
                imported++;
            }
        } catch (err) {
            errors.push(`Property ${imported + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }

    return { imported, errors };
}
