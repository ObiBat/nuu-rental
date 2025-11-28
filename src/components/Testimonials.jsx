import React from 'react';
import ScrollSection from './ui/ScrollSection';

const testimonials = [
    {
        content: "NUU bypassed the traditional rental friction. My application was processed and approved in 48 hours. Efficiency at its finest.",
        author: "BATBOLD B.",
        role: "ENGINEER / SYDNEY",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        content: "The algorithm found a property that wasn't even on my radar. It perfectly matched my family's logistics requirements.",
        author: "SARNAI T.",
        role: "ARCHITECT / MELBOURNE",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        content: "A necessary upgrade for the community. NUU provides the infrastructure we've been missing.",
        author: "TUYA M.",
        role: "DIRECTOR / BRISBANE",
        image: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
];

const Testimonials = () => {
    return (
        <section id="manifesto" className="py-32 bg-concrete text-carbon relative">
            <div className="max-w-7xl mx-auto px-6">
                <ScrollSection className="mb-20">
                    <h2 className="text-sm font-mono text-signal uppercase tracking-widest mb-4">[ USER LOGS ]</h2>
                    <h3 className="text-4xl md:text-5xl font-display font-bold text-carbon max-w-2xl">
                        COMMUNITY<br /><span className="text-steel">VERIFICATION.</span>
                    </h3>
                </ScrollSection>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <ScrollSection key={index} className="h-full">
                            <div className="h-full border border-carbon/10 p-8 hover:border-signal transition-colors bg-white">
                                <div className="text-6xl text-carbon/5 font-display mb-4">“</div>
                                <p className="text-lg text-carbon mb-8 font-medium leading-relaxed">
                                    {testimonial.content}
                                </p>
                                <div className="flex items-center mt-auto pt-6 border-t border-carbon/5">
                                    <div className="w-10 h-10 grayscale">
                                        <img src={testimonial.image} alt={testimonial.author} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-carbon font-bold font-mono text-sm tracking-wide">{testimonial.author}</h4>
                                        <p className="text-steel text-xs font-mono">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
