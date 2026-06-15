import React, { useState } from 'react';

const REPO_URL = 'https://github.com/Ecila-01/DripCheck_MOBILE';
const APK_URL =
  'https://github.com/Ecila-01/DripCheck_MOBILE/releases/download/v1.0.0/Dripcheck.v1.0.0.apk';

function App() {
  const [slide, setSlide] = useState(1);
  const totalSlides = 8;
  const currentUrl = `https://res.cloudinary.com/dmwhbhssm/image/upload/f_auto,q_auto,pg_${slide + 1}/dripcheck_cxycop.jpg`;

  const proof = [
    {
      claim: 'Install it on Android',
      detail:
        'Grab the v1.0.0 APK and sideload it. Works on any Android phone.',
      link: { label: 'Download the APK', href: APK_URL },
    },
    {
      claim: 'The source is on GitHub',
      detail:
        'Full React Native and Node code. Clone it and build it yourself.',
      link: { label: 'Open the repo', href: REPO_URL },
    },
    {
      claim: 'The screens above come from the app',
      detail:
        'Every slide up top is pulled straight from the running build.',
      link: null,
    },
    {
      claim: 'It runs on real services',
      detail:
        'Photos go to Cloudinary, and signing in sends a one time code to your email.',
      link: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#f2f3f5] selection:bg-[var(--accent)] selection:text-white overflow-x-hidden">

      {/* Navigation */}
      <nav className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="DripCheck logo"
            className="w-9 h-9 object-contain"
          />
          <span className="text-xl font-bold tracking-tight">DripCheck</span>
        </div>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[#99a1ad] hover:text-[#f2f3f5] transition-colors"
        >
          GitHub
        </a>
      </nav>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto w-full px-6 pt-20 pb-24 flex flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)] mb-5">
            Android wardrobe app
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] max-w-3xl mb-6">
            Your whole closet, on your phone.
          </h1>
          <p className="text-lg text-[#99a1ad] max-w-2xl leading-[1.6] mb-10">
            Take a photo of everything you own and DripCheck keeps it organized
            in one place. Picking an outfit becomes a few taps instead of ten
            minutes of digging through the wardrobe.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20">
            <a
              href={APK_URL}
              className="bg-[var(--accent)] text-white px-7 py-3.5 rounded-lg font-semibold text-center hover:opacity-90 transition-opacity"
            >
              Download the APK
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="border border-[#2a2f37] text-[#f2f3f5] px-7 py-3.5 rounded-lg font-semibold text-center hover:border-[#3a414b] hover:bg-[#171a20] transition-colors"
            >
              View the source
            </a>
          </div>

          {/* Slider */}
          <div className="w-full flex flex-col items-center gap-5">
            <div className="relative w-full max-w-[1000px] rounded-2xl border border-[#23272f] overflow-hidden bg-black">
              <img
                src={currentUrl}
                alt={`App screen ${slide}`}
                className="w-full h-auto block"
              />
              <button
                onClick={() => setSlide((s) => Math.max(1, s - 1))}
                disabled={slide === 1}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[var(--accent)] disabled:opacity-30 disabled:hover:bg-black/60 w-11 h-11 rounded-full text-white text-xl transition-colors"
                aria-label="Previous screen"
              >
                ←
              </button>
              <button
                onClick={() => setSlide((s) => Math.min(totalSlides, s + 1))}
                disabled={slide === totalSlides}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[var(--accent)] disabled:opacity-30 disabled:hover:bg-black/60 w-11 h-11 rounded-full text-white text-xl transition-colors"
                aria-label="Next screen"
              >
                →
              </button>
            </div>
            <p className="text-sm text-[#99a1ad]">
              Real screens from the app. Use the arrows to look through them.
              <span className="text-[var(--accent)] ml-2">
                {slide} / {totalSlides}
              </span>
            </p>
          </div>
        </section>

        {/* Proof */}
        <section className="border-t border-[#1f232b]">
          <div className="max-w-6xl mx-auto w-full px-6 py-24 grid md:grid-cols-[0.85fr_1.15fr] gap-12 md:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)] mb-5">
                The details
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15] mb-4">
                What you're working with.
              </h2>
              <p className="text-[#99a1ad] leading-[1.6]">
                Install it, read the code, or just look around.
              </p>
            </div>

            <div className="divide-y divide-[#1f232b]">
              {proof.map((item) => (
                <div key={item.claim} className="py-6 first:pt-0 last:pb-0">
                  <h3 className="text-lg font-semibold mb-1.5">{item.claim}</h3>
                  <p className="text-[#99a1ad] leading-[1.6]">{item.detail}</p>
                  {item.link && (
                    <a
                      href={item.link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-[var(--accent)] font-medium hover:underline"
                    >
                      {item.link.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f232b]">
        <div className="max-w-6xl mx-auto w-full px-6 py-8 flex flex-col sm:flex-row gap-4 justify-between items-center text-sm text-[#99a1ad]">
          <span>DripCheck. Built by Wifraim.</span>
          <div className="flex gap-6">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-[#f2f3f5] transition-colors">
              Source
            </a>
            <a href={APK_URL} className="hover:text-[#f2f3f5] transition-colors">
              Download
            </a>
            <a href="https://wifraim.dev" target="_blank" rel="noreferrer" className="hover:text-[#f2f3f5] transition-colors">
              wifraim.dev
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
