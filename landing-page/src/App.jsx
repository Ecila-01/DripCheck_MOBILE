import React from 'react';

function App() {
  return (
    <div className="min-h-screen text-white font-sans selection:bg-dripBlue bg-[radial-gradient(circle_at_50%_50%,_#1a1a2e_0%,_#0f0f12_100%)] overflow-x-hidden">
      
      {/* Navigation */}
      {/* Navigation */}
      <nav className="p-6 md:p-8 flex justify-between items-center max-w-6xl mx-auto w-full">
        {/* Logo and Title Container */}
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
        
        {/* Buttons (Full width on mobile, auto width on desktop) */}
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

        {/* App Preview (Dynamic height based on screen size) */}
        <div className="w-full max-w-4xl h-[250px] sm:h-[350px] md:h-[450px] bg-white/5 border border-white/10 rounded-[24px] flex items-center justify-center text-gray-500 italic shadow-2xl p-4 text-center text-sm sm:text-base">

        </div>
      </header>

      {/* Feature Grid (1 col on mobile, 2 on tablet, 3 on desktop) */}
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

        {/* Centers the 3rd item nicely if viewing on an iPad/Tablet */}
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