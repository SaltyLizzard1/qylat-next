import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import StoryHero from '../../components/StoryHero';
import ThenNowSlider from '../../components/ThenNowSlider';

export const metadata = {
  title: 'My Story | Quit Your Life and Travel',
  description:
    'How a two-hour Monday commute over the Howard Franklin Bridge became the moment I decided to quit corporate life — the leap to Thailand, the pandemic that erased the plan, and the six years it took to try again.',
  openGraph: {
    title: 'My Story | Quit Your Life and Travel',
    description:
      'How a two-hour Monday commute over the Howard Franklin Bridge became the moment I decided to quit corporate life — the leap to Thailand, the pandemic that erased the plan, and the six years it took to try again.',
    images: [
      {
        url: '/My Story/traffic.png',
        width: 1200,
        height: 700,
        alt: 'Bumper to bumper morning commute',
      },
    ],
  },
};

const headingFont = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const goldBtn = {
  background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
  color: '#2D1A00',
  border: '1.5px solid #2D1A00',
  boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
} as const;

export default function StoryPage() {
  return (
    <div
      className="min-h-screen text-slate-900 font-sans"
      style={{
        background: 'linear-gradient(180deg, #b6bfcc 0%, #cdd4de 35%, #f5f0e0 70%, #FBF6E3 100%)',
      }}
    >
      <Header />

      <StoryHero />

      {/* space-y-16 controls the gap between EVERY section below. Was 24 (96px), now 16 (64px). */}
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-12 sm:px-6 lg:px-8 space-y-16">
        {/* Hero + Story */}
        <section>
          {/* mt-10 = space between title and the flowing content below */}
          <div className="mt-0 text-lg leading-relaxed text-slate-700">
            <aside className="max-w-lg mx-auto rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm mb-6 text-center">
              <p className="uppercase tracking-widest text-amber-800 text-sm font-semibold mb-7">Picture this</p>
              <p style={headingFont} className="text-2xl font-semibold leading-tight italic">
                Exactly where you are right now, one year from today. Same job... Same scenery... Same Sunday scaries... Same unfulfilled dreams. Are you happy?
              </p>
            </aside>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 my-8">
              <Image src="/My Story/endlessmeetings.jpg" alt="Office scene" width={600} height={600} className="rounded-3xl object-cover aspect-square w-full" />
              <Image src="/My Story/cubegofer.png" alt="Office cube" width={600} height={600} className="rounded-3xl object-cover aspect-square w-full" />
              <Image src="/My Story/sleepingcoworker.jpg" alt="Sleeping coworker" width={600} height={600} className="rounded-3xl object-cover aspect-square w-full" />
            </div>

            {/* mb-4 on each paragraph = 16px gap between lines. Tighter than mb-6 (24px). Adjust as needed. */}
            <p className="text-xl font-semibold text-slate-900 mb-4">You know this life.</p>
            <p className="mb-4">You look around, baking under the fluorescent lights. Your coworker is asleep at his desk at 2pm because honestly, what&rsquo;s the point. You could leave, but there goes the insurance, the 401k, the safe predictable everything.</p>
            <p className="mb-4">And still, somewhere underneath all that, you know a better life is waiting for you somewhere else.</p>
            <p className="mb-4">You sit in your cube. Check the clock. Open a flight tab. Close it. Open it again.</p>
            <p className="mb-4">You tell yourself &ldquo;next year.&rdquo; You always tell yourself next year.</p>

            <p className="mb-4">Monday morning, sitting in traffic, another two-hour commute. The thought of one more week on autopilot turned my stomach. Somewhere about halfway over the Howard Franklin Bridge, I decided to quit.</p>
            <p style={headingFont} className="text-2xl font-bold text-slate-900 mb-4">
              The decision took years. The moment took half a bridge.
            </p>
            <p className="mb-4">I had no idea if I would like Thailand, or traveling for that matter. I hedged the bet and Airbnbed my house instead of selling, knowing I had a place to come back to.</p>
            <p className="mb-4">I didn't need it. I loved every beautiful, chaotic, humid minute. I knew this was the life I was meant to live.</p>
            <p className="mb-4">8 months later, I flew back and went all in. I sold everything I owned. House, clothes, cars, all of it. I picked a date and started counting down.</p>
            <div className="clear-both grid grid-cols-2 md:grid-cols-3 gap-6 my-8">
              <Image src="/My Story/bagspacked.jpg" alt="Packing" width={600} height={600} className="rounded-3xl object-cover aspect-square w-full" />
              <Image src="/My Story/onplane.jpg" alt="Boarding plane" width={600} height={600} className="rounded-3xl object-cover aspect-square w-full" />
              <Image src="/My Story/map.jpg" alt="Travel map" width={600} height={600} className="rounded-3xl object-cover aspect-square w-full" />
            </div>
            <p className="mb-4">The week I was supposed to fly, the world shut down. Borders closed, the dream evaporated overnight, and the house was gone.</p>
            <p style={headingFont} className="text-2xl font-bold text-slate-900 mb-4">
              I had sold my way into homelessness for a trip that no longer existed.
            </p>
            <p className="mb-4">Then I lost my license. My own fault, and a story for another day.</p>
            <p className="mb-4">And then I drifted. Four years on autopilot, walking the same five blocks, going to the same places, living the same day on repeat.</p>
            <p className="mb-4">Six years is how long the second leap took. Six years of knowing exactly what I wanted and watching the window close.</p>
            <p className="mb-4">Here&rsquo;s what nobody tells you:</p>
            <p style={headingFont} className="text-2xl font-bold text-slate-900 mb-4">
              The leap isn&rsquo;t one jump. Sometimes you land back where you started and have to climb again.
            </p>
            <p style={headingFont} className="text-2xl font-semibold leading-tight italic">I left anyway. Slower the second time, smarter, but I left.</p>

            <div className="clear-both" />
          </div>
        </section>


        {/* Now Section — space-y-8 tightened from space-y-12 */}
        <section className="space-y-8">
          <div className="text-center">
            <p className="uppercase tracking-widest text-amber-800 text-sm font-semibold">This is Monday now.</p>
            <h2 style={headingFont} className="text-4xl font-bold mt-3">Same laptop. Different office.</h2>
          </div>

          <ThenNowSlider />

          <div className="text-center">
            <h2 style={headingFont} className="text-4xl font-bold">My weekends look like this now.</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <Image src="/My Story/happy.jpg" alt="Travel smile" width={600} height={600} className="rounded-3xl object-cover aspect-square w-full" />
            <Image src="/My Story/Taiwan_Gorge.jpg" alt="Taiwan Taroko Gorge" width={600} height={600} className="rounded-3xl object-cover aspect-square w-full" />
            <Image src="/My Story/Smoky_mountains.jpg" alt="Mountains in Taiwan" width={600} height={600} className="rounded-3xl object-cover aspect-square w-full" />
            <Image src="/My Story/mountains.jpg" alt="Chiang Mai Mountains" width={600} height={600} className="rounded-3xl object-cover aspect-square w-full" />
          </div>

          {/* space-y-4 = tighter paragraph spacing */}
          <div className="max-w-3xl mx-auto text-lg leading-relaxed text-slate-700 space-y-4">
            <p>I wake up when my body wakes up. Work from beaches, caf&eacute;s, and a little apartment in Chiang Mai that costs a third of what my old rent did in the States.</p>
            <p>I&rsquo;m not rich. Not on permanent vacation. I work every day, but on things I chose, in places I chose.</p>
            <p style={headingFont} className="text-2xl font-bold text-slate-900 text-center">That&rsquo;s the difference. Choice.</p>
          </div>
        </section>

        {/* Bridge CTA — p-8 instead of p-12 for tighter padding */}
        <section className="bg-white border border-amber-200 rounded-3xl p-8 text-center max-w-3xl mx-auto shadow-lg">
          <p style={headingFont} className="text-2xl font-semibold">You already know. You&rsquo;ve known for a while.</p>
          <p className="mt-4 text-lg text-slate-600">The job is fine. Everything is fine. And &ldquo;fine&rdquo; is the most dangerous word because you can survive it forever.</p>
          <p className="mt-3 text-lg font-medium">You don&rsquo;t need permission. You need a plan.</p>

          <div className="mt-8 flex flex-col gap-4 items-center">
            <a href="/assessment" className="inline-block font-semibold px-10 py-4 rounded-full text-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg" style={goldBtn}>
              Discover Your Idea &rarr;
            </a>
            <a href="/work-with-me" className="inline-block font-semibold text-lg underline underline-offset-4 transition hover:opacity-70 self-center" style={{ color: '#0f172a' }}>
              See how I can help
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
