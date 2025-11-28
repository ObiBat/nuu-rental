import type { Property } from './supabase';
import type { ExtractedPreferences } from './ai-engine';

export interface AccurateMatchResult {
    score: number;
    breakdown: {
        location: { score: number; weight: number; reason: string };
        budget: { score: number; weight: number; reason: string };
        features: { score: number; weight: number; matched: string[]; missing: string[]; reason: string };
        amenities: { score: number; weight: number; matched: string[]; available: string[]; reason: string };
        transport: { score: number; weight: number; reason: string };
        propertyType: { score: number; weight: number; reason: string };
        bedrooms: { score: number; weight: number; reason: string };
        bonus: { score: number; reasons: string[] };
        overall: string;
    };
}

// Sydney suburb coordinates for location matching
const SUBURB_COORDS: Record<string, { lat: number; lng: number; type: string }> = {
    // Eastern Beaches
    'bondi': { lat: -33.8915, lng: 151.2767, type: 'beach' },
    'bondi beach': { lat: -33.8908, lng: 151.2743, type: 'beach' },
    'bronte': { lat: -33.9033, lng: 151.2633, type: 'beach' },
    'coogee': { lat: -33.9200, lng: 151.2550, type: 'beach' },
    'tamarama': { lat: -33.8983, lng: 151.2700, type: 'beach' },
    'maroubra': { lat: -33.9500, lng: 151.2433, type: 'beach' },
    
    // Northern Beaches
    'manly': { lat: -33.7969, lng: 151.2878, type: 'beach' },
    'dee why': { lat: -33.7500, lng: 151.2900, type: 'beach' },
    'freshwater': { lat: -33.7800, lng: 151.2850, type: 'beach' },
    'curl curl': { lat: -33.7700, lng: 151.2900, type: 'beach' },
    'cronulla': { lat: -34.0587, lng: 151.1522, type: 'beach' },
    
    // Inner City
    'sydney cbd': { lat: -33.8688, lng: 151.2093, type: 'city' },
    'sydney': { lat: -33.8688, lng: 151.2093, type: 'city' },
    'surry hills': { lat: -33.8833, lng: 151.2117, type: 'city' },
    'darlinghurst': { lat: -33.8783, lng: 151.2183, type: 'city' },
    'potts point': { lat: -33.8700, lng: 151.2233, type: 'city' },
    'paddington': { lat: -33.8850, lng: 151.2267, type: 'inner' },
    
    // Inner West
    'newtown': { lat: -33.8967, lng: 151.1783, type: 'inner' },
    'marrickville': { lat: -33.9117, lng: 151.1550, type: 'inner' },
    'erskineville': { lat: -33.9017, lng: 151.1867, type: 'inner' },
    'redfern': { lat: -33.8925, lng: 151.2050, type: 'inner' },
    
    // Lower North Shore
    'neutral bay': { lat: -33.8333, lng: 151.2167, type: 'harbour' },
    'cremorne': { lat: -33.8283, lng: 151.2283, type: 'harbour' },
    'mosman': { lat: -33.8283, lng: 151.2433, type: 'harbour' },
    
    // CBD Adjacent
    'pyrmont': { lat: -33.8700, lng: 151.1933, type: 'city' },
    'ultimo': { lat: -33.8783, lng: 151.1983, type: 'city' },
    'chippendale': { lat: -33.8867, lng: 151.1983, type: 'city' },
    
    // Melbourne (for existing data)
    'fitzroy': { lat: -37.7986, lng: 144.9784, type: 'inner' },
    'richmond': { lat: -37.8183, lng: 144.9986, type: 'inner' },
    'melbourne': { lat: -37.8136, lng: 144.9631, type: 'city' },
    'brisbane': { lat: -27.4698, lng: 153.0251, type: 'city' },
    'brisbane city': { lat: -27.4698, lng: 153.0251, type: 'city' },
};

// Beach suburbs for type matching
const BEACH_SUBURBS = ['bondi', 'bondi beach', 'manly', 'coogee', 'bronte', 'cronulla', 'maroubra', 'tamarama', 'dee why', 'freshwater', 'curl curl'];
const CITY_SUBURBS = ['sydney cbd', 'sydney', 'surry hills', 'darlinghurst', 'pyrmont', 'ultimo', 'chippendale', 'potts point', 'melbourne', 'brisbane', 'brisbane city'];
const HARBOUR_SUBURBS = ['neutral bay', 'cremorne', 'mosman', 'kirribilli', 'lavender bay'];

// Transport hub locations
const TRANSPORT_HUBS: Record<string, { lat: number; lng: number; type: string }> = {
    'central station': { lat: -33.8833, lng: 151.2056, type: 'train' },
    'town hall': { lat: -33.8731, lng: 151.2065, type: 'train' },
    'bondi junction': { lat: -33.8913, lng: 151.2477, type: 'train' },
    'circular quay': { lat: -33.8617, lng: 151.2108, type: 'ferry' },
    'manly wharf': { lat: -33.7969, lng: 151.2845, type: 'ferry' },
    'sydney cbd': { lat: -33.8688, lng: 151.2093, type: 'city' },
};

// Suburbs with good transport
const WELL_CONNECTED_SUBURBS: Record<string, string[]> = {
    'train': ['surry hills', 'redfern', 'newtown', 'bondi junction', 'central', 'town hall', 'pyrmont', 'ultimo'],
    'ferry': ['manly', 'neutral bay', 'cremorne', 'mosman', 'circular quay'],
    'bus': ['bondi', 'bondi beach', 'coogee', 'bronte', 'paddington'],
    'light rail': ['pyrmont', 'ultimo', 'chippendale', 'surry hills'],
};

/**
 * Calculate Haversine distance between two points in km
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

/**
 * Professional matching algorithm with granular scoring
 */
export function calculateAccurateMatch(
    property: Property,
    preferences: ExtractedPreferences
): AccurateMatchResult {
    
    // Dynamic weights based on what user specified
    const weights = {
        location: preferences.specific_suburbs?.length ? 0.25 : (preferences.location_type ? 0.18 : 0.08),
        budget: (preferences.budget_weekly || preferences.budget_min_weekly) ? 0.22 : 0.05,
        features: preferences.features?.length ? 0.20 : 0.05,
        amenities: preferences.amenities?.length ? 0.10 : 0.03,
        transport: (preferences.transport_preference || preferences.near_locations?.length) ? 0.10 : 0.04,
        propertyType: preferences.property_type ? 0.08 : 0.03,
        bedrooms: preferences.bedrooms ? 0.08 : 0.03,
    };
    
    // Normalize weights to sum to 1
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    Object.keys(weights).forEach(k => weights[k as keyof typeof weights] /= totalWeight);

    const breakdown = {
        location: { score: 0, weight: weights.location, reason: '' },
        budget: { score: 0, weight: weights.budget, reason: '' },
        features: { score: 0, weight: weights.features, matched: [] as string[], missing: [] as string[], reason: '' },
        amenities: { score: 0, weight: weights.amenities, matched: [] as string[], available: [] as string[], reason: '' },
        transport: { score: 0, weight: weights.transport, reason: '' },
        propertyType: { score: 0, weight: weights.propertyType, reason: '' },
        bedrooms: { score: 0, weight: weights.bedrooms, reason: '' },
        bonus: { score: 0, reasons: [] as string[] },
        overall: ''
    };

    let weightedScore = 0;

    // ═══════════════════════════════════════════════════════════════
    // 1. LOCATION SCORING (Granular distance-based)
    // ═══════════════════════════════════════════════════════════════
    const propertySuburb = property.suburb?.toLowerCase().trim() || '';
    
    if (preferences.specific_suburbs && preferences.specific_suburbs.length > 0) {
        const requestedSuburbs = preferences.specific_suburbs.map(s => s.toLowerCase().trim());
        
        // Exact suburb match
        if (requestedSuburbs.some(rs => propertySuburb.includes(rs) || rs.includes(propertySuburb))) {
            breakdown.location.score = 100;
            breakdown.location.reason = `✓ ${property.suburb}`;
        } else {
            // Distance-based scoring with granular steps
            const propertyCoords = property.latitude && property.longitude 
                ? { lat: property.latitude, lng: property.longitude }
                : SUBURB_COORDS[propertySuburb];
            
            if (propertyCoords) {
                let minDistance = Infinity;
                let closestSuburb = requestedSuburbs[0];
                
                for (const suburb of requestedSuburbs) {
                    const targetCoords = SUBURB_COORDS[suburb];
                    if (targetCoords) {
                        const dist = haversineDistance(
                            propertyCoords.lat, propertyCoords.lng,
                            targetCoords.lat, targetCoords.lng
                        );
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestSuburb = suburb;
                        }
                    }
                }
                
                // Granular distance scoring
                if (minDistance < 1) {
                    breakdown.location.score = 95;
                    breakdown.location.reason = `${minDistance.toFixed(1)}km from ${closestSuburb}`;
                } else if (minDistance < 2) {
                    breakdown.location.score = 88;
                    breakdown.location.reason = `${minDistance.toFixed(1)}km from ${closestSuburb}`;
                } else if (minDistance < 3) {
                    breakdown.location.score = 78;
                    breakdown.location.reason = `${minDistance.toFixed(1)}km from ${closestSuburb}`;
                } else if (minDistance < 5) {
                    breakdown.location.score = 65;
                    breakdown.location.reason = `${minDistance.toFixed(1)}km from ${closestSuburb}`;
                } else if (minDistance < 8) {
                    breakdown.location.score = 50;
                    breakdown.location.reason = `${minDistance.toFixed(1)}km away`;
                } else if (minDistance < 15) {
                    breakdown.location.score = 30;
                    breakdown.location.reason = `${minDistance.toFixed(0)}km away`;
                } else {
                    breakdown.location.score = 10;
                    breakdown.location.reason = `Different area`;
                }
            } else {
                breakdown.location.score = 25;
                breakdown.location.reason = 'Unknown location';
            }
        }
    } else if (preferences.location_type) {
        const locationType = preferences.location_type.toLowerCase();
        const suburbType = SUBURB_COORDS[propertySuburb]?.type || '';
        
        if (locationType === 'beach') {
            if (BEACH_SUBURBS.includes(propertySuburb)) {
                breakdown.location.score = 100;
                breakdown.location.reason = `Beach suburb ✓`;
            } else if (suburbType === 'harbour') {
                breakdown.location.score = 70;
                breakdown.location.reason = `Harbour (not beach)`;
            } else {
                breakdown.location.score = 20;
                breakdown.location.reason = `Not beach area`;
            }
        } else if (locationType === 'city' || locationType === 'inner city') {
            if (CITY_SUBURBS.includes(propertySuburb)) {
                breakdown.location.score = 100;
                breakdown.location.reason = `City location ✓`;
            } else if (suburbType === 'inner') {
                breakdown.location.score = 75;
                breakdown.location.reason = `Inner suburb`;
            } else {
                breakdown.location.score = 30;
                breakdown.location.reason = `Not city`;
            }
        } else {
            breakdown.location.score = 60;
            breakdown.location.reason = property.suburb;
        }
    } else {
        breakdown.location.score = 50;
        breakdown.location.reason = 'Any location';
    }
    
    weightedScore += breakdown.location.score * weights.location;

    // ═══════════════════════════════════════════════════════════════
    // 2. BUDGET SCORING (Precise percentage-based)
    // ═══════════════════════════════════════════════════════════════
    const rent = property.rent_weekly;
    const hasMaxBudget = preferences.budget_weekly !== undefined;
    const hasMinBudget = preferences.budget_min_weekly !== undefined;
    
    if (hasMaxBudget && hasMinBudget) {
        const minBudget = preferences.budget_min_weekly!;
        const maxBudget = preferences.budget_weekly!;
        const midpoint = (minBudget + maxBudget) / 2;
        
        if (rent >= minBudget && rent <= maxBudget) {
            // Closer to midpoint = higher score
            const distFromMid = Math.abs(rent - midpoint);
            const range = (maxBudget - minBudget) / 2;
            const closeness = 1 - (distFromMid / range);
            breakdown.budget.score = Math.round(85 + closeness * 15);
            breakdown.budget.reason = `$${rent}/wk ✓`;
        } else if (rent < minBudget) {
            const underPercent = ((minBudget - rent) / minBudget) * 100;
            breakdown.budget.score = Math.max(20, Math.round(70 - underPercent));
            breakdown.budget.reason = `$${rent}/wk (below range)`;
        } else {
            const overPercent = ((rent - maxBudget) / maxBudget) * 100;
            breakdown.budget.score = Math.max(10, Math.round(60 - overPercent * 2));
            breakdown.budget.reason = `$${rent}/wk (above range)`;
        }
    } else if (hasMinBudget) {
        const minBudget = preferences.budget_min_weekly!;
        
        if (rent >= minBudget) {
            // Higher rent = slightly higher score for luxury seekers
            const overPercent = ((rent - minBudget) / minBudget) * 100;
            if (overPercent < 20) {
                breakdown.budget.score = 95;
            } else if (overPercent < 50) {
                breakdown.budget.score = 100;
            } else {
                breakdown.budget.score = 90; // Very expensive
            }
            breakdown.budget.reason = `$${rent}/wk ✓`;
        } else {
            const underPercent = ((minBudget - rent) / minBudget) * 100;
            if (underPercent <= 5) {
                breakdown.budget.score = 80;
                breakdown.budget.reason = `$${rent}/wk (close)`;
            } else if (underPercent <= 15) {
                breakdown.budget.score = 55;
                breakdown.budget.reason = `$${rent}/wk (under min)`;
            } else {
                breakdown.budget.score = 25;
                breakdown.budget.reason = `$${rent}/wk (too low)`;
            }
        }
    } else if (hasMaxBudget) {
        const budget = preferences.budget_weekly!;
        
        if (rent <= budget) {
            const savingsPercent = ((budget - rent) / budget) * 100;
            
            if (savingsPercent > 30) {
                breakdown.budget.score = 100;
                breakdown.budget.reason = `$${budget - rent}/wk savings!`;
            } else if (savingsPercent > 15) {
                breakdown.budget.score = 95;
                breakdown.budget.reason = `$${budget - rent}/wk under`;
            } else if (savingsPercent > 5) {
                breakdown.budget.score = 88;
                breakdown.budget.reason = `Within budget`;
            } else {
                breakdown.budget.score = 82;
                breakdown.budget.reason = `At budget limit`;
            }
        } else {
            const overPercent = ((rent - budget) / budget) * 100;
            
            if (overPercent <= 3) {
                breakdown.budget.score = 72;
                breakdown.budget.reason = `$${rent - budget}/wk over`;
            } else if (overPercent <= 8) {
                breakdown.budget.score = 55;
                breakdown.budget.reason = `$${rent - budget}/wk over`;
            } else if (overPercent <= 15) {
                breakdown.budget.score = 35;
                breakdown.budget.reason = `Over budget`;
            } else {
                breakdown.budget.score = 15;
                breakdown.budget.reason = `Way over budget`;
            }
        }
    } else {
        breakdown.budget.score = 70;
        breakdown.budget.reason = 'Any price';
    }
    
    weightedScore += breakdown.budget.score * weights.budget;

    // ═══════════════════════════════════════════════════════════════
    // 3. FEATURES SCORING (Weighted by importance)
    // ═══════════════════════════════════════════════════════════════
    if (preferences.features && preferences.features.length > 0) {
        const requestedFeatures = preferences.features.map(f => f.toLowerCase());
        const propertyFeatures = (property.features || []).map(f => f.toLowerCase());
        const propertyAmenities = (property.amenities || []).map(a => a.toLowerCase());
        const allFeatures = [...propertyFeatures, ...propertyAmenities].join(' ');
        
        const hasParking = (property.car_spaces && property.car_spaces > 0) || 
                          allFeatures.includes('parking') || allFeatures.includes('garage') || allFeatures.includes('car');
        
        // Feature importance weights
        const featureWeights: Record<string, number> = {
            'pool': 1.5,
            'gym': 1.3,
            'parking': 1.4,
            'pet friendly': 1.5,
            'balcony': 1.2,
            'air conditioning': 1.1,
            'dishwasher': 1.0,
            'internal laundry': 1.3,
            'laundry': 1.2,
            'furnished': 1.2,
            'ocean views': 1.5,
            'harbour views': 1.4,
        };
        
        let totalFeatureWeight = 0;
        let matchedWeight = 0;
        
        for (const feature of requestedFeatures) {
            const weight = featureWeights[feature] || 1.0;
            totalFeatureWeight += weight;
            
            let hasFeature = false;
            
            if (feature === 'parking' || feature === 'car space' || feature === 'garage') {
                hasFeature = hasParking;
            } else if (feature.includes('pet')) {
                hasFeature = property.pet_friendly === true || allFeatures.includes('pet');
            } else if (feature === 'furnished') {
                hasFeature = property.furnished === true || allFeatures.includes('furnished');
            } else if (feature === 'pool') {
                hasFeature = allFeatures.includes('pool');
            } else if (feature === 'gym') {
                hasFeature = allFeatures.includes('gym') || allFeatures.includes('fitness');
            } else if (feature.includes('laundry')) {
                hasFeature = allFeatures.includes('laundry');
            } else if (feature === 'balcony') {
                hasFeature = allFeatures.includes('balcony') || allFeatures.includes('terrace');
            } else if (feature.includes('air') || feature === 'ac') {
                hasFeature = allFeatures.includes('air') || allFeatures.includes('a/c');
            } else if (feature.includes('ocean') || feature.includes('sea')) {
                hasFeature = allFeatures.includes('ocean') || allFeatures.includes('sea') || allFeatures.includes('beach');
            } else {
                hasFeature = allFeatures.includes(feature);
            }
            
            if (hasFeature) {
                breakdown.features.matched.push(feature);
                matchedWeight += weight;
            } else {
                breakdown.features.missing.push(feature);
            }
        }
        
        breakdown.features.score = Math.round((matchedWeight / totalFeatureWeight) * 100);
        
        if (breakdown.features.matched.length === requestedFeatures.length) {
            breakdown.features.reason = `All ${requestedFeatures.length} features ✓`;
        } else if (breakdown.features.matched.length > 0) {
            breakdown.features.reason = `${breakdown.features.matched.length}/${requestedFeatures.length} features`;
        } else {
            breakdown.features.reason = `No matching features`;
        }
    } else {
        breakdown.features.score = 75;
        breakdown.features.reason = 'No specific features';
    }
    
    weightedScore += breakdown.features.score * weights.features;

    // ═══════════════════════════════════════════════════════════════
    // 4. AMENITIES SCORING (Building-level amenities)
    // ═══════════════════════════════════════════════════════════════
    const propertyAmenities = (property.amenities || []).map(a => a.toLowerCase());
    const allPropertyText = [...(property.features || []), ...(property.amenities || []), property.description || '']
        .join(' ').toLowerCase();
    
    // Extract available amenities from property
    const amenityKeywords = {
        'concierge': ['concierge', '24 hour', '24/7', 'doorman'],
        'rooftop': ['rooftop', 'roof terrace', 'roof deck'],
        'bbq': ['bbq', 'barbecue', 'barbeque'],
        'sauna': ['sauna', 'steam room'],
        'security': ['security', 'intercom', 'secure', 'cctv'],
        'garden': ['garden', 'courtyard', 'landscaped'],
        'storage': ['storage', 'lock-up', 'cage'],
    };
    
    for (const [amenity, keywords] of Object.entries(amenityKeywords)) {
        if (keywords.some(kw => allPropertyText.includes(kw))) {
            breakdown.amenities.available.push(amenity);
        }
    }
    
    if (preferences.amenities && preferences.amenities.length > 0) {
        const requestedAmenities = preferences.amenities.map(a => a.toLowerCase());
        
        for (const amenity of requestedAmenities) {
            const hasAmenity = breakdown.amenities.available.some(a => 
                a.includes(amenity) || amenity.includes(a)
            ) || allPropertyText.includes(amenity);
            
            if (hasAmenity) {
                breakdown.amenities.matched.push(amenity);
            }
        }
        
        const matchRatio = breakdown.amenities.matched.length / requestedAmenities.length;
        breakdown.amenities.score = Math.round(matchRatio * 100);
        breakdown.amenities.reason = breakdown.amenities.matched.length > 0 
            ? `${breakdown.amenities.matched.join(', ')} ✓`
            : 'No requested amenities';
    } else {
        // No specific amenities requested - give bonus for having good amenities
        breakdown.amenities.score = Math.min(90, 60 + breakdown.amenities.available.length * 10);
        breakdown.amenities.reason = breakdown.amenities.available.length > 0 
            ? `Has ${breakdown.amenities.available.slice(0, 2).join(', ')}`
            : 'Standard amenities';
    }
    
    weightedScore += breakdown.amenities.score * weights.amenities;

    // ═══════════════════════════════════════════════════════════════
    // 5. TRANSPORT & PROXIMITY SCORING
    // ═══════════════════════════════════════════════════════════════
    const propertyCoords = property.latitude && property.longitude 
        ? { lat: property.latitude, lng: property.longitude }
        : SUBURB_COORDS[propertySuburb];
    
    if (preferences.transport_preference || preferences.near_locations?.length) {
        let transportScore = 50; // Base score
        let transportReasons: string[] = [];
        
        // Check transport preference
        if (preferences.transport_preference) {
            const transportType = preferences.transport_preference.toLowerCase();
            const connectedSuburbs = WELL_CONNECTED_SUBURBS[transportType] || [];
            
            if (connectedSuburbs.includes(propertySuburb)) {
                transportScore = 95;
                transportReasons.push(`${transportType} nearby`);
            } else if (allPropertyText.includes(transportType) || allPropertyText.includes('transport') || allPropertyText.includes('station')) {
                transportScore = 80;
                transportReasons.push('Good transport');
            }
        }
        
        // Check proximity to specific locations
        if (preferences.near_locations?.length && propertyCoords) {
            for (const location of preferences.near_locations) {
                const locLower = location.toLowerCase();
                const hubCoords = TRANSPORT_HUBS[locLower] || SUBURB_COORDS[locLower];
                
                if (hubCoords) {
                    const dist = haversineDistance(
                        propertyCoords.lat, propertyCoords.lng,
                        hubCoords.lat, hubCoords.lng
                    );
                    
                    if (dist < 2) {
                        transportScore = Math.max(transportScore, 95);
                        transportReasons.push(`${dist.toFixed(1)}km to ${location}`);
                    } else if (dist < 5) {
                        transportScore = Math.max(transportScore, 75);
                        transportReasons.push(`${dist.toFixed(1)}km to ${location}`);
                    } else if (dist < 10) {
                        transportScore = Math.max(transportScore, 55);
                    }
                }
            }
        }
        
        breakdown.transport.score = transportScore;
        breakdown.transport.reason = transportReasons.length > 0 
            ? transportReasons[0] 
            : 'Transport access varies';
    } else {
        // No transport preference - give neutral score
        breakdown.transport.score = 70;
        breakdown.transport.reason = 'Standard access';
    }
    
    weightedScore += breakdown.transport.score * weights.transport;

    // ═══════════════════════════════════════════════════════════════
    // 6. PROPERTY TYPE SCORING
    // ═══════════════════════════════════════════════════════════════
    if (preferences.property_type && preferences.property_type.toLowerCase() !== 'any') {
        const requested = preferences.property_type.toLowerCase();
        const actual = property.property_type?.toLowerCase() || '';
        
        if (actual.includes(requested) || requested.includes(actual)) {
            breakdown.propertyType.score = 100;
            breakdown.propertyType.reason = `${property.property_type} ✓`;
        } else if (
            (requested === 'apartment' && (actual.includes('unit') || actual.includes('flat'))) ||
            (requested === 'house' && actual.includes('townhouse'))
        ) {
            breakdown.propertyType.score = 75;
            breakdown.propertyType.reason = `${property.property_type} (similar)`;
        } else {
            breakdown.propertyType.score = 35;
            breakdown.propertyType.reason = `${property.property_type}`;
        }
    } else {
        breakdown.propertyType.score = 80;
        breakdown.propertyType.reason = 'Any type';
    }
    
    weightedScore += breakdown.propertyType.score * weights.propertyType;

    // ═══════════════════════════════════════════════════════════════
    // 5. BEDROOMS SCORING
    // ═══════════════════════════════════════════════════════════════
    if (preferences.bedrooms !== undefined) {
        const requested = preferences.bedrooms;
        const actual = property.bedrooms || 0;
        
        if (actual === requested) {
            breakdown.bedrooms.score = 100;
            breakdown.bedrooms.reason = `${actual}BR ✓`;
        } else if (actual === requested + 1) {
            breakdown.bedrooms.score = 85;
            breakdown.bedrooms.reason = `${actual}BR (+1)`;
        } else if (actual === requested - 1 && actual > 0) {
            breakdown.bedrooms.score = 70;
            breakdown.bedrooms.reason = `${actual}BR (-1)`;
        } else if (Math.abs(actual - requested) === 2) {
            breakdown.bedrooms.score = 45;
            breakdown.bedrooms.reason = `${actual}BR`;
        } else {
            breakdown.bedrooms.score = 20;
            breakdown.bedrooms.reason = `${actual}BR`;
        }
    } else {
        breakdown.bedrooms.score = 75;
        breakdown.bedrooms.reason = 'Any size';
    }
    
    weightedScore += breakdown.bedrooms.score * weights.bedrooms;

    // ═══════════════════════════════════════════════════════════════
    // 8. BONUS POINTS (for exceptional matches)
    // ═══════════════════════════════════════════════════════════════
    let bonusPoints = 0;
    
    // Perfect location + budget combo
    if (breakdown.location.score >= 95 && breakdown.budget.score >= 90) {
        bonusPoints += 3;
        breakdown.bonus.reasons.push('Prime location within budget');
    }
    
    // All features matched
    if (breakdown.features.matched.length > 0 && breakdown.features.missing.length === 0) {
        bonusPoints += 2;
        breakdown.bonus.reasons.push('All features');
    }
    
    // Pet friendly when requested
    if (preferences.pet_friendly && property.pet_friendly) {
        bonusPoints += 2;
        breakdown.bonus.reasons.push('Pet friendly ✓');
    }
    
    // Modern/luxury preference match
    if (preferences.style_preference === 'modern' && property.building_age === 'NEW') {
        bonusPoints += 2;
        breakdown.bonus.reasons.push('New build');
    }
    
    breakdown.bonus.score = bonusPoints;

    // ═══════════════════════════════════════════════════════════════
    // FINAL SCORE CALCULATION
    // ═══════════════════════════════════════════════════════════════
    let finalScore = Math.round(weightedScore + bonusPoints);
    
    // Ensure score is between 1-99 (never 0 or 100 unless perfect)
    finalScore = Math.max(15, Math.min(98, finalScore));
    
    // Only allow 99% if truly exceptional
    if (breakdown.location.score === 100 && 
        breakdown.budget.score >= 95 && 
        breakdown.features.score >= 90 &&
        breakdown.propertyType.score >= 90) {
        finalScore = 99;
    }

    // Generate concise summary
    const summaryParts = [];
    if (breakdown.location.score >= 90) summaryParts.push(breakdown.location.reason);
    if (breakdown.budget.score >= 85) summaryParts.push(breakdown.budget.reason);
    if (breakdown.features.matched.length > 0) summaryParts.push(breakdown.features.reason);
    if (breakdown.bonus.reasons.length > 0) summaryParts.push(breakdown.bonus.reasons[0]);
    
    breakdown.overall = summaryParts.slice(0, 3).join(' • ') || `${property.suburb} • $${rent}/wk`;

    console.log(`[Match] ${property.suburb}: ${finalScore}% - ${breakdown.overall}`);

    return {
        score: finalScore,
        breakdown
    };
}
