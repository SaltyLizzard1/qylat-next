'use client';

export default function LeapLoader({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 680 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '100%', maxWidth: '480px', display: 'block', margin: '0 auto' }}
      role="img"
      aria-label="Animated frog leaping from a gray office cubicle maze across a pond to a sunny palm-tree beach"
    >
      <defs>
        <style>{`
          /* ═══════════════════════════════════════════════
             FIX 2: #frog-mover is TRANSLATE + OPACITY only.
             Flip is handled by #frog-flip below.
          ═══════════════════════════════════════════════ */
          #frog-mover {
            animation: frog-travel 8s linear infinite;
          }
          @keyframes frog-travel {
            /* idle on left bank */
            0%      { transform: translate(0px, 0px);    opacity: 1; }
            43.75%  { transform: translate(0px, 0px);    opacity: 1; }
            /* leap arc — mid-air peak, then descend to right bank */
            56.25%  { transform: translate(100px,-80px); opacity: 1; }
            68.75%  { transform: translate(260px,-18px); opacity: 1; }
            /* landing: x=340 puts frog-feet at world-x ~475, past pond edge (pond rx=115 → ends x=455) */
            75%     { transform: translate(340px, 5px);  opacity: 1; }
            79%     { transform: translate(340px, 0px);  opacity: 1; }
            /* content under palm */
            94%     { transform: translate(340px, 0px);  opacity: 1; }
            /* fade out, teleport, fade in */
            97%     { transform: translate(340px, 0px);  opacity: 0; }
            99%     { transform: translate(0px,   0px);  opacity: 0; }
            100%    { transform: translate(0px,   0px);  opacity: 1; }
          }

          /* ═══════════════════════════════════════════════
             FIX 2 (cont): #frog-flip handles scaleX only,
             around its own bounding box (transform-box: fill-box).
             This prevents the mirror-about-origin bug.
          ═══════════════════════════════════════════════ */
          #frog-flip {
            transform-box: fill-box;
            transform-origin: center;
            animation: frog-flip-anim 8s linear infinite;
          }
          @keyframes frog-flip-anim {
            /* facing viewer on left bank */
            0%      { transform: scaleX(1); }
            43.75%  { transform: scaleX(1); }
            /* turn during crouch beat */
            47%     { transform: scaleX(-1); }
            /* stay mirrored through leap, landing, encore */
            94%     { transform: scaleX(-1); }
            /* reset while invisible */
            97%     { transform: scaleX(1); }
            100%    { transform: scaleX(1); }
          }

          /* body breathe + squash */
          #frog-body-group {
            transform-box: fill-box;
            transform-origin: center bottom;
            animation: frog-body-anim 8s linear infinite;
          }
          @keyframes frog-body-anim {
            0%      { transform: scaleY(1);    }
            6%      { transform: scaleY(1.03); }
            12%     { transform: scaleY(1);    }
            43.75%  { transform: scaleY(1);    }
            /* crouch pre-leap */
            50%     { transform: scaleY(0.82); }
            /* extend mid-air */
            56.25%  { transform: scaleY(1.05); }
            /* landing squash */
            75%     { transform: scaleY(0.72); }
            79%     { transform: scaleY(1.05); }
            82%     { transform: scaleY(1);    }
            100%    { transform: scaleY(1);    }
          }

          /* ═══════════════════════════════════════════════
             FIX 4: first blink moved to ~25% (2.0s) so it
             fires during the look-at-viewer beat, not idle.
          ═══════════════════════════════════════════════ */
          #frog-lid-l, #frog-lid-r {
            transform-box: fill-box;
            transform-origin: center top;
            animation: frog-blink 8s linear infinite;
          }
          @keyframes frog-blink {
            /* blink 1 at 25% (~2.0s) — during eye-contact beat */
            0%    { transform: scaleY(0); }
            23%   { transform: scaleY(0); }
            25%   { transform: scaleY(1); }
            27%   { transform: scaleY(1); }
            29%   { transform: scaleY(0); }
            /* blink 2 at 84% (~6.7s) — post-landing smile */
            81%   { transform: scaleY(0); }
            84%   { transform: scaleY(1); }
            87%   { transform: scaleY(1); }
            90%   { transform: scaleY(0); }
            100%  { transform: scaleY(0); }
          }

          /* pupils shift to look at viewer (18.75–31.25%) */
          #frog-pupils {
            animation: frog-pupils-anim 8s linear infinite;
          }
          @keyframes frog-pupils-anim {
            0%      { transform: translate(0px, 0px); }
            18.75%  { transform: translate(0px, 0px); }
            20%     { transform: translate(1px, 1px); }
            31.25%  { transform: translate(1px, 1px); }
            37.5%   { transform: translate(0px, 0px); }
            100%    { transform: translate(0px, 0px); }
          }

          /* tongue: scaleX(0→1→0), fires twice */
          #frog-tongue {
            transform-box: fill-box;
            transform-origin: left center;
            animation: frog-tongue-anim 8s linear infinite;
          }
          @keyframes frog-tongue-anim {
            0%    { transform: scaleX(0); opacity: 0; }
            /* flick 1 at ~2.5s (31–35%) */
            31%   { transform: scaleX(0); opacity: 0; }
            32.5% { transform: scaleX(1); opacity: 1; }
            34%   { transform: scaleX(1); opacity: 1; }
            35.5% { transform: scaleX(0); opacity: 0; }
            /* flick 2 after landing (~6.7s = 83–87%) */
            83%   { transform: scaleX(0); opacity: 0; }
            84.5% { transform: scaleX(1); opacity: 1; }
            86%   { transform: scaleX(1); opacity: 1; }
            87.5% { transform: scaleX(0); opacity: 0; }
            100%  { transform: scaleX(0); opacity: 0; }
          }

          /* mouth: neutral closed → smile after landing */
          #frog-mouth-neutral { animation: mouth-neutral-anim 8s linear infinite; }
          @keyframes mouth-neutral-anim {
            0%   { opacity: 1; }
            81%  { opacity: 1; }
            82%  { opacity: 0; }
            100% { opacity: 0; }
          }
          #frog-mouth-smile { animation: mouth-smile-anim 8s linear infinite; }
          @keyframes mouth-smile-anim {
            0%   { opacity: 0; }
            81%  { opacity: 0; }
            82%  { opacity: 1; }
            100% { opacity: 1; }
          }

          /* dust puffs on landing (world coords: frog-mover+340 + local+130 + feet) */
          #dust-l, #dust-r {
            transform-box: fill-box;
            transform-origin: center;
            animation: dust-puff 8s linear infinite;
          }
          @keyframes dust-puff {
            0%   { transform: scale(0);   opacity: 0;   }
            75%  { transform: scale(0);   opacity: 0;   }
            77%  { transform: scale(1.4); opacity: 0.7; }
            79%  { transform: scale(2);   opacity: 0;   }
            100% { transform: scale(0);   opacity: 0;   }
          }

          /* mid-pond ripples while frog flies over */
          #ripple-a { animation: ripple-expand 8s linear infinite; }
          #ripple-b { animation: ripple-expand 8s 0.3s linear infinite; }
          @keyframes ripple-expand {
            0%   { r: 6;  opacity: 0;   }
            50%  { r: 6;  opacity: 0;   }
            56%  { r: 8;  opacity: 0.5; }
            63%  { r: 18; opacity: 0;   }
            100% { r: 6;  opacity: 0;   }
          }

          /* ═══════════════════════════════════════════════
             REDUCED MOTION: static frog on palm side.
             FIX 2: #frog-flip gets scaleX(-1), not #frog-mover.
          ═══════════════════════════════════════════════ */
          @media (prefers-reduced-motion: reduce) {
            #frog-mover         { animation: none; transform: translate(340px, 0px); opacity: 1; }
            #frog-flip          { animation: none; transform: scaleX(-1); }
            #frog-body-group    { animation: none; transform: scaleY(1); }
            #frog-lid-l,
            #frog-lid-r         { animation: none; transform: scaleY(0); }
            #frog-pupils        { animation: none; transform: translate(0,0); }
            #frog-tongue        { animation: none; transform: scaleX(0); opacity: 0; }
            #frog-mouth-neutral { animation: none; opacity: 0; }
            #frog-mouth-smile   { animation: none; opacity: 1; }
            #dust-l, #dust-r    { animation: none; opacity: 0; }
            #ripple-a, #ripple-b{ animation: none; opacity: 0; }
          }
        `}</style>
      </defs>

      {/* transparent background */}
      <rect x="0" y="0" width="680" height="320" fill="none" />

      {/* ── SUN ── */}
      <circle cx="610" cy="62" r="34" fill="#F5E070" opacity="0.45" />
      <circle cx="610" cy="62" r="22" fill="#F5D020" />

      {/* ── LEFT BANK — isometric cubicle maze ── */}
      <rect x="0" y="210" width="210" height="110" fill="#9DA5AB" />
      {/* cubicle block 1 */}
      <polygon points="20,130 80,110 140,130 80,150" fill="#B7BDC2" />
      <polygon points="20,130 20,200 80,220 80,150"  fill="#8E959B" />
      <polygon points="80,150 80,220 140,200 140,130" fill="#7C838A" />
      {/* cubicle block 2 */}
      <polygon points="90,150 150,130 200,148 150,168" fill="#B7BDC2" />
      <polygon points="90,150 90,210 150,228 150,168"  fill="#8E959B" />
      <polygon points="150,168 150,228 200,210 200,148" fill="#7C838A" />
      {/* divider partition */}
      <rect x="60" y="160" width="8" height="60" fill="#8E959B" />
      <polygon points="60,160 64,155 72,160 68,165" fill="#B7BDC2" />
      {/* low partition */}
      <rect x="110" y="185" width="50" height="6" rx="1" fill="#B7BDC2" />
      <rect x="110" y="185" width="6"  height="30" fill="#8E959B" />
      <rect x="154" y="185" width="6"  height="30" fill="#8E959B" />
      {/* shelf strip */}
      <rect x="25" y="158" width="40" height="4" rx="1" fill="#9DA5AB" />
      <rect x="25" y="158" width="4"  height="20" fill="#8E959B" />

      {/* ── POND ── */}
      <ellipse cx="340" cy="272" rx="115" ry="40" fill="#7FA8B8" />
      <ellipse cx="330" cy="272" rx="70"  ry="22" fill="none" stroke="#9FC3CF" strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="345" cy="276" rx="45"  ry="14" fill="none" stroke="#9FC3CF" strokeWidth="1"   opacity="0.4" />
      {/* mid-pond ripples while frog arcs over */}
      <circle id="ripple-a" cx="320" cy="270" r="6" fill="none" stroke="#9FC3CF" strokeWidth="1.5" />
      <circle id="ripple-b" cx="345" cy="274" r="6" fill="none" stroke="#9FC3CF" strokeWidth="1.5" />

      {/* ── RIGHT BANK — sandy ── */}
      <ellipse cx="530" cy="278" rx="155" ry="52" fill="#C9B87A" />
      <rect x="430" y="270" width="250" height="50" fill="#C9B87A" />

      {/* ── PALM TRUNK (stacked segments) ── */}
      <rect x="550" y="215" width="14" height="22" rx="4" fill="#8B6914" />
      <rect x="548" y="193" width="14" height="24" rx="4" fill="#8B6914" />
      <rect x="550" y="171" width="13" height="24" rx="4" fill="#6B4C08" />
      <rect x="549" y="151" width="13" height="22" rx="4" fill="#8B6914" />
      <rect x="551" y="134" width="12" height="20" rx="4" fill="#6B4C08" />
      <line x1="553" y1="134" x2="553" y2="235" stroke="#6B4C08" strokeWidth="2" opacity="0.4" />

      {/* ── COCONUTS ── */}
      <circle cx="553" cy="148" r="6"   fill="#6B4C08" />
      <circle cx="563" cy="152" r="5"   fill="#8B6914" />
      <circle cx="545" cy="153" r="4.5" fill="#6B4C08" />

      {/* ── FRONDS ── */}
      <path d="M556,138 Q530,110 490,108 Q510,118 530,128 Q540,132 556,138" fill="#4E7B44" />
      <path d="M556,138 Q530,112 488,110" fill="none" stroke="#3D6035" strokeWidth="1" />
      <path d="M494,109 L496,115 M503,108 L505,114 M513,107 L515,113 M522,109 L523,116" stroke="#4E7B44" strokeWidth="1.5" />

      <path d="M554,136 Q515,118 470,125 Q490,128 515,132 Q532,134 554,138" fill="#578A4C" />
      <path d="M476,124 L478,131 M487,122 L489,129 M498,121 L500,128 M510,122 L511,130" stroke="#4A7540" strokeWidth="1.5" />

      <path d="M554,140 Q530,148 498,162 Q518,156 538,148 Q548,143 554,140" fill="#4E7B44" />
      <path d="M500,161 L503,155 M510,158 L513,152 M521,154 L524,148 M533,149 L535,143" stroke="#3D6035" strokeWidth="1.5" />

      <path d="M558,136 Q582,112 618,108 Q600,118 578,128 Q567,133 558,138" fill="#578A4C" />
      <path d="M614,109 L612,115 M605,108 L603,114 M595,107 L593,113 M585,109 L584,116" stroke="#4A7540" strokeWidth="1.5" />

      <path d="M560,138 Q590,130 628,136 Q608,136 586,140 Q572,141 560,140" fill="#4E7B44" />
      <path d="M626,135 L624,141 M615,134 L613,140 M604,134 L602,140 M593,135 L592,141" stroke="#3D6035" strokeWidth="1.5" />

      <path d="M558,140 Q578,155 600,172 Q585,160 568,150 Q562,145 558,141" fill="#578A4C" />
      <path d="M598,170 L595,163 M588,166 L585,160 M578,160 L575,153 M567,152 L565,146" stroke="#4A7540" strokeWidth="1.5" />

      {/* ── DUST PUFFS on landing
           frog-mover+340 + local(130,228) + feet(5/31, 24)
           → world: left=(475,252) right=(501,252)        ── */}
      <circle id="dust-l" cx="475" cy="252" r="7" fill="#D8C98E" opacity="0" />
      <circle id="dust-r" cx="501" cy="252" r="6" fill="#D8C98E" opacity="0" />

      {/* ═══════════════════════════════════════════
          FROG
          Layer order: #frog-mover (translate)
                       └─ #frog-flip (scaleX, fill-box)   ← FIX 2
                          └─ translate(130,228) local pos
                             └─ #frog-body-group (squash)
      ═══════════════════════════════════════════ */}
      <g id="frog-mover">
        <g id="frog-flip">
          <g transform="translate(130, 228)">
            <g id="frog-body-group">

              {/* body */}
              <ellipse cx="18" cy="14" rx="20" ry="16" fill="#5E9C52" />
              {/* belly */}
              <ellipse cx="18" cy="17" rx="13" ry="10" fill="#CDE3A6" />
              {/* spots */}
              <ellipse cx="10" cy="10" rx="3.5" ry="2.5" fill="#4E8544" opacity="0.7" />
              <ellipse cx="26" cy="9"  rx="3"   ry="2"   fill="#4E8544" opacity="0.7" />
              <ellipse cx="18" cy="6"  rx="2"   ry="1.5" fill="#4E8544" opacity="0.5" />

              {/* front feet */}
              <ellipse cx="5"  cy="24" rx="5" ry="3" fill="#5E9C52" />
              <ellipse cx="31" cy="24" rx="5" ry="3" fill="#5E9C52" />
              <circle cx="2"  cy="25"   r="1.5" fill="#4E8544" />
              <circle cx="5"  cy="26.5" r="1.5" fill="#4E8544" />
              <circle cx="8"  cy="25"   r="1.5" fill="#4E8544" />
              <circle cx="28" cy="25"   r="1.5" fill="#4E8544" />
              <circle cx="31" cy="26.5" r="1.5" fill="#4E8544" />
              <circle cx="34" cy="25"   r="1.5" fill="#4E8544" />

              {/* eye sclera */}
              <circle cx="9"  cy="1" r="7" fill="white" />
              <circle cx="27" cy="1" r="7" fill="white" />

              {/* FIX 3: animated pupils only — static id="pupil-l"/"pupil-r" removed */}
              <g id="frog-pupils">
                <circle cx="9"  cy="2.5" r="2.8" fill="#0a0a0a" />
                <circle cx="27" cy="2.5" r="2.8" fill="#0a0a0a" />
              </g>

              {/* reflections rendered AFTER pupils so they stay on top */}
              <circle cx="10.5" cy="0.5" r="1.2" fill="white" opacity="0.7" />
              <circle cx="28.5" cy="0.5" r="1.2" fill="white" opacity="0.7" />

              {/* eyelids (cover eyes on blink) */}
              <ellipse id="frog-lid-l" cx="9"  cy="-1" rx="7" ry="7" fill="#5E9C52" style={{ transform: 'scaleY(0)' }} />
              <ellipse id="frog-lid-r" cx="27" cy="-1" rx="7" ry="7" fill="#5E9C52" style={{ transform: 'scaleY(0)' }} />

              {/* blush */}
              <ellipse cx="5"  cy="12" rx="4" ry="2.5" fill="#E8909A" opacity="0.4" />
              <ellipse cx="31" cy="12" rx="4" ry="2.5" fill="#E8909A" opacity="0.4" />

              {/* MOUTH — neutral closed line, ALWAYS CLOSED */}
              <path
                id="frog-mouth-neutral"
                d="M12,19 Q18,21 24,19"
                fill="none"
                stroke="#3A6B34"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* MOUTH — smile after landing, also closed */}
              <path
                id="frog-mouth-smile"
                d="M12,18 Q18,24 24,18"
                fill="none"
                stroke="#3A6B34"
                strokeWidth="1.8"
                strokeLinecap="round"
                style={{ opacity: 0 }}
              />

              {/* TONGUE — pink rounded rect, scaleX from left */}
              <rect
                id="frog-tongue"
                x="18" y="18"
                width="18" height="5" rx="2.5"
                fill="#E8788A"
                style={{ transform: 'scaleX(0)', opacity: 0 }}
              />

              {/* overbite teeth */}
              <rect x="15" y="19" width="4" height="3" rx="1" fill="white" opacity="0.9" />
              <rect x="20" y="19" width="4" height="3" rx="1" fill="white" opacity="0.9" />

            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
