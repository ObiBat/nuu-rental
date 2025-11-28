import React from 'react';
import { ClipboardCheck, MessageCircle, Key, ShieldCheck, Zap, Globe } from 'lucide-react';
import ScrollSection from './ui/ScrollSection';

const features = [
    {
        name: 'APPLICATION PROTOCOL',
        description: 'Optimized document assembly. We ensure your data packet meets all landlord specifications for maximum acceptance probability.',
        icon: ClipboardCheck,
    },
    {
        name: 'PROXY NEGOTIATION',
        description: 'We interface with property managers on your behalf. Zero signal loss. Pure advocacy.',
        icon: MessageCircle,
    },
    {
        name: 'REMOTE INSPECTION',
        description: 'Deploy our agents to verify physical assets. Receive high-fidelity video feeds and structural reports.',
        icon: Globe,
    },
];

const Features = () => {
    return (
        <section id="services" className="py-32 bg-carbon relative border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6">
                <ScrollSection className="mb-20">
                    <h2 className="text-sm font-mono text-signal uppercase tracking-widest mb-4">[ CAPABILITIES ]</h2>
                    <h3 className="text-4xl md:text-5xl font-display font-bold text-white max-w-2xl">
                        SYSTEM<br /><span className="text-steel">ARCHITECTURE.</span>
                    </h3>
                </ScrollSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
                    {features.map((feature, index) => (
                        <ScrollSection key={feature.name} className="h-full bg-carbon p-10 hover:bg-white/5 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Zap className="w-4 h-4 text-signal" />
                            </div>

                            <div className="w-12 h-12 bg-white/5 flex items-center justify-center mb-8 text-white group-hover:text-signal transition-colors">
                                <feature.icon className="w-6 h-6" />
                            </div>

                            <h4 className="text-lg font-bold font-mono text-white mb-4 tracking-tight">{feature.name}</h4>
                            <p className="text-steel leading-relaxed text-sm font-mono">
                                {feature.description}
                            </p>
                        </ScrollSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
