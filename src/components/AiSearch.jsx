import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, RefreshCw } from 'lucide-react';
import ScrollSection from './ui/ScrollSection';

// Use relative URL in production, localhost in development
const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

const AiSearch = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Hi! I'm your AI property concierge. Tell me where you'd like to live and your budget, and I'll find your perfect match.",
        }
    ]);
    
    // Initial quick replies
    const initialQuickReplies = ["Near the beach", "Inner city Sydney", "Quiet suburbs", "Under $700/wk"];
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(() => `session_${Date.now()}`);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [quickReplies, setQuickReplies] = useState(["Near the beach", "Inner city Sydney", "Quiet suburbs", "Under $700/wk"]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    };

    useEffect(() => {
        if (messages.length > 1) {
            scrollToBottom();
        }
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userMessage = inputValue.trim();
        
        // Add user message
        const newMessages = [...messages, { id: Date.now(), type: 'user', text: userMessage }];
        setMessages(newMessages);
        setInputValue('');
        setIsTyping(true);

        try {
            // Call AI backend
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: userMessage
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();
            
            // Add AI response
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                text: data.message
            }]);

            // Set quick replies if available
            if (data.quick_replies && data.quick_replies.length > 0) {
                setQuickReplies(data.quick_replies);
            } else {
                setQuickReplies([]);
            }

                            // If we have search results, show them
                            if (data.ready_to_search && data.search_results?.length > 0) {
                                setIsSearching(true);
                                
                                // Small delay for dramatic effect
                                setTimeout(() => {
                                    const mappedResults = data.search_results.map(p => {
                                        // Categorize features for display
                                        const allFeatures = [...(p.features || []), ...(p.amenities || [])];
                                        const featureCategories = {
                                            highlights: [], // Key selling points
                                            amenities: [],  // Building amenities
                                            basics: []      // Standard features
                                        };
                                        
                                        const highlightKeywords = ['pool', 'gym', 'ocean', 'harbour', 'view', 'parking', 'garage', 'pet'];
                                        const amenityKeywords = ['concierge', 'rooftop', 'bbq', 'sauna', 'security', 'intercom'];
                                        
                                        allFeatures.forEach(f => {
                                            const fLower = f.toLowerCase();
                                            if (highlightKeywords.some(k => fLower.includes(k))) {
                                                featureCategories.highlights.push(f);
                                            } else if (amenityKeywords.some(k => fLower.includes(k))) {
                                                featureCategories.amenities.push(f);
                                            } else {
                                                featureCategories.basics.push(f);
                                            }
                                        });
                                        
                                        return {
                                            id: p.id,
                                            address: `${p.street_number || ''} ${p.street_name || ''} / ${p.suburb}`.toUpperCase(),
                                            suburb: p.suburb,
                                            price: `$${p.rent_weekly}`,
                                            type: p.property_type,
                                            bedrooms: p.bedrooms,
                                            bathrooms: p.bathrooms,
                                            parking: p.car_spaces,
                                            matchScore: Math.round(p.matchScore),
                                            highlights: featureCategories.highlights.slice(0, 3),
                                            amenities: featureCategories.amenities.slice(0, 2),
                                            basics: featureCategories.basics.slice(0, 3),
                                            image: p.images?.[0] || "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
                                            ai_explanation: p.ai_explanation,
                                            matchBreakdown: p.matchBreakdown
                                        };
                                    });

                                    setResults(mappedResults);
                                    setShowResults(true);
                                    setIsSearching(false);
                                }, 1500);
                            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                text: "I'm having trouble connecting right now. Please try again in a moment."
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleReset = async () => {
        try {
            await fetch(`${API_URL}/api/chat/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            });
        } catch (e) {
            console.error('Reset failed:', e);
        }

        setMessages([{
            id: Date.now(),
            type: 'bot',
            text: "Let's start fresh! What kind of home are you looking for?"
        }]);
        setShowResults(false);
        setResults([]);
        setQuickReplies(["Near the beach", "Inner city", "Quiet suburbs", "Under $700/wk"]);
    };

    return (
        <section id="ai-search" className="py-32 bg-carbon relative border-t border-white/10 min-h-screen flex flex-col">
            <div className="max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col">
                <ScrollSection className="mb-12 text-center">
                    <h2 className="text-sm font-mono text-signal uppercase tracking-widest mb-4">[ AI CONCIERGE ]</h2>
                    <h3 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                        TELL ME WHAT<br /><span className="text-steel">YOU DESIRE.</span>
                    </h3>
                    <p className="text-steel font-mono text-sm max-w-xl mx-auto">
                        Powered by GPT-4o • Understands natural language • Finds your perfect match
                    </p>
                </ScrollSection>

                <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
                    {/* Chat Window */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-[500px] max-h-[600px] relative">
                        
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/20">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        msg.type === 'bot' ? 'bg-signal text-white' : 'bg-white/10 text-white'
                                    }`}>
                                        {msg.type === 'bot' ? <Sparkles size={20} /> : <User size={20} />}
                                    </div>
                                    
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm md:text-base font-mono leading-relaxed ${
                                        msg.type === 'bot' 
                                            ? 'bg-white/5 text-steel rounded-tl-none border border-white/10' 
                                            : 'bg-signal text-white rounded-tr-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isTyping && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-signal text-white flex items-center justify-center shrink-0">
                                        <Sparkles size={20} className="animate-pulse" />
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-signal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-signal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-signal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        <span className="ml-2 text-steel text-xs font-mono">Thinking...</span>
                                    </div>
                                </motion.div>
                            )}

                            {isSearching && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-signal text-white flex items-center justify-center shrink-0">
                                        <Sparkles size={20} className="animate-spin" />
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                                        <span className="text-signal text-sm font-mono">Searching properties with AI matching...</span>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        {quickReplies.length > 0 && !isTyping && !isSearching && (
                            <div className="px-4 py-3 border-t border-white/5 bg-carbon/30">
                                <div className="flex flex-wrap gap-2">
                                    {quickReplies.map((reply, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setInputValue(reply);
                                                setQuickReplies([]);
                                                // Auto-submit after a brief delay
                                                setTimeout(() => {
                                                    const form = document.querySelector('form');
                                                    if (form) form.requestSubmit();
                                                }, 100);
                                            }}
                                            className="px-4 py-2 bg-signal/20 hover:bg-signal/40 border border-signal/30 rounded-full text-sm text-white font-mono transition-all hover:scale-105"
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-carbon/50 backdrop-blur-sm">
                            <form onSubmit={handleSendMessage} className="relative flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Tell me about your ideal home..."
                                    disabled={isTyping || isSearching}
                                    className="flex-1 bg-black/20 border border-white/20 rounded-xl py-4 pl-6 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-signal transition-colors font-mono"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping || isSearching}
                                    className="p-4 bg-signal text-white rounded-xl hover:bg-white hover:text-carbon transition-all disabled:opacity-50 disabled:hover:bg-signal disabled:hover:text-white"
                                >
                                    <Send size={20} />
                                </button>
                                {messages.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="p-4 bg-white/10 text-white/60 rounded-xl hover:bg-white/20 hover:text-white transition-all"
                                        title="Start over"
                                    >
                                        <RefreshCw size={20} />
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Results Section */}
                    <AnimatePresence>
                        {showResults && results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-12"
                            >
                                <div className="text-center mb-12">
                                    <h3 className="text-3xl font-display font-bold text-white mb-2">
                                        YOUR PERFECT MATCHES
                                    </h3>
                                    <p className="text-steel font-mono text-sm">
                                        // AI-curated based on our conversation
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {results.map((result, index) => (
                                        <motion.div
                                            key={result.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.15 + 0.3 }}
                                            className="group bg-carbon border border-white/10 hover:border-signal transition-all duration-300 rounded-lg overflow-hidden"
                                        >
                                            <div className="h-48 overflow-hidden relative">
                                                {/* Match Score Badge */}
                                                <div className={`absolute top-4 right-4 z-10 text-white text-xs font-bold px-3 py-1.5 rounded-full font-mono ${
                                                    result.matchScore >= 85 ? 'bg-green-500' :
                                                    result.matchScore >= 70 ? 'bg-signal' :
                                                    result.matchScore >= 55 ? 'bg-amber-500' : 'bg-white/30'
                                                }`}>
                                                    {result.matchScore}% MATCH
                                                </div>
                                                
                                                {/* Highlight badges on image */}
                                                {result.highlights.length > 0 && (
                                                    <div className="absolute bottom-4 left-4 z-10 flex gap-1.5 flex-wrap max-w-[80%]">
                                                        {result.highlights.slice(0, 2).map(h => (
                                                            <span key={h} className="bg-signal/90 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                                                                {h}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                <img
                                                    src={result.image}
                                                    alt={result.address}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                            
                                            <div className="p-5">
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-white font-bold font-mono text-base">{result.suburb}</h3>
                                                        <p className="text-steel text-xs font-mono mt-0.5">
                                                            {result.bedrooms}BR • {result.bathrooms}BA {result.parking > 0 && `• ${result.parking}P`} • {result.type}
                                                        </p>
                                                    </div>
                                                    <span className="text-signal font-mono font-bold text-lg">{result.price}<span className="text-xs text-steel">/wk</span></span>
                                                </div>
                                                
                                                {/* AI Explanation */}
                                                {result.ai_explanation && (
                                                    <div className="bg-gradient-to-r from-signal/10 to-transparent border-l-2 border-signal rounded-r-lg p-3 mb-4">
                                                        <p className="text-xs text-white/80 leading-relaxed">
                                                            {result.ai_explanation}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Feature Tags - Categorized */}
                                                <div className="space-y-2">
                                                    {/* Building Amenities */}
                                                    {result.amenities.length > 0 && (
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {result.amenities.map(a => (
                                                                <span key={a} className="text-[10px] bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
                                                                    ★ {a}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Basic Features */}
                                                    {result.basics.length > 0 && (
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {result.basics.map(f => (
                                                                <span key={f} className="text-[10px] bg-white/5 border border-white/10 text-white/50 px-2 py-1 rounded">
                                                                    {f}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                
                                <div className="text-center mt-12">
                                    <button 
                                        onClick={handleReset}
                                        className="text-steel hover:text-white underline font-mono text-sm"
                                    >
                                        Start New Search
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default AiSearch;
