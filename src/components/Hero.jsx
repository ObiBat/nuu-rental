import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import TextReveal from './ui/TextReveal';
import MagneticButton from './ui/MagneticButton';
import ArchitecturalScene from './3d/ArchitecturalScene';

const Hero = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <section ref={containerRef} className="relative h-[300vh] bg-carbon">
            {/* Sticky Container for 3D Scene and Content */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">

                {/* 3D Background - Pass scroll progress */}
                <ArchitecturalScene scrollProgress={scrollYProgress} />

                {/* Content Overlay */}
                <div className="absolute inset-0 z-20 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pointer-events-none">
                    <div className="lg:col-span-7 pointer-events-auto">
                        <div className="mb-8 overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="flex items-center gap-3 text-signal font-mono text-sm tracking-[0.2em] uppercase"
                            >
                                <span className="w-2 h-2 bg-signal rounded-full animate-pulse shadow-[0_0_10px_#ff4d00]" />
                                nuu.agency
                            </motion.div>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tighter mb-8 leading-[0.9]">
                            <TextReveal text="THE RENTAL" />
                            <span className="block text-steel"><TextReveal text="OPERATING" delay={0.2} /></span>
                            <TextReveal text="SYSTEM." delay={0.4} />
                        </h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="max-w-lg text-base md:text-lg text-steel mb-10 font-light leading-relaxed border-l border-white/20 pl-6 ml-1"
                        >
                            Don't just move. Upgrade. NUU connects you to the housing market with algorithmic precision and industrial efficiency.
                        </motion.p>

                        <div className="flex flex-col sm:flex-row items-start gap-4 ml-1">
                            <MagneticButton
                                onClick={() => document.getElementById('intelligence')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-signal text-white font-bold font-mono uppercase tracking-wider rounded-none text-sm hover:bg-white hover:text-carbon transition-all signal-glow min-w-[160px] flex justify-center"
                            >
                                Start Sequence
                            </MagneticButton>
                            <MagneticButton
                                onClick={() => document.getElementById('manifesto')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold font-mono uppercase tracking-wider rounded-none text-sm hover:bg-white/5 transition-all min-w-[160px] flex justify-center"
                            >
                                Read Manifesto
                            </MagneticButton>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-12 right-12 backdrop-blur-md bg-white/5 border border-white/10 p-8 flex items-end justify-end pointer-events-none hidden md:block z-20">
                    <div className="text-right">
                        <p className="text-steel font-mono text-xs tracking-widest mb-1">COORDINATES</p>
                        <p className="text-white font-mono text-sm">33.8688° S, 151.2093° E</p>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20"
                >
                    <span className="text-steel font-mono text-[10px] uppercase tracking-widest">Scroll to Assemble</span>
                    <div className="w-px h-12 bg-gradient-to-b from-signal to-transparent" />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
