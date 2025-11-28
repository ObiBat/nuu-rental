import type { Property, UserPreference } from './supabase';

export interface ScoreBreakdown {
    price: number;
    location: number;
    features: number;
    amenities: number;
    modernity: number;
}

export interface MatchScore {
    totalScore: number;
    breakdown: ScoreBreakdown;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Count matching items between two arrays
 */
function countMatches(arr1: string[], arr2: string[]): number {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) {
        return 0;
    }
    return arr1.filter(item => arr2.includes(item)).length;
}

/**
 * Calculate modernity score based on building age preference
 */
function calculateModernityScore(
    propertyAge: string | undefined,
    preferredAge: string | undefined
): number {
    if (!preferredAge || preferredAge === 'ANY') return 100;
    if (!propertyAge) return 50; // Unknown age gets neutral score

    const ageMap: Record<string, number> = {
        'NEW (<2Y)': 4,
        'MODERN (<5Y)': 3,
        'RENOVATED': 2,
        'CLASSIC': 1
    };

    const propertyScore = ageMap[propertyAge] || 2;
    const preferredScore = ageMap[preferredAge] || 2;

    // Perfect match = 100, one step away = 75, two steps = 50, etc.
    const diff = Math.abs(propertyScore - preferredScore);
    return Math.max(0, 100 - (diff * 25));
}

/**
 * Main matching algorithm: Calculate match score for a property against user preferences
 */
export function calculateMatchScore(
    property: Property,
    preferences: UserPreference
): MatchScore {
    const scores: ScoreBreakdown = {
        price: 0,
        location: 0,
        features: 0,
        amenities: 0,
        modernity: 0
    };

    const weights = preferences.weights || {
        price: 0.25,
        location: 0.30,
        features: 0.20,
        amenities: 0.15,
        modernity: 0.10
    };

    // 1. Price Score (inverse: lower price = higher score, within budget)
    if (preferences.price_max) {
        const priceRange = (preferences.price_max - (preferences.price_min || 0));
        if (priceRange > 0) {
            if (property.rent_weekly <= preferences.price_max) {
                // Property is within budget
                const priceDiff = preferences.price_max - property.rent_weekly;
                scores.price = (priceDiff / priceRange) * 100;

                // Bonus for being well below budget if user prefers that
                if (preferences.budget_smart?.showBelowBudget && priceDiff > priceRange * 0.2) {
                    scores.price = Math.min(100, scores.price * 1.2);
                }
            } else {
                // Over budget - penalize but don't eliminate if negotiable
                if (property.is_negotiable && preferences.budget_smart?.includeNegotiable) {
                    scores.price = 30; // Reduced score but still viable
                } else {
                    scores.price = 0;
                }
            }
        }
    } else {
        scores.price = 100; // No budget constraint
    }

    // 2. Location Score (distance-based)
    if (preferences.location_center && property.latitude && property.longitude) {
        const distance = calculateDistance(
            property.latitude,
            property.longitude,
            preferences.location_center.lat,
            preferences.location_center.lng
        );

        const radius = preferences.location_radius || 10;
        if (distance <= radius) {
            // Within radius: score decreases linearly with distance
            scores.location = Math.max(0, 100 - (distance / radius) * 100);
        } else {
            scores.location = 0; // Outside radius
        }
    } else {
        scores.location = 50; // No location data - neutral score
    }

    // 3. Features Score (% of desired features present)
    if (preferences.features && preferences.features.length > 0) {
        const featureMatches = countMatches(property.features, preferences.features);
        scores.features = (featureMatches / preferences.features.length) * 100;
    } else {
        scores.features = 100; // No feature requirements
    }

    // 4. Amenities Score (% of desired amenities nearby)
    if (preferences.amenities && preferences.amenities.length > 0) {
        const amenityMatches = countMatches(property.amenities, preferences.amenities);
        scores.amenities = (amenityMatches / preferences.amenities.length) * 100;
    } else {
        scores.amenities = 100; // No amenity requirements
    }

    // 5. Modernity Score
    scores.modernity = calculateModernityScore(property.building_age, preferences.modernity);

    // Calculate weighted total
    const totalScore =
        scores.price * weights.price +
        scores.location * weights.location +
        scores.features * weights.features +
        scores.amenities * weights.amenities +
        scores.modernity * weights.modernity;

    return {
        totalScore: Math.round(totalScore * 10) / 10, // Round to 1 decimal
        breakdown: {
            price: Math.round(scores.price * 10) / 10,
            location: Math.round(scores.location * 10) / 10,
            features: Math.round(scores.features * 10) / 10,
            amenities: Math.round(scores.amenities * 10) / 10,
            modernity: Math.round(scores.modernity * 10) / 10
        }
    };
}

/**
 * Filter properties based on hard requirements
 */
export function filterProperties(
    properties: Property[],
    preferences: UserPreference
): Property[] {
    return properties.filter(property => {
        // Price range filter
        if (preferences.price_min && property.rent_weekly < preferences.price_min) {
            return false;
        }
        if (preferences.price_max && property.rent_weekly > preferences.price_max) {
            // Allow if negotiable and user accepts negotiable
            if (!(property.is_negotiable && preferences.budget_smart?.includeNegotiable)) {
                return false;
            }
        }

        // Property type filter
        if (preferences.property_types && preferences.property_types.length > 0) {
            if (!preferences.property_types.includes(property.property_type)) {
                return false;
            }
        }

        // Location filter (if location specified)
        if (preferences.location_center && property.latitude && property.longitude) {
            const distance = calculateDistance(
                property.latitude,
                property.longitude,
                preferences.location_center.lat,
                preferences.location_center.lng
            );

            if (distance > (preferences.location_radius || 10)) {
                return false;
            }
        }

        return true;
    });
}
