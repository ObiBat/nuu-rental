import React from 'react';
import FluidNav from './components/ui/FluidNav';
import Hero from './components/Hero';
import AiSearch from './components/AiSearch';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import { useEffect } from 'react';
import Lenis from 'lenis';

function App() {
  return (
    <div className="min-h-screen bg-carbon text-paper selection:bg-signal selection:text-white">
      <FluidNav />

      <main>
        <section id="os">
          <Hero />
        </section>

        <section id="intelligence">
          <AiSearch />
        </section>

        <Features />
        <Testimonials />

        {/* CTA Section */}
        <section id="manifesto" className="py-32 bg-signal relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tighter">
              INITIALISE<br />YOUR MOVE.
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto font-mono">
              Join the network. Experience the future of relocation.
            </p>
            <button className="px-12 py-6 bg-carbon text-white font-bold font-mono uppercase tracking-wider text-lg hover:bg-white hover:text-carbon transition-colors">
              [ JOIN WAITLIST ]
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
