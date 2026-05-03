import React from 'react';

function App() {
  return (
    <div className="min-h-screen text-white font-sans selection:bg-dripBlue bg-[radial-gradient(circle_at_50%_50%,_#1a1a2e_0%,_#0f0f12_100%)] overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center max-w-5xl mx-auto">
        <h1 className="text-2xl font-black tracking-tighter text-dripBlue">DRIPCHECK</h1>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col items-center text-center pt-16 px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-br from-white to-[#888] bg-clip-text text-transparent">
          Elevate your daily fit.
        </h1>
        <p className="max-w-2xl text-gray-400 text-lg md:text-xl mb-10 leading-relaxed">
          A full-stack mobile solution to manage your digital closet, plan outfits, and keep your style fresh every single day.
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <a 
            href="https://github.com/Ecila-01/DripCheck_MOBILE/releases/download/v1.0.0/Dripcheck.v1.0.0.apk" 
            className="bg-dripBlue px-8 py-4 rounded-xl font-bold text-white hover:-translate-y-1 transition-transform duration-200 shadow-[0_4px_14px_rgba(74,144,226,0.39)] text-center inline-block"
          >
            Download APK
          </a>
          <a href="https://github.com/Ecila-01/DripCheck_MOBILE" target="_blank" rel="noreferrer" className="bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-bold text-white hover:bg-white/10 hover:-translate-y-1 transition-all duration-200 text-center">
            View Source Code
          </a>
        </div>

        {/* App Preview */}
        <div className="w-full max-w-4xl h-[450px] bg-white/5 border border-white/10 rounded-[24px] flex items-center justify-center text-gray-500 italic shadow-2xl">
          [ Insert App Screenshot or Video Demo Here ]
        </div>
      </header>

      {/* Feature Grid */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 px-6 py-24 pb-32">
        <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-300">
          <h3 className="text-xl font-bold mb-3 text-dripBlue">👕 Smart Closet</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            Organize your clothes with Cloudinary-powered uploads and categorized storage for easy access.
          </p>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-300">
          <h3 className="text-xl font-bold mb-3 text-dripBlue">🚀 MERN Stack Power</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            Built with React Native, Node.js, Express, and MongoDB for a seamless, high-performance experience.
          </p>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-300">
          <h3 className="text-xl font-bold mb-3 text-dripBlue">🔒 Secure Auth</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            Industry-standard OTP verification via Resend ensuring your closet data stays private and protected.
          </p>
        </div>
      </section>

    </div>
  );
}

export default App;