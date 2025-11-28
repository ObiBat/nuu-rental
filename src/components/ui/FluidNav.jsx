import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import MagneticButton from './MagneticButton';

const FluidNav = () => {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    });

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4 bg-carbon/90 backdrop-blur-md border-b border-white/10' : 'py-8 bg-transparent'
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <a href="#" className="text-3xl font-display font-bold text-white tracking-tighter">
                    nuu<span className="text-signal">.</span>
                </a>

                <div className="hidden md:flex items-center space-x-8">
                    {['OS', 'Intelligence', 'Manifesto'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-mono uppercase tracking-widest text-steel hover:text-white transition-colors">
                            {item}
                        </a>
                    ))}
                    <MagneticButton className="px-6 py-2 bg-white text-carbon font-bold font-mono uppercase tracking-wider rounded-none hover:bg-signal hover:text-white transition-colors">
                        Initialize
                    </MagneticButton>
                </div>
            </div>
        </motion.nav>
    );
};

export default FluidNav;
