import { images } from '../config/images';

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-28 bg-white border-t border-gray-100 pb-6 md:pb-8"
    >
      <div className="max-w-2xl mx-auto px-6 pt-10 md:pt-12 text-center">
        <img
          src={images.about}
          alt="Liz"
          className="w-32 h-32 rounded-full object-cover mx-auto mb-6"
        />
        <h1 className="font-cormorant text-3xl font-semibold text-gray-900 mb-6">About Liz</h1>
        <div className="text-left space-y-5 text-gray-700 text-lg leading-relaxed">
          <p>
            I&apos;m Liz. I started with a degree in Clinical Psychology and ended up in IT.
            Turns out computers are easier to fix.
          </p>
          <p>
            After nearly two decades in corporate tech, I quit and bought a one-way ticket to Thailand.
            Life had other plans. Five years later I&apos;m going anyway — this time with a business
            I built before I left.
          </p>
          <p>
            QYLAT is where I document the real version of that story. No highlight reel. No perfect
            packing lists. Just what it actually looks like to quit your life and build a new one.
          </p>
          <p>If you&apos;re thinking about making your own leap, you&apos;re in the right place.</p>
        </div>
      </div>

      {/* Beach / full-length photo — re-enable when you want it above the footer
      <div className="max-w-lg mx-auto px-6 mt-10 md:mt-12 pb-2">
        <img
          src={images.aboutBeach}
          alt="Liz on the beach"
          className="w-full h-auto max-h-[min(72vh,640px)] rounded-2xl object-contain object-center bg-emerald-50/40 shadow-lg ring-1 ring-black/5"
          loading="lazy"
          decoding="async"
        />
      </div>
      */}
    </section>
  );
}
