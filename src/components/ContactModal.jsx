import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContactModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        try {
            // Send to our API endpoint
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: 'general',
                    message: ''
                });
                // Auto close after 3 seconds
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                }, 3000);
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const subjects = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'property', label: 'Property Search' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'support', label: 'Support' },
        { value: 'feedback', label: 'Feedback' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-carbon border border-white/10 z-[101] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <p className="text-signal font-mono text-xs tracking-widest uppercase mb-1">[ CONTACT ]</p>
                                <h2 className="text-2xl font-display font-bold text-white">Get in Touch</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center text-steel hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-12 text-center"
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-signal/20 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-signal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-white mb-2">Message Sent!</h3>
                                    <p className="text-steel">We'll get back to you within 24 hours.</p>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Name & Email Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-steel font-mono text-xs uppercase tracking-wider mb-2">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-steel/50 focus:border-signal focus:outline-none transition-colors font-mono text-sm"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-steel font-mono text-xs uppercase tracking-wider mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-steel/50 focus:border-signal focus:outline-none transition-colors font-mono text-sm"
                                                placeholder="you@email.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-steel font-mono text-xs uppercase tracking-wider mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-steel/50 focus:border-signal focus:outline-none transition-colors font-mono text-sm"
                                            placeholder="+61 400 000 000"
                                        />
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-steel font-mono text-xs uppercase tracking-wider mb-2">
                                            Subject
                                        </label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white focus:border-signal focus:outline-none transition-colors font-mono text-sm appearance-none cursor-pointer"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                                        >
                                            {subjects.map(s => (
                                                <option key={s.value} value={s.value} className="bg-carbon">
                                                    {s.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-steel font-mono text-xs uppercase tracking-wider mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={4}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-steel/50 focus:border-signal focus:outline-none transition-colors font-mono text-sm resize-none"
                                            placeholder="Tell us how we can help..."
                                        />
                                    </div>

                                    {/* Error Message */}
                                    {status === 'error' && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-red-400 font-mono text-sm"
                                        >
                                            Failed to send. Please try again or email us directly.
                                        </motion.p>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="w-full py-4 bg-signal text-white font-bold font-mono uppercase tracking-wider hover:bg-white hover:text-carbon transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {status === 'sending' ? (
                                            <>
                                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </button>
                                </>
                            )}
                        </form>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ContactModal;


