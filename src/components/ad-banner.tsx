'use client';

import React from 'react';

interface AdBannerProps {
  position: string;
}

export function AdBanner({ position }: AdBannerProps) {
  const [ads, setAds] = React.useState<Array<{
    id: string;
    title: string;
    htmlCode: string;
    imageUrl: string;
    linkUrl: string;
    adType: string;
  }> | null>(null);

  React.useEffect(() => {
    fetch(`/api/ads?position=${position}`)
      .then((res) => res.json())
      .then((data) => setAds(data.ads || []))
      .catch(() => setAds([]));
  }, [position]);

  if (!ads || ads.length === 0) return null;

  const ad = ads[0];

  if (ad.htmlCode) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        dangerouslySetInnerHTML={{ __html: ad.htmlCode }}
      />
    );
  }

  if (ad.imageUrl) {
    return (
      <a
        href={ad.linkUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl overflow-hidden"
      >
        <img src={ad.imageUrl} alt={ad.title || 'Advertisement'} className="w-full" />
      </a>
    );
  }

  return null;
}
