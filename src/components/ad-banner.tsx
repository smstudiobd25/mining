'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  position: string;
}

export function AdBanner({ position }: AdBannerProps) {
  const [ads, setAds] = useState<Array<Record<string, unknown>>>([]);
  const [currentAd, setCurrentAd] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/ads?position=${position}`)
      .then(res => res.json())
      .then(data => {
        setAds(data.ads || []);
        if (data.ads && data.ads.length > 0) {
          setCurrentAd(data.ads[Math.floor(Math.random() * data.ads.length)]);
        }
      })
      .catch(() => {});
  }, [position]);

  if (!currentAd) return null;

  // Custom HTML ad (for AdSense, etc.)
  if (currentAd.adType === 'custom_html' && currentAd.htmlCode) {
    return (
      <div className="w-full rounded-xl overflow-hidden border border-border/30">
        <div dangerouslySetInnerHTML={{ __html: currentAd.htmlCode as string }} />
      </div>
    );
  }

  // Image + link banner
  if (currentAd.imageUrl) {
    return (
      <a
        href={currentAd.linkUrl as string || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-xl overflow-hidden border border-border/30 hover:border-primary/30 transition-colors"
      >
        <img
          src={currentAd.imageUrl as string}
          alt={currentAd.title as string || 'Advertisement'}
          className="w-full h-auto object-cover"
        />
      </a>
    );
  }

  // Default placeholder banner
  return (
    <a
      href={currentAd.linkUrl as string || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-xl p-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/10 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{currentAd.title as string || 'Nexora Network'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Powered by Nexora Ads</p>
        </div>
        <ExternalLink className="w-4 h-4 text-primary" />
      </div>
    </a>
  );
}
