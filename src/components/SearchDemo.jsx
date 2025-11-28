import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, DollarSign, Loader2, Terminal, Sliders, ChevronDown } from 'lucide-react';
import ScrollSection from './ui/ScrollSection';

const SearchDemo = () => {
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Comprehensive filter state
    const [filters, setFilters] = useState({
        propertyTypes: [],
        priceMin: '',
        priceMax: '900',
        locationRadius: 10,
        features: [],
        amenities: [],
        utilities: [],
        modernity: 'ANY',
        budgetSmart: {
            includeNegotiable: false,
            showBelowBudget: true,
            includeUtilitiesInBudget: false
        }
    });

    const handleFilterChange = (key, value) => {
        if (key === 'reset') {
            setFilters({
                propertyTypes: [],
                priceMin: '',
                priceMax: '900',
                locationRadius: 10,
                features: [],
                amenities: [],
                utilities: [],
                modernity: 'ANY',
                budgetSmart: {
                    includeNegotiable: false,
                    showBelowBudget: true,
                    includeUtilitiesInBudget: false
                }
            });
        } else {
            setFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    const toggleArrayItem = (array, item) => {
        return array.includes(item)
            ? array.filter(i => i !== item)
            : [...array, item];
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setIsSearching(true);
        setShowResults(false);
        // In production, this would send filters to the backend/API
        console.log('Search with filters:', filters);
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

    // Filter options
    const propertyTypes = ['STUDIO', '1 BED', '2 BED', '3 BED', '4+ BED', 'HOUSE'];
    const features = ['PET FRIENDLY', 'FURNISHED', 'PARKING', 'BALCONY', 'GYM', 'POOL', 'DISHWASHER', 'AIR CON'];
    const amenities = ['TRAIN STATION', 'SHOPPING', 'SCHOOLS', 'PARKS', 'CAFES', 'HOSPITAL'];
    const utilities = ['GAS', 'NBN READY', 'SOLAR', 'WATER INCLUDED'];
    const modernityOptions = ['NEW (<2Y)', 'MODERN (<5Y)', 'RENOVATED', 'CLASSIC', 'ANY'];

    return (
        <section id="intelligence" className="py-32 bg-carbon relative border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6">
                <ScrollSection className="mb-20 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8">
                    <div>
                        <h2 className="text-sm font-mono text-signal uppercase tracking-widest mb-4">[ INTELLIGENCE ]</h2>
                        <h3 className="text-4xl md:text-6xl font-display font-bold text-white max-w-2xl">
                            ALGORITHMIC<br /><span className="text-steel">PRECISION.</span>
                        </h3>
                    </div>
                    <p className="text-steel max-w-sm text-sm font-mono mt-8 md:mt-0">
                        // SYSTEM STATUS: ONLINE<br />
                        // DATABASE: CONNECTED<br />
                        // LATENCY: 12MS
                    </p>
                </ScrollSection>

                <div className="max-w-6xl mx-auto">
                    {/* Search Bar */}
                    <div className="industrial-panel p-1 mb-6 relative z-10">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-1 bg-carbon p-1">
                            <div className="md:col-span-5 relative group bg-white/5 hover:bg-white/10 transition-colors">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-steel" />
                                <input
                                    type="text"
                                    placeholder="TARGET SECTOR"
                                    className="w-full bg-transparent py-6 pl-12 pr-4 text-white placeholder-steel focus:outline-none font-mono text-sm uppercase"
                                    defaultValue="SYDNEY / CBD"
                                />
                            </div>
                            <div className="md:col-span-4 relative group bg-white/5 hover:bg-white/10 transition-colors">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-steel" />
                                <input
                                    type="number"
                                    placeholder="MAX CREDITS"
                                    value={filters.priceMax}
                                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                    className="w-full bg-transparent py-6 pl-12 pr-4 text-white placeholder-steel focus:outline-none font-mono text-sm uppercase"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="md:col-span-3 bg-white hover:bg-signal hover:text-white text-carbon font-bold font-mono uppercase tracking-wider py-6 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : <><Terminal className="w-4 h-4" /> EXECUTE</>}
                            </button>
                        </form>
                    </div>

                    {/* Advanced Filters Toggle */}
                    <div className="mb-16">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full md:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-mono text-sm uppercase tracking-wider transition-colors flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-2">
                                <Sliders className="w-4 h-4" />
                                <span>ADVANCED FILTERS</span>
                                {(filters.propertyTypes.length > 0 || filters.features.length > 0) && (
                                    <span className="bg-signal text-white px-2 py-0.5 text-xs rounded-full">
                                        {filters.propertyTypes.length + filters.features.length + filters.amenities.length + filters.utilities.length}
                                    </span>
                                )}
                            </div>
                            <motion.div
                                animate={{ rotate: showFilters ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </motion.div>
                        </button>

                        {/* Filter Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-4 industrial-panel p-6 space-y-8">
                                        {/* Property Type */}
                                        <div>
                                            <label className="block text-xs font-mono text-signal uppercase tracking-widest mb-3">
                                                [ PROPERTY TYPE ]
                                            </label>
                                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                                {propertyTypes.map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => handleFilterChange('propertyTypes', toggleArrayItem(filters.propertyTypes, type))}
                                                        className={`py-2 px-3 text-xs font-mono uppercase tracking-wider transition-all ${filters.propertyTypes.includes(type)
                                                                ? 'bg-signal text-white'
                                                                : 'bg-white/5 text-steel hover:bg-white/10 hover:text-white'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price Range */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-mono text-signal uppercase tracking-widest mb-3">
                                                    [ MIN PRICE/WEEK ]
                                                </label>
                                                <input
                                                    type="number"
                                                    value={filters.priceMin}
                                                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full bg-white/5 border border-white/20 py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-signal transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-mono text-signal uppercase tracking-widest mb-3">
                                                    [ MAX PRICE/WEEK ]
                                                </label>
                                                <input
                                                    type="number"
                                                    value={filters.priceMax}
                                                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                                    placeholder="2000"
                                                    className="w-full bg-white/5 border border-white/20 py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-signal transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Location Radius */}
                                        <div>
                                            <label className="block text-xs font-mono text-signal uppercase tracking-widest mb-3">
                                                [ LOCATION RADIUS (KM) ]
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="50"
                                                value={filters.locationRadius}
                                                onChange={(e) => handleFilterChange('locationRadius', e.target.value)}
                                                className="w-full h-1 bg-white/20 appearance-none cursor-pointer accent-signal"
                                            />
                                            <div className="flex justify-between mt-2">
                                                <span className="text-xs font-mono text-steel">1 KM</span>
                                                <span className="text-xs font-mono text-white">{filters.locationRadius} KM</span>
                                                <span className="text-xs font-mono text-steel">50 KM</span>
                                            </div>
                                        </div>

                                        {/* Property Features */}
                                        <div>
                                            <label className="block text-xs font-mono text-signal uppercase tracking-widest mb-3">
                                                [ PROPERTY FEATURES ]
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {features.map(feature => (
                                                    <button
                                                        key={feature}
                                                        type="button"
                                                        onClick={() => handleFilterChange('features', toggleArrayItem(filters.features, feature))}
                                                        className={`py-2 px-3 text-xs font-mono uppercase tracking-wider transition-all ${filters.features.includes(feature)
                                                                ? 'bg-signal text-white'
                                                                : 'bg-white/5 text-steel hover:bg-white/10 hover:text-white'
                                                            }`}
                                                    >
                                                        {feature}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Public Amenities */}
                                        <div>
                                            <label className="block text-xs font-mono text-signal uppercase tracking-widest mb-3">
                                                [ NEARBY AMENITIES ]
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {amenities.map(amenity => (
                                                    <button
                                                        key={amenity}
                                                        type="button"
                                                        onClick={() => handleFilterChange('amenities', toggleArrayItem(filters.amenities, amenity))}
                                                        className={`py-2 px-3 text-xs font-mono uppercase tracking-wider transition-all ${filters.amenities.includes(amenity)
                                                                ? 'bg-signal text-white'
                                                                : 'bg-white/5 text-steel hover:bg-white/10 hover:text-white'
                                                            }`}
                                                    >
                                                        {amenity}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Utilities */}
                                        <div>
                                            <label className="block text-xs font-mono text-signal uppercase tracking-widest mb-3">
                                                [ UTILITIES ]
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {utilities.map(utility => (
                                                    <button
                                                        key={utility}
                                                        type="button"
                                                        onClick={() => handleFilterChange('utilities', toggleArrayItem(filters.utilities, utility))}
                                                        className={`py-2 px-3 text-xs font-mono uppercase tracking-wider transition-all ${filters.utilities.includes(utility)
                                                                ? 'bg-signal text-white'
                                                                : 'bg-white/5 text-steel hover:bg-white/10 hover:text-white'
                                                            }`}
                                                    >
                                                        {utility}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Modernity */}
                                        <div>
                                            <label className="block text-xs font-mono text-signal uppercase tracking-widest mb-3">
                                                [ BUILDING AGE ]
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                                {modernityOptions.map(option => (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => handleFilterChange('modernity', option)}
                                                        className={`py-2 px-3 text-xs font-mono uppercase tracking-wider transition-all ${filters.modernity === option
                                                                ? 'bg-signal text-white'
                                                                : 'bg-white/5 text-steel hover:bg-white/10 hover:text-white'
                                                            }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Budget Smart Options */}
                                        <div>
                                            <label className="block text-xs font-mono text-signal uppercase tracking-widest mb-3">
                                                [ SMART BUDGET ]
                                            </label>
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.budgetSmart.includeNegotiable}
                                                        onChange={(e) => handleFilterChange('budgetSmart', { ...filters.budgetSmart, includeNegotiable: e.target.checked })}
                                                        className="w-4 h-4 accent-signal"
                                                    />
                                                    <span className="text-sm font-mono text-steel group-hover:text-white transition-colors">
                                                        INCLUDE NEGOTIABLE PRICES
                                                    </span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.budgetSmart.showBelowBudget}
                                                        onChange={(e) => handleFilterChange('budgetSmart', { ...filters.budgetSmart, showBelowBudget: e.target.checked })}
                                                        className="w-4 h-4 accent-signal"
                                                    />
                                                    <span className="text-sm font-mono text-steel group-hover:text-white transition-colors">
                                                        PRIORITIZE BELOW BUDGET
                                                    </span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.budgetSmart.includeUtilitiesInBudget}
                                                        onChange={(e) => handleFilterChange('budgetSmart', { ...filters.budgetSmart, includeUtilitiesInBudget: e.target.checked })}
                                                        className="w-4 h-4 accent-signal"
                                                    />
                                                    <span className="text-sm font-mono text-steel group-hover:text-white transition-colors">
                                                        INCLUDE UTILITIES IN BUDGET CALC
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-4 pt-4 border-t border-white/10">
                                            <button
                                                type="button"
                                                onClick={() => handleFilterChange('reset', null)}
                                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-steel hover:text-white font-mono text-sm uppercase tracking-wider transition-colors"
                                            >
                                                RESET ALL
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Results Area */}
                    <div className="min-h-[500px] relative">
                        <AnimatePresence mode='wait'>
                            {!isSearching && !showResults && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-32 text-steel font-mono text-sm"
                                >
                                    <p className="mb-4">[ WAITING FOR INPUT ]</p>
                                    <div className="w-px h-16 bg-white/20" />
                                </motion.div>
                            )}

                            {isSearching && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-32"
                                >
                                    <div className="font-mono text-signal text-sm animate-pulse mb-4">
                                        &gt; PROCESSING DATA STREAM...
                                    </div>
                                    <div className="w-64 h-1 bg-white/10 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-signal"
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '200%' }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {showResults && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                                >
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
                                                        <span className="text-xs text-steel font-mono uppercase">Probability</span>
                                                        <span className="text-2xl font-display font-bold text-signal">{result.matchScore}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SearchDemo;
