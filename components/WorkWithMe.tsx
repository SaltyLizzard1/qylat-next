'use client';

import { motion, MotionConfig } from 'framer-motion';
import { Check } from 'lucide-react';

const CAL_URL = 'https://cal.com/qylat/leap-session';

const goldBtn = {
  background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
  color: '#2D1A00',
  border: '1.5px solid #2D1A00',
  boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
} as const;

export default function WorkWithMe() {
  const openBooking = () => {
    window.open(CAL_URL, '_blank');
  };

  const sessionFeatures = [
    'Identify the invisible blocks keeping you stuck',
    'Clarify what you actually want (not what you think you should want)',
    'Build your first action plan',
    'Cut through the fear and noise',
  ];

  const forYouIf = [
    "You know something needs to change, but you don't know where to start",
    "You've been \"waiting for the right time\" for months (or years)",
    "You're paralyzed by fear but ready to face it",
    'You want someone to call you out and push you forward',
    "You can't imagine being in the same job, the same situation, a year from now",
  ];

  const leaveWith = [
    "The real reason you’re stuck, named. Not the excuse you’ve been telling everyone.",
    'A written Leap Map, sent to you after the call, with your want and your first move spelled out',
    'One move, locked in, before you hang up, with a date on it',
    'The version of you stuck in that exact same spot a year from now stops being your future, starting today',
  ];

  return (
    <MotionConfig reducedMotion="user">
    <motion.section
      id="work-with-me"
      className="pt-8 pb-14 md:pt-10 md:pb-20 bg-white relative z-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 text-center leading-tight">
          Ready to Stop Waiting and Start Moving?
        </h2>

        <p className="text-lg md:text-xl text-gray-600 mb-5 md:mb-6 text-center max-w-3xl mx-auto leading-relaxed">
          You already know something has to change. You&apos;re not burned out. You&apos;re not lazy. You&apos;re
          just done pretending.
        </p>

        <div className="rounded-2xl shadow-xl p-6 md:p-10 mb-8 md:mb-10" style={{ background: '#EBF0E6', border: '1px solid rgba(45,80,22,0.15)' }}>
          <h3 className="font-cormorant text-2xl md:text-3xl font-bold text-gray-900 mb-4">The Leap Session</h3>

          <p className="text-lg text-gray-600 mb-8">
            A 45-minute private coaching call designed to cut through the fog and get you moving.
            This isn&apos;t therapy. This isn&apos;t a pep talk. This is a targeted intervention to identify
            your blocks, clarify your wants, and build your first real action plan.
          </p>

          <div
            className="rounded-lg p-6 mb-8"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(139,105,20,0.35)',
              boxShadow: '0 8px 24px rgba(58,40,26,0.10)',
            }}
          >
            <div className="grid md:grid-cols-2 gap-8 md:gap-10">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  This is for you if...
                </h4>
                <ul className="space-y-3">
                  {forYouIf.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C9A030' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:border-l md:pl-10" style={{ borderColor: '#E8C84A55' }}>
                <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  What you leave with
                </h4>
                <ul className="space-y-3">
                  {leaveWith.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C9A030' }} />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-8 pt-2 border-t" style={{ borderColor: 'rgba(45,80,22,0.15)' }}>
            <h4 className="text-lg font-semibold text-gray-800 mb-3 mt-4">What happens in the session:</h4>
            <ul className="space-y-2">
              {sessionFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5" style={{ color: '#8B6914' }} />
                  <span className="text-gray-600 text-[15px]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900 mb-2">$40</p>
            <p className="text-xs font-semibold mb-1" style={{ color: '#8B6914' }}>Special introductory offer</p>
            <p className="text-gray-500 mb-6">45-minute private session</p>
            <button
              type="button"
              onClick={openBooking}
              className="font-sans px-10 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg"
              style={goldBtn}
            >
              Book Your Leap Session
            </button>
          </div>
        </div>
      </div>
    </motion.section>
    </MotionConfig>
  );
}
