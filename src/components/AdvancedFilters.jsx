import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Sliders } from 'lucide-react';

const AdvancedFilters = ({ isOpen, onToggle, filters, onFilterChange }) => {
    const propertyTypes = ['STUDIO', '1 BED', '2 BED', '3 BED', '4+ BED', 'HOUSE'];
    const features = ['PET FRIENDLY', 'FURNISHED', 'PARKING', 'BALCONY', 'GYM', 'POOL', 'DISHWASHER', 'AIR CON'];
    const amenities = ['TRAIN STATION', 'SHOPPING', 'SCHOOLS', 'PARKS', 'CAFES', 'HOSPITAL'];
    const utilities = ['GAS', 'NBN READY', 'SOLAR', 'WATER INCLUDED'];
    const modernityOptions = ['NEW (<2Y)', 'MODERN (<5Y)', 'RENOVATED', 'CLASSIC', 'ANY'];

    const toggleArrayItem = (array, item) => {
        return array.includes(item)
            ? array.filter(i => i !== item)
            : [...array, item];
    };

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="w-full md:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-mono text-sm uppercase tracking-wider transition-colors flex items-center justify-between gap-4"
            >
                <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    <span>ADVANCED FILTERS</span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-4 h-4" />
                </motion.div>
            </button>

            {/* Filter Panel */}
            <AnimatePresence>
                {isOpen && (
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
                                            onClick={() => onFilterChange('propertyTypes', toggleArrayItem(filters.propertyTypes, type))}
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
                                        onChange={(e) => onFilterChange('priceMin', e.target.value)}
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
                                        onChange={(e) => onFilterChange('priceMax', e.target.value)}
                                        placeholder="2000"
                                        className="w-full bg-white/5 border border-white/20 py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-signal transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Location Preferences */}
                            <div>
                                <label className="block text-xs font-mono text-signal uppercase tracking-widest mb-3">
                                    [ LOCATION RADIUS (KM) ]
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={filters.locationRadius}
                                    onChange={(e) => onFilterChange('locationRadius', e.target.value)}
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
                                            onClick={() => onFilterChange('features', toggleArrayItem(filters.features, feature))}
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
                                            onClick={() => onFilterChange('amenities', toggleArrayItem(filters.amenities, amenity))}
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
                                            onClick={() => onFilterChange('utilities', toggleArrayItem(filters.utilities, utility))}
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
                                            onClick={() => onFilterChange('modernity', option)}
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
                                            onChange={(e) => onFilterChange('budgetSmart', { ...filters.budgetSmart, includeNegotiable: e.target.checked })}
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
                                            onChange={(e) => onFilterChange('budgetSmart', { ...filters.budgetSmart, showBelowBudget: e.target.checked })}
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
                                            onChange={(e) => onFilterChange('budgetSmart', { ...filters.budgetSmart, includeUtilitiesInBudget: e.target.checked })}
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
                                    onClick={() => {
                                        // Reset all filters
                                        onFilterChange('reset', null);
                                    }}
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
    );
};

export default AdvancedFilters;
