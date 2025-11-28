import React from 'react';
import { motion } from 'framer-motion';
import TextReveal from './ui/TextReveal';
import MagneticButton from './ui/MagneticButton';
import ScrollSection from './ui/ScrollSection';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-carbon grid-bg">
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <ScrollSection>
                    <div className="flex flex-col items-start">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="mb-8 flex items-center space-x-4"
                        >
                            <div className="h-px w-12 bg-signal" />
                            <span className="text-sm font-mono text-signal uppercase tracking-widest">System Online v2.0</span>
                        </motion.div>

                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-white tracking-tighter mb-8 leading-[0.9]">
                            <TextReveal text="THE RENTAL" />
                            <span className="block text-steel"><TextReveal text="OPERATING" delay={0.2} /></span>
                            <TextReveal text="SYSTEM." delay={0.4} />
                        </h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="max-w-xl text-lg md:text-xl text-steel mb-12 font-light leading-relaxed border-l border-white/20 pl-6"
                        >
                            Don't just move. Upgrade. NUU connects you to the housing market with algorithmic precision and industrial efficiency.
                        </motion.p>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <MagneticButton className="px-10 py-5 bg-signal text-white font-bold font-mono uppercase tracking-wider rounded-none text-lg hover:bg-white hover:text-carbon transition-all signal-glow">
                                Start Sequence
                            </MagneticButton>
                            <MagneticButton className="px-10 py-5 bg-transparent border border-white/20 text-white font-bold font-mono uppercase tracking-wider rounded-none text-lg hover:bg-white/5 transition-all">
                                Read Manifesto
                            </MagneticButton>
                        </div>
                    </div>
                </ScrollSection>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 right-0 w-1/3 h-1/3 border-t border-l border-white/10 p-8 flex items-end justify-end">
                <div className="text-right">
                    <p className="text-steel font-mono text-xs">COORDINATES</p>
                    <p className="text-white font-mono text-sm">33.8688° S, 151.2093° E</p>
                </div>
            </div>
        </section>
    );
};

export default Hero;
