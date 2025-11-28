import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, DollarSign, Home, Sparkles, ArrowRight } from 'lucide-react';
import ScrollSection from './ui/ScrollSection';

const SimpleSearch = () => {
    const [step, setStep] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Simple user inputs
    const [userInput, setUserInput] = useState({
        location: '',
        budget: '',
        propertyType: '',
        moveInDate: '',
        mustHaves: [],
        niceToHaves: []
    });

    // Quick selection options
    const propertyTypes = [
        { value: 'STUDIO', label: 'Studio', icon: '🏠' },
        { value: '1BED', label: '1 Bedroom', icon: '🛏️' },
        { value: '2BED', label: '2 Bedrooms', icon: '🏡' },
        { value: '3BED', label: '3 Bedrooms', icon: '🏘️' },
        { value: '4+BED', label: '4+ Bedrooms', icon: '🏰' }
    ];

    const mustHaveOptions = [
        { value: 'PARKING', label: 'Parking', icon: '🚗' },
        { value: 'PET FRIENDLY', label: 'Pet Friendly', icon: '🐕' },
        { value: 'FURNISHED', label: 'Furnished', icon: '🛋️' },
        { value: 'BALCONY', label: 'Balcony', icon: '🌿' },
        { value: 'GYM', label: 'Gym', icon: '💪' },
        { value: 'POOL', label: 'Pool', icon: '🏊' }
    ];

    const niceToHaveOptions = [
        { value: 'TRAIN STATION', label: 'Near Train', icon: '🚆' },
        { value: 'CAFES', label: 'Cafes Nearby', icon: '☕' },
        { value: 'PARKS', label: 'Parks', icon: '🌳' },
        { value: 'SHOPPING', label: 'Shopping', icon: '🛍️' },
        { value: 'SCHOOLS', label: 'Schools', icon: '🎓' }
    ];

    const toggleSelection = (array, value) => {
        return array.includes(value)
            ? array.filter(v => v !== value)
            : [...array, value];
    };

    const handleSearch = async () => {
        setIsSearching(true);
        setShowResults(false);

        // Transform simple inputs to backend preferences format
        const preferences = {
            property_types: userInput.propertyType ? [userInput.propertyType] : [],
            price_max: parseInt(userInput.budget) || 2000,
            price_min: 0,
            location_centre: userInput.location ? {
                suburb: userInput.location,
                lat: -33.8688, // Will be geocoded in production
                lng: 151.2093
            } : null,
            location_radius: 10,
            features: userInput.mustHaves,
            amenities: userInput.niceToHaves,
            utilities: [],
            modernity: 'ANY',
            budget_smart: {
                includeNegotiable: true,
                showBelowBudget: true,
                includeUtilitiesInBudget: false
            },
            weights: {
                price: 0.25,
                location: 0.30,
                features: 0.25,
                amenities: 0.15,
                modernity: 0.05
            }
        };

        // TODO: Call API
        console.log('Searching with preferences:', preferences);

        setTimeout(() => {
            setIsSearching(false);
            setShowResults(true);
        }, 2000);
    };

    const mockResults = [
        {
            id: 1,
            address: "UNIT 402 / SECTOR 7",
            price: "$850",
            type: "2B / 2B / 1C",
            matchScore: "99.9",
            image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
        },
        {
            id: 2,
            address: "LOFT 12 / DISTRICT 9",
            price: "$920",
            type: "1B / STUDY",
            matchScore: "96.5",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
        },
        {
            id: 3,
            address: "STUDIO 01 / ZONE 4",
            price: "$780",
            type: "STUDIO",
            matchScore: "94.2",
            image: "https://images.unsplash.com/photo-1501183638710-841dd1904471?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
        }
    ];

    return (
        <section id="intelligence" className="py-32 bg-carbon relative border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6">
                <ScrollSection className="mb-20 text-center">
                    <h2 className="text-sm font-mono text-signal uppercase tracking-widest mb-4">[ FIND YOUR PLACE ]</h2>
                    <h3 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                        TELL US WHAT<br /><span className="text-steel">YOU NEED.</span>
                    </h3>
                    <p className="text-steel max-w-2xl mx-auto text-lg font-mono">
                        // Simple questions. Smart matches. No complexity.
                    </p>
                </ScrollSection>

                <div className="max-w-4xl mx-auto">
                    {/* Step-by-step Input */}
                    <div className="space-y-8 mb-16">
                        {/* Step 1: Location */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="industrial-panel p-8"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-signal flex items-center justify-center text-white font-mono font-bold text-xl">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-display font-bold text-white mb-2">Where do you want to live?</h4>
                                    <p className="text-steel text-sm font-mono">Suburb, city, or area</p>
                                </div>
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-steel w-5 h-5" />
                                <input
                                    type="text"
                                    value={userInput.location}
                                    onChange={(e) => setUserInput({ ...userInput, location: e.target.value })}
                                    placeholder="e.g., Sydney CBD, Melbourne, Brisbane..."
                                    className="w-full bg-white/5 border border-white/20 py-4 pl-14 pr-4 text-white placeholder-steel focus:outline-none focus:border-signal transition-colors text-lg"
                                />
                            </div>
                        </motion.div>

                        {/* Step 2: Budget */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="industrial-panel p-8"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-signal flex items-center justify-center text-white font-mono font-bold text-xl">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-display font-bold text-white mb-2">What's your weekly budget?</h4>
                                    <p className="text-steel text-sm font-mono">Maximum you can spend per week</p>
                                </div>
                            </div>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-steel w-5 h-5" />
                                <input
                                    type="number"
                                    value={userInput.budget}
                                    onChange={(e) => setUserInput({ ...userInput, budget: e.target.value })}
                                    placeholder="e.g., 800"
                                    className="w-full bg-white/5 border border-white/20 py-4 pl-14 pr-4 text-white placeholder-steel focus:outline-none focus:border-signal transition-colors text-lg"
                                />
                            </div>
                            <div className="mt-4 flex gap-2 flex-wrap">
                                {[500, 700, 900, 1200, 1500].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setUserInput({ ...userInput, budget: amount.toString() })}
                                        className="px-4 py-2 bg-white/5 hover:bg-signal hover:text-white text-steel border border-white/10 font-mono text-sm transition-all"
                                    >
                                        ${amount}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Step 3: Property Type */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="industrial-panel p-8"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-signal flex items-center justify-center text-white font-mono font-bold text-xl">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-display font-bold text-white mb-2">What type of place?</h4>
                                    <p className="text-steel text-sm font-mono">Pick one that suits you</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {propertyTypes.map(type => (
                                    <button
                                        key={type.value}
                                        onClick={() => setUserInput({ ...userInput, propertyType: type.value })}
                                        className={`p-4 border transition-all ${userInput.propertyType === type.value
                                            ? 'bg-signal border-signal text-white'
                                            : 'bg-white/5 border-white/20 text-steel hover:border-signal hover:text-white'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{type.icon}</div>
                                        <div className="text-xs font-mono uppercase">{type.label}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Step 4: Must Haves */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="industrial-panel p-8"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-signal flex items-center justify-center text-white font-mono font-bold text-xl">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-display font-bold text-white mb-2">What do you NEED?</h4>
                                    <p className="text-steel text-sm font-mono">Deal-breakers only (select all that apply)</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {mustHaveOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setUserInput({
                                            ...userInput,
                                            mustHaves: toggleSelection(userInput.mustHaves, option.value)
                                        })}
                                        className={`p-4 border transition-all text-left ${userInput.mustHaves.includes(option.value)
                                            ? 'bg-signal border-signal text-white'
                                            : 'bg-white/5 border-white/20 text-steel hover:border-signal hover:text-white'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{option.icon}</div>
                                        <div className="text-sm font-mono">{option.label}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Step 5: Nice to Haves */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="industrial-panel p-8"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-white font-mono font-bold text-xl">
                                    5
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-display font-bold text-white mb-2">What would be nice?</h4>
                                    <p className="text-steel text-sm font-mono">Optional preferences (we'll prioritize these)</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {niceToHaveOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setUserInput({
                                            ...userInput,
                                            niceToHaves: toggleSelection(userInput.niceToHaves, option.value)
                                        })}
                                        className={`p-4 border transition-all text-left ${userInput.niceToHaves.includes(option.value)
                                            ? 'bg-white/10 border-white/30 text-white'
                                            : 'bg-white/5 border-white/20 text-steel hover:border-white/30 hover:text-white'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{option.icon}</div>
                                        <div className="text-sm font-mono">{option.label}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Search Button */}
                    <div className="text-center mb-16">
                        <button
                            onClick={handleSearch}
                            disabled={!userInput.location || !userInput.budget || !userInput.propertyType || isSearching}
                            className="group px-12 py-6 bg-signal hover:bg-white text-white hover:text-carbon font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSearching ? (
                                <>
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                    FINDING YOUR MATCH
                                </>
                            ) : (
                                <>
                                    FIND MY PLACE
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                        {(!userInput.location || !userInput.budget || !userInput.propertyType) && (
                            <p className="text-steel text-sm font-mono mt-4">
                                // Please complete steps 1-3 to search
                            </p>
                        )}
                    </div>

                    {/* Results */}
                    <div className="min-h-[500px] relative">
                        <AnimatePresence mode='wait'>
                            {showResults && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="text-center mb-12">
                                        <h3 className="text-3xl font-display font-bold text-white mb-2">
                                            YOUR PERFECT MATCHES
                                        </h3>
                                        <p className="text-steel font-mono text-sm">
                                            // Ranked by how well they fit your needs
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {mockResults.map((result, index) => (
                                            <motion.div
                                                key={result.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.15,
                                                    duration: 0.5,
                                                    ease: [0.16, 1, 0.3, 1]
                                                }}
                                                className="group"
                                            >
                                                <div className="bg-carbon border border-white/10 hover:border-signal transition-all duration-300 overflow-hidden">
                                                    <div className="h-64 overflow-hidden">
                                                        <img
                                                            src={result.image}
                                                            alt={result.address}
                                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                    <div className="p-6">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h3 className="text-white font-bold font-mono text-base tracking-tight">{result.address}</h3>
                                                                <p className="text-steel text-xs font-mono mt-1">{result.type}</p>
                                                            </div>
                                                            <div className="text-white font-mono text-sm border border-white/20 px-2 py-1 whitespace-nowrap">
                                                                {result.price}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                                                            <span className="text-xs text-steel font-mono uppercase">Match</span>
                                                            <span className="text-2xl font-display font-bold text-signal">{result.matchScore}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SimpleSearch;
