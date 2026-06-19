import { images } from '../config/images';

// ─── QYLAT Blog Post: Day 0 — The Decision to Leap 2.0 ───
// Structure identical to SortingSpiral.tsx; scoped with .leap-post.
// CTA links to #work-with-me (SortingSpiral uses /ideatoplan).

export default function Day0LeapDecision() {
  return (
    <article className="leap-post">
      <style>{`
        .leap-post {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 1.25rem 4rem;
          font-family: Georgia, 'Times New Roman', serif;
          color: #1a1a1a;
        }

        .leap-post .lead-image {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 1.75rem;
          display: block;
        }

        .leap-post .meta {
          font-family: -apple-system, 'Helvetica Neue', sans-serif;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #888;
          margin: 0 0 0.6rem;
        }

        .leap-post h1 {
          font-size: clamp(26px, 5vw, 36px);
          font-weight: 500;
          line-height: 1.2;
          margin: 0 0 0.5rem;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .leap-post .subtitle {
          font-family: -apple-system, 'Helvetica Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #888;
          margin: 0 0 2rem;
        }

        .leap-post .divider {
          border: none;
          border-top: 0.5px solid #e0e0e0;
          margin: 0 0 2rem;
        }

        .leap-post p {
          font-size: 17px;
          line-height: 1.8;
          margin: 0 0 1.4rem;
        }

        .leap-post p.italic {
          font-style: italic;
        }

        .leap-post .pull-quote {
          border-left: 3px solid #D85A30;
          padding: 0.25rem 0 0.25rem 1.25rem;
          margin: 2.5rem 0;
        }

        .leap-post .pull-quote p {
          font-size: 21px;
          font-style: italic;
          line-height: 1.5;
          margin: 0;
          color: #1a1a1a;
        }

        .leap-post .cta-block {
          border-top: 0.5px solid #e0e0e0;
          padding-top: 1.75rem;
          margin-top: 2.5rem;
        }

        .leap-post .cta-block p {
          font-family: -apple-system, 'Helvetica Neue', sans-serif;
          font-size: 13px;
          color: #888;
          margin: 0 0 0.5rem;
        }

        .leap-post .cta-block a {
          font-family: -apple-system, 'Helvetica Neue', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #D85A30;
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: opacity 0.15s ease;
        }

        .leap-post .cta-block a:hover {
          opacity: 0.75;
        }

        @media (max-width: 600px) {
          .leap-post {
            padding: 0 1rem 3rem;
          }
          .leap-post .pull-quote p {
            font-size: 18px;
          }
        }
      `}</style>

      {/* Lead Image */}
      <img
        src={images.day0}
        alt="The moment before the second leap"
        className="lead-image"
      />

      {/* Meta */}
      <p className="meta">March 14, 2026 &nbsp;·&nbsp; The Leap Log</p>

      {/* Title */}
      <h1>The Decision to Leap 2.0</h1>
      <p className="subtitle">Day 0</p>

      <hr className="divider" />

      {/* Body */}
      <p>I&apos;ve been here before.</p>

      <p>
        Standing at the edge. Heart pounding. Every logical voice in my head screaming to step back.
      </p>

      <p>I jumped anyway. That was 2018.</p>

      <p>
        I quit my corporate job. Bought a one-way ticket to Thailand. Just to test the waters. And
        everything I suspected about life beyond the cubicle turned out to be true. The freedom was
        real. The joy was real. The feeling of being fully, genuinely alive. Real.
      </p>

      <p>So I came home, sold everything, and got ready to make it permanent.</p>

      <p>Then the world shut down.</p>

      <p>
        Five years. Circumstances I couldn&apos;t control kept me locked in place. The dream
        didn&apos;t die. It just sat there, patient and waiting, while I rebuilt from scratch with
        less money, less certainty, and more fear than I started with.
      </p>

      {/* Pull Quote */}
      <div className="pull-quote">
        <p>
          The second leap is harder. You know exactly what you&apos;re risking. You go anyway.
        </p>
      </div>

      <p>
        Something shifted recently. Not a dramatic moment. More like a quiet confirmation. A nudge
        that said: you already know the answer.
      </p>

      <p>So here I am. Day 0. Same massive fear. More earned wisdom. No more waiting.</p>

      <p>
        This time I know what I&apos;m leaping toward. I&apos;ve tasted it. That makes the jump both
        harder and easier than the first time. Harder because I know exactly what I&apos;m risking.
        Easier because I know exactly what I&apos;m gaining.
      </p>

      {/* Bridge to the leap */}
      <p className="italic">
        Quit Your Life and Travel is the story of refusing to let fear write the ending.
      </p>

      <p>
        If you&apos;ve been staring out your own window. Waiting for the right time. Waiting for
        permission. Waiting for the fear to go away. I want you to know something.
      </p>

      <p>Fear doesn&apos;t go away. You just stop letting it drive.</p>

      <p>Welcome to the leap. I&apos;m glad you&apos;re here.</p>

      {/* CTA */}
      <div className="cta-block">
        <p>Ready to build the business that funds your leap?</p>
        <a href="#work-with-me">
          Take the Leap →
        </a>
      </div>
    </article>
  );
}
