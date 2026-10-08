import type { JsonLdObject } from '../lib/jsonLd';

// Renders one <script type="application/ld+json"> per object. A native script
// tag, not next/script, because this is data, not code to execute. The "<"
// escape follows the Next.js JSON-LD guide so no string can close the tag.
export default function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}
