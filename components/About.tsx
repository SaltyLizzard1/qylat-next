import Image from 'next/image';
import { images } from '../config/images';
import RevealWrapper from './RevealWrapper';

export default function About() {
  return (
    <RevealWrapper>
    <section
      id="about"
      className="scroll-mt-28 bg-white border-t border-gray-100 pb-6 md:pb-8"
    >
      <div className="max-w-2xl mx-auto px-6 pt-10 md:pt-12 text-center">
        <Image
          src={images.about}
          alt="Liz"
          width={128}
          height={128}
          className="w-32 h-32 rounded-full object-cover mx-auto mb-6"
        />
        <h1 className="font-cormorant text-3xl font-semibold text-gray-900 mb-6">About Liz</h1>
        <div className="text-left space-y-5 text-gray-700 text-lg leading-relaxed">
          <p>
            I&apos;m Liz. I started with a degree in Clinical Psychology and ended up in IT.
            Turns out computers are easier to fix. People, though, are the more interesting
            problem, and both backgrounds show up in everything I build.
          </p>
          <p>
            I spent nearly two decades in corporate tech solving problems under pressure and
            untangling systems. Then I quit
            and bought a one-way ticket to Thailand. Life had other plans. Six years later I
            went back again anyway, this time with a business I built before I left.
          </p>
          <p>
            I write this from Chiang Mai, where I run QYLAT and IdeaToPlan, my skill-matching
            and business planning service. It helps people figure out the business they&apos;re
            built for and how to launch it, so they can fund the life they actually want. It was
            my first baby, and it works: I have several other projects in motion that I found by
            running my own process on myself.
          </p>
          <p>
            QYLAT is where I document the real version of that story. No highlight reel. No
            perfect packing lists. Just what it actually looks like to quit your life and build
            a new one.
          </p>
          <p>If you&apos;re thinking about making your own leap, you&apos;re in the right place.</p>
        </div>
      </div>
    </section>
    </RevealWrapper>
  );
}
