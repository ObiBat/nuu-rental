import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, RefreshCw, Zap, MapPin, Home, DollarSign } from 'lucide-react';
import ScrollSection from './ui/ScrollSection';

// Use relative URL in production, localhost in development
const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

// Custom NUU Avatar Component
const NuuAvatar = ({ isAnimating = false, size = 'default' }) => {
    const sizeClasses = {
        small: 'w-8 h-8',
        default: 'w-12 h-12',
        large: 'w-16 h-16'
    };
    
    return (
        <motion.div 
            className={`${sizeClasses[size]} relative shrink-0`}
            animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
        >
            {/* Outer glow ring */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-signal via-orange-500 to-red-500 ${isAnimating ? 'animate-pulse' : ''}`} />
            
            {/* Inner container */}
            <div className="absolute inset-[2px] rounded-[10px] bg-carbon flex items-center justify-center overflow-hidden">
                {/* NUU Logo Mark */}
                <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
                    <text 
                        x="50" 
                        y="68" 
                        fontFamily="system-ui, -apple-system, sans-serif" 
                        fontSize="42" 
                        fontWeight="700" 
                        fill="#ffffff" 
                        textAnchor="middle"
                        letterSpacing="-2"
                    >nuu</text>
                    <circle cx="88" cy="62" r="6" fill="#FF4D00">
                        {isAnimating && (
                            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
                        )}
                    </circle>
                </svg>
            </div>
            
            {/* Pulse effect when animating */}
            {isAnimating && (
                <motion.div 
                    className="absolute inset-0 rounded-xl bg-signal/30"
                    animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
            )}
        </motion.div>
    );
};

// Glassmorphic chat bubble
const ChatBubble = ({ type, children }) => {
    if (type === 'bot') {
        return (
            <div className="relative max-w-[85%] md:max-w-[75%]">
                {/* Gradient border effect */}
                <div className="absolute -inset-[1px] rounded-2xl rounded-tl-sm bg-gradient-to-br from-signal/50 via-white/10 to-transparent" />
                <div className="relative bg-carbon/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl rounded-tl-sm border border-white/5">
                    {children}
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-[85%] md:max-w-[75%] bg-gradient-to-br from-signal to-orange-600 p-4 md:p-5 rounded-2xl rounded-tr-sm shadow-lg shadow-signal/20">
            {children}
        </div>
    );
};

// Quick reply pill with icon
const QuickReplyPill = ({ icon: Icon, text, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-white/5 to-white/[0.02] hover:from-signal/20 hover:to-signal/5 border border-white/10 hover:border-signal/40 rounded-full transition-all duration-300"
    >
        {Icon && <Icon size={14} className="text-signal group-hover:text-white transition-colors" />}
        <span className="text-sm text-white/80 group-hover:text-white font-mono transition-colors">{text}</span>
    </motion.button>
);

const AiSearch = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Hey! I'm NUU, your AI property concierge. Tell me where you'd like to live and your budget — I'll find your perfect match in seconds.",
        }
    ]);
    
    // Initial quick replies with icons
    const initialQuickReplies = [
        { icon: MapPin, text: "Near the beach" },
        { icon: Home, text: "Inner city Sydney" },
        { icon: MapPin, text: "Quiet suburbs" },
        { icon: DollarSign, text: "Under $700/wk" }
    ];
    
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(() => `session_${Date.now()}`);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [quickReplies, setQuickReplies] = useState(initialQuickReplies);
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

    const handleQuickReply = (text) => {
        setInputValue(text);
        setQuickReplies([]);
        setTimeout(() => {
            const form = document.querySelector('#ai-chat-form');
            if (form) form.requestSubmit();
        }, 100);
    };

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
                setQuickReplies(data.quick_replies.map(text => ({ text })));
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
                            highlights: [],
                            amenities: [],
                            basics: []
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
        setQuickReplies(initialQuickReplies);
    };

    return (
        <section id="ai-search" className="py-24 md:py-32 bg-carbon relative min-h-screen flex flex-col overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `linear-gradient(rgba(255,77,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,77,0,0.3) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }} />
                
                {/* Gradient orbs */}
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-signal/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex-1 flex flex-col relative z-10">
                <ScrollSection className="mb-8 md:mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 mb-6"
                    >
                        <NuuAvatar size="small" />
                        <span className="text-sm font-mono text-signal uppercase tracking-widest">AI CONCIERGE</span>
                    </motion.div>
                    
                    <h3 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 md:mb-6 tracking-tight">
                        TELL ME WHAT<br />
                        <span className="bg-gradient-to-r from-steel via-white/60 to-steel bg-clip-text text-transparent">YOU DESIRE.</span>
                    </h3>
                    <p className="text-steel font-mono text-xs md:text-sm max-w-xl mx-auto flex items-center justify-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5">
                            <Zap size={12} className="text-signal" />
                            Powered by GPT-4o
                        </span>
                        <span className="text-white/20">•</span>
                        <span>Natural language</span>
                        <span className="text-white/20">•</span>
                        <span>Instant matching</span>
                    </p>
                </ScrollSection>

                <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
                    {/* Chat Window - Glassmorphic Design */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        {/* Outer glow */}
                        <div className="absolute -inset-1 bg-gradient-to-b from-signal/20 via-transparent to-transparent rounded-3xl blur-xl opacity-50" />
                        
                        {/* Main container */}
                        <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden flex flex-col min-h-[450px] md:min-h-[500px] max-h-[600px]">
                            
                            {/* Header bar */}
                            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-black/20">
                                <div className="flex items-center gap-3">
                                    <NuuAvatar size="small" isAnimating={isTyping || isSearching} />
                                    <div>
                                        <h4 className="text-white font-bold text-sm">NUU</h4>
                                        <p className="text-[10px] text-signal font-mono uppercase tracking-wider">
                                            {isTyping ? 'Thinking...' : isSearching ? 'Searching...' : 'Online'}
                                        </p>
                                    </div>
                                </div>
                                
                                {messages.length > 1 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleReset}
                                        className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                        title="Start over"
                                    >
                                        <RefreshCw size={18} />
                                    </motion.button>
                                )}
                            </div>
                            
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 md:space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: 'spring', damping: 20 }}
                                        className={`flex gap-3 md:gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        {msg.type === 'bot' ? (
                                            <NuuAvatar size="default" />
                                        ) : (
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                                                <User size={18} className="text-white/70" />
                                            </div>
                                        )}
                                        
                                        <ChatBubble type={msg.type}>
                                            <p className={`text-sm md:text-base leading-relaxed ${
                                                msg.type === 'bot' ? 'text-white/90 font-light' : 'text-white font-medium'
                                            }`}>
                                                {msg.text}
                                            </p>
                                        </ChatBubble>
                                    </motion.div>
                                ))}
                                
                                {/* Typing indicator */}
                                {isTyping && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3 md:gap-4"
                                    >
                                        <NuuAvatar size="default" isAnimating />
                                        <ChatBubble type="bot">
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-1.5">
                                                    {[0, 1, 2].map(i => (
                                                        <motion.span
                                                            key={i}
                                                            className="w-2 h-2 bg-signal rounded-full"
                                                            animate={{ y: [0, -6, 0] }}
                                                            transition={{ 
                                                                repeat: Infinity, 
                                                                duration: 0.8, 
                                                                delay: i * 0.15,
                                                                ease: 'easeInOut'
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-steel text-xs font-mono">Analyzing...</span>
                                            </div>
                                        </ChatBubble>
                                    </motion.div>
                                )}

                                {/* Searching indicator */}
                                {isSearching && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3 md:gap-4"
                                    >
                                        <NuuAvatar size="default" isAnimating />
                                        <ChatBubble type="bot">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-signal border-t-transparent rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                />
                                                <span className="text-signal text-sm font-mono">Finding your perfect matches...</span>
                                            </div>
                                        </ChatBubble>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Replies */}
                            <AnimatePresence>
                                {quickReplies.length > 0 && !isTyping && !isSearching && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="px-4 md:px-6 py-3 border-t border-white/5 bg-black/20"
                                    >
                                        <div className="flex flex-wrap gap-2">
                                            {quickReplies.map((reply, idx) => (
                                                <QuickReplyPill
                                                    key={idx}
                                                    icon={reply.icon}
                                                    text={reply.text}
                                                    onClick={() => handleQuickReply(reply.text)}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Input Area */}
                            <div className="p-3 md:p-4 border-t border-white/10 bg-black/30">
                                <form id="ai-chat-form" onSubmit={handleSendMessage} className="relative flex gap-2 md:gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Describe your dream home..."
                                            disabled={isTyping || isSearching}
                                            className="w-full bg-white/5 hover:bg-white/[0.07] border border-white/10 focus:border-signal/50 rounded-xl py-3 md:py-4 px-4 md:px-5 text-white placeholder-white/30 focus:outline-none transition-all font-mono text-sm md:text-base"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={!inputValue.trim() || isTyping || isSearching}
                                        className="px-4 md:px-5 bg-gradient-to-r from-signal to-orange-500 hover:from-signal hover:to-signal text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-signal/20 disabled:shadow-none"
                                    >
                                        <Send size={18} />
                                    </motion.button>
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    {/* Results Section */}
                    <AnimatePresence>
                        {showResults && results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-12 md:mt-16"
                            >
                                <div className="text-center mb-8 md:mb-12">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-signal to-orange-500 mb-6 shadow-lg shadow-signal/30"
                                    >
                                        <Home size={28} className="text-white" />
                                    </motion.div>
                                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                                        YOUR PERFECT MATCHES
                                    </h3>
                                    <p className="text-steel font-mono text-xs md:text-sm">
                                        AI-curated based on our conversation
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                    {results.map((result, index) => (
                                        <motion.div
                                            key={result.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.15 + 0.3 }}
                                            className="group relative"
                                        >
                                            {/* Card glow on hover */}
                                            <div className="absolute -inset-1 bg-gradient-to-r from-signal/0 via-signal/20 to-signal/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                                            
                                            <div className="relative bg-carbon border border-white/10 group-hover:border-signal/50 transition-all duration-300 rounded-xl overflow-hidden">
                                                <div className="h-44 md:h-48 overflow-hidden relative">
                                                    {/* Match Score Badge */}
                                                    <div className={`absolute top-3 right-3 z-10 text-white text-xs font-bold px-3 py-1.5 rounded-lg font-mono backdrop-blur-sm ${
                                                        result.matchScore >= 85 ? 'bg-green-500/90' :
                                                        result.matchScore >= 70 ? 'bg-signal/90' :
                                                        result.matchScore >= 55 ? 'bg-amber-500/90' : 'bg-white/30'
                                                    }`}>
                                                        {result.matchScore}%
                                                    </div>
                                                    
                                                    {/* Highlight badges on image */}
                                                    {result.highlights.length > 0 && (
                                                        <div className="absolute bottom-3 left-3 z-10 flex gap-1.5 flex-wrap max-w-[80%]">
                                                            {result.highlights.slice(0, 2).map(h => (
                                                                <span key={h} className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase border border-white/10">
                                                                    {h}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    <img
                                                        src={result.image}
                                                        alt={result.address}
                                                        className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                                                    />
                                                </div>
                                                
                                                <div className="p-4 md:p-5">
                                                    {/* Header */}
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="text-white font-bold font-mono text-sm md:text-base">{result.suburb}</h3>
                                                            <p className="text-steel text-xs font-mono mt-0.5">
                                                                {result.bedrooms}BR • {result.bathrooms}BA {result.parking > 0 && `• ${result.parking}P`}
                                                            </p>
                                                        </div>
                                                        <span className="text-signal font-mono font-bold text-base md:text-lg">{result.price}<span className="text-xs text-steel">/wk</span></span>
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
                                                        {result.amenities.length > 0 && (
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {result.amenities.map(a => (
                                                                    <span key={a} className="text-[10px] bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
                                                                        ★ {a}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
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
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                
                                <div className="text-center mt-10 md:mt-12">
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleReset}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white font-mono text-sm transition-all"
                                    >
                                        <RefreshCw size={16} />
                                        Start New Search
                                    </motion.button>
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
