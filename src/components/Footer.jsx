import React from 'react';
import { useContact } from '../App';

const Footer = () => {
    const { openContact } = useContact();

    return (
        <footer className="bg-carbon border-t border-white/10 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-2">
                        <a href="#" className="text-4xl font-display font-bold text-white tracking-tighter mb-6 block">
                            nuu<span className="text-signal">.</span>
                        </a>
                        <p className="text-steel max-w-sm font-mono text-sm">
                            THE RENTAL OPERATING SYSTEM.<br />
                            VERSION 2.0.4<br />
                            SYDNEY / MELBOURNE / BRISBANE
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-mono text-sm font-bold mb-6 uppercase tracking-wider">Index</h4>
                        <ul className="space-y-4 text-steel font-mono text-sm">
                            <li>
                                <a 
                                    href="#intelligence" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('intelligence')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="hover:text-white transition-colors"
                                >
                                    [ SEARCH ]
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#os" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('os')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="hover:text-white transition-colors"
                                >
                                    [ PROTOCOL ]
                                </a>
                            </li>
                            <li>
                                <button 
                                    onClick={openContact}
                                    className="hover:text-white transition-colors"
                                >
                                    [ CONTACT ]
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-mono text-sm font-bold mb-6 uppercase tracking-wider">Network</h4>
                        <ul className="space-y-4 text-steel font-mono text-sm">
                            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">INSTAGRAM</a></li>
                            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TWITTER</a></li>
                            <li>
                                <a 
                                    href="mailto:hello@nuu.agency" 
                                    className="hover:text-white transition-colors"
                                >
                                    EMAIL
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-steel text-xs font-mono uppercase">
                    <p>&copy; {new Date().getFullYear()} NUU SYSTEMS.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">PRIVACY_POLICY.TXT</a>
                        <a href="#" className="hover:text-white transition-colors">TERMS_OF_USE.TXT</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
