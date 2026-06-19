import React from "react";

// ─── QYLAT Blog Post: The More I Sort, The More Appears ───
// Drop this component into your pages/blog/ directory.
// Replace LEAD_IMAGE_SRC with your actual image import or path.
// The pull quote, CTA color (#D85A30), and font stack match the
// unified QYLAT blog format agreed on 2026-03-24.

const LEAD_IMAGE_SRC = "/ai_bini.png";

export default function SortingSpiral() {
  return (
    <article className="sorting-spiral">
      <style>{`
        .sorting-spiral {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 1.25rem 4rem;
          font-family: Georgia, 'Times New Roman', serif;
          color: #1a1a1a;
        }

        .sorting-spiral .lead-image {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 1.75rem;
          display: block;
        }

        .sorting-spiral .meta {
          font-family: -apple-system, 'Helvetica Neue', sans-serif;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #888;
          margin: 0 0 0.6rem;
        }

        .sorting-spiral h1 {
          font-size: clamp(26px, 5vw, 36px);
          font-weight: 500;
          line-height: 1.2;
          margin: 0 0 0.5rem;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .sorting-spiral .subtitle {
          font-family: -apple-system, 'Helvetica Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #888;
          margin: 0 0 2rem;
        }

        .sorting-spiral .divider {
          border: none;
          border-top: 0.5px solid #e0e0e0;
          margin: 0 0 2rem;
        }

        .sorting-spiral p {
          font-size: 17px;
          line-height: 1.8;
          margin: 0 0 1.4rem;
        }

        .sorting-spiral p.italic {
          font-style: italic;
        }

        .sorting-spiral .pull-quote {
          border-left: 3px solid #D85A30;
          padding: 0.25rem 0 0.25rem 1.25rem;
          margin: 2.5rem 0;
        }

        .sorting-spiral .pull-quote p {
          font-size: 21px;
          font-style: italic;
          line-height: 1.5;
          margin: 0;
          color: #1a1a1a;
        }

        .sorting-spiral .cta-block {
          border-top: 0.5px solid #e0e0e0;
          padding-top: 1.75rem;
          margin-top: 2.5rem;
        }

        .sorting-spiral .cta-block p {
          font-family: -apple-system, 'Helvetica Neue', sans-serif;
          font-size: 13px;
          color: #888;
          margin: 0 0 0.5rem;
        }

        .sorting-spiral .cta-block a {
          font-family: -apple-system, 'Helvetica Neue', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #D85A30;
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: opacity 0.15s ease;
        }

        .sorting-spiral .cta-block a:hover {
          opacity: 0.75;
        }

        @media (max-width: 600px) {
          .sorting-spiral {
            padding: 0 1rem 3rem;
          }
          .sorting-spiral .pull-quote p {
            font-size: 18px;
          }
        }
      `}</style>

      {/* Lead Image */}
      <img
        src={LEAD_IMAGE_SRC}
        alt="Clothes piled on the floor mid-sort, dog peeking through the chaos"
        className="lead-image"
      />

      {/* Meta */}
      <p className="meta">March 24, 2026 &nbsp;·&nbsp; The Leap Log</p>

      {/* Title */}
      <h1>The More I Sort, The More Appears</h1>
      <p className="subtitle">Why I'm not packing like a fashion blogger</p>

      <hr className="divider" />

      {/* Body */}
      <p>I have sorted the same pile of clothes three times today.</p>

      <p>
        Not because I'm indecisive. Because every time I clear a surface,
        something appears on it. I don't know where it's coming from. I have
        lived in this apartment for years and apparently I have been quietly
        hoarding things I forgot I owned.
      </p>

      <p>
        My brain does not do well with this. I need order to think. Right now
        my living room looks like a thrift store had a breakdown, and I am
        somewhere in the middle of it with a garbage bag in one hand and
        absolutely no plan in the other.
      </p>

      <p>At some point this afternoon I had a thought that felt reasonable at the time.</p>

      <p className="italic">If I'm going to be traveling, I should look good doing it.</p>

      <p>
        So I started setting things aside. The good jeans. The going-out tops.
        The heels I've worn twice but keep because they're perfect. I was
        building a travel wardrobe in my head and it felt exciting and it felt
        like a solution to the chaos. It was neither.
      </p>

      {/* Pull Quote */}
      <div className="pull-quote">
        <p>You don't want more options when you're living out of a bag. You want fewer decisions.</p>
      </div>

      <p>
        Then I pictured it. The room I'll be staying in. The suitcase open on
        the floor because there's nowhere else to put it. Every single thing I
        packed spread across a 10x10 space.
      </p>

      <p>That's where the fashion blogger fantasy ends.</p>

      <p>
        The less you pack, the lighter you move. The lighter you move, the more
        you actually show up for the life you went there to live instead of
        managing your luggage.
      </p>

      <p>
        So the heels went into the donation bag. The good jeans made the cut.
        Two pairs. That's it.
      </p>

      <p>
        I'm not packing light because I have to. I'm packing light because I've
        already learned what happens when you don't. It shouldn't feel like
        home. That's the whole point.
      </p>

      {/* Bridge to the leap */}
      <p className="italic">Back to the bags.</p>

      <p>
        The mess is part of it. The chaos, the second-guessing, the moment you
        almost pack the heels anyway — that's not a sign you're doing it wrong.
        That's what letting go actually looks like. Nobody's leap is clean.
        Mine certainly isn't.
      </p>

      <p>
        But you sort another pile. You make another decision. And slowly, the
        life you're leaving gets lighter.
      </p>

      <p>So does everything else.</p>

      {/* CTA */}
      <div className="cta-block">
        <p>Ready to build the business that funds your leap?</p>
        <a href="/ideatoplan">Take the Leap →</a>
      </div>
    </article>
  );
}
