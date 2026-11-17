import { useEffect } from "react";

export const ADSENSE_CLIENT = "ca-pub-9457208945905981";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Loads the AdSense script once. Prefer Auto ads in AdSense until ad units are created.
 */
export const AdSenseLoader = () => {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const existing = document.querySelector(`script[data-ad-client="${ADSENSE_CLIENT}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.crossOrigin = "anonymous";
    script.dataset.adClient = ADSENSE_CLIENT;
    document.head.appendChild(script);
  }, []);

  return null;
};

interface AdUnitProps {
  slot?: string;
  format?: "auto" | "fluid" | "rectangle";
  className?: string;
}

/** Optional display unit once you create ad slots in AdSense. */
export const AdUnit = ({ slot, format = "auto", className }: AdUnitProps) => {
  useEffect(() => {
    if (!slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense may be blocked by extensions; ignore.
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <div className={className} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};
