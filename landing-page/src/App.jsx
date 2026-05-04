import React, { useState } from 'react';

function App() {
  const [slide, setSlide] = useState(1);
  const totalSlides = 9;

  // Dynamic URL logic for Cloudinary.
  const currentUrl = slide <= totalSlides 
    ? `https://res.cloudinary.com/dmwhbhssm/image/upload/f_auto,q_auto,pg_${slide}/dripcheck_cxycop.jpg`
    : "https://res.cloudinary.com/dmwhbhssm/video/upload/v1777810715/video_20260503_171552_edit_wwbq7o.mp4";

  return (
    <div className="min-h-screen text-white font-sans selection:bg-dripBlue bg-[radial-gradient(circle_at_50%_50%,_#1a1a2e_0%,_#0f0f12_100%)] overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="p-6 md:p-8 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="DripCheck Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
          />
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-dripBlue">
            DRIPCHECK
          </h1>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col items-center text-center pt-10 sm:pt-16 px-6 max-w-6xl mx-auto w-full">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight bg-gradient-to-br from-white to-[#888] bg-clip-text text-transparent">
          Elevate your daily fit.
        </h1>
        <p className="max-w-2xl text-gray-400 text-base sm:text-lg md:text-xl mb-10 sm:mb-12 leading-relaxed px-2">
          A full-stack mobile solution to manage your digital closet, plan outfits, and keep your style fresh every single day.
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
          <a 
            href="https://github.com/Ecila-01/DripCheck_MOBILE/releases/download/v1.0.0/Dripcheck.v1.0.0.apk" 
            className="bg-dripBlue px-8 py-4 rounded-xl font-bold text-white hover:-translate-y-1 transition-transform duration-200 shadow-[0_4px_14px_rgba(74,144,226,0.39)] text-center w-full sm:w-auto"
          >
            Download APK
          </a>
          <a 
            href="https://github.com/Ecila-01/DripCheck_MOBILE" 
            target="_blank" 
            rel="noreferrer" 
            className="bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-bold text-white hover:bg-white/10 hover:-translate-y-1 transition-all duration-200 text-center w-full sm:w-auto"
          >
            View Source Code
          </a>
        </div>

        {/* Integrated Presentation & Video Slider - Made Bigger */}
        <div className="w-full flex flex-col items-center gap-6">
          <div className="relative group" style={{ 
            width: '100%', 
            maxWidth: '520px',  // Increased from 320px to 520px
            borderRadius: '32px',  // Larger border radius
            border: '10px solid #1a1a1a',  // Thicker border
            overflow: 'hidden', 
            boxShadow: '0 25px 40px rgba(0,0,0,0.6)',  // Deeper shadow
            backgroundColor: '#000'
          }}>
            {slide <= totalSlides ? (
              <img 
                src={currentUrl} 
                alt={`Presentation Slide ${slide}`}
                className="w-full h-auto block animate-in fade-in duration-500"
              />
            ) : (
              <video 
                width="100%" 
                height="auto" 
                controls 
                muted 
                playsInline
                autoPlay
                className="block"
              >
                <source src={currentUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {/* Navigation Overlays */}
            <button 
              onClick={() => setSlide(s => Math.max(1, s - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-dripBlue p-2 rounded-full text-white transition-colors"
              aria-label="Previous Slide"
            >
              ←
            </button>
            <button 
              onClick={() => setSlide(s => Math.min(totalSlides + 1, s + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-dripBlue p-2 rounded-full text-white transition-colors"
              aria-label="Next Slide"
            >
              →
            </button>
          </div>

          {/* Indicator Label */}
          <div className="text-gray-400 font-medium">
            {slide <= totalSlides ? (
              <span className="flex items-center gap-2">
                <span className="text-dripBlue">Slide</span> {slide} / {totalSlides}
              </span>
            ) : (
              <span className="text-dripBlue font-bold tracking-widest animate-pulse">LIVE DEMO</span>
            )}
          </div>
        </div>

      </header>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-6 py-16 sm:py-24 pb-24 sm:pb-32 w-full">
        <div className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-300">
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-dripBlue">👕 Smart Closet</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            Organize your clothes with Cloudinary-powered uploads and categorized storage for easy access.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-300">
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-dripBlue">🚀 MERN Stack Power</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            Built with React Native, Node.js, Express, and MongoDB for a seamless, high-performance experience.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-300 sm:col-span-2 lg:col-span-1">
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-dripBlue">🔒 Secure Auth</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            Industry-standard OTP verification via Resend ensuring your closet data stays private and protected.
          </p>
        </div>
      </section>

    </div>
  );
}

export default App;
