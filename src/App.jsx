import React, { useState, createContext, useContext } from 'react';
import FluidNav from './components/ui/FluidNav';
import Hero from './components/Hero';
import AiSearch from './components/AiSearch';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';

// Create context for contact modal
export const ContactContext = createContext();
export const useContact = () => useContext(ContactContext);

function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const openContact = () => setIsContactOpen(true);
  const closeContact = () => setIsContactOpen(false);

  return (
    <ContactContext.Provider value={{ openContact, closeContact, isContactOpen }}>
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
                INITIALIZE<br />YOUR MOVE.
              </h2>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto font-mono">
                Join the network. Experience the future of relocation.
              </p>
              <button 
                onClick={openContact}
                className="px-12 py-6 bg-carbon text-white font-bold font-mono uppercase tracking-wider text-lg hover:bg-white hover:text-carbon transition-colors"
              >
                [ CONTACT US ]
              </button>
            </div>
          </section>
        </main>

        <Footer />
        
        {/* Global Contact Modal */}
        <ContactModal isOpen={isContactOpen} onClose={closeContact} />
      </div>
    </ContactContext.Provider>
  );
}

export default App;
