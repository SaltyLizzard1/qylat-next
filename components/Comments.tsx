'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const CUSDIS_APP_ID = '23b02d42-aed5-4fe7-acc2-dc8e96a4c119';

export default function Comments({ pageTitle }: { pageTitle: string }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const pageUrl = `https://quityourlifeandtravel.com${pathname}`;
  const pageId = pathname;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.dataset.host = 'https://cusdis.com';
    el.dataset.appId = CUSDIS_APP_ID;
    el.dataset.pageId = pageId;
    el.dataset.pageUrl = pageUrl;
    el.dataset.pageTitle = pageTitle;

    const existing = document.getElementById('cusdis-script');
    if (existing) {
      // Script already loaded — just re-init for the new page
      (window as Window & { CUSDIS?: { initial: () => void } }).CUSDIS?.initial();
      return;
    }

    const script = document.createElement('script');
    script.id = 'cusdis-script';
    script.src = 'https://cusdis.com/js/cusdis.es.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Leave the script tag — removing it breaks re-init on re-open
    };
  }, [pageId, pageUrl, pageTitle]);

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <h3 className="text-lg font-semibold text-emerald-900 mb-6">Comments</h3>
      <div id="cusdis_thread" ref={containerRef} />
    </div>
  );
}
