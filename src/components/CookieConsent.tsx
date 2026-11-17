import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "tcd-cookie-consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore storage failures (private mode).
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[60] border-t border-border bg-card/95 backdrop-blur p-4 shadow-lg"
    >
      <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground max-w-3xl">
          We use cookies and similar technologies—including Google AdSense cookies—to serve ads,
          measure traffic, and improve this site. See our{" "}
          <Link to="/privacy-policy" className="underline text-foreground hover:text-gold">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-foreground hover:text-gold"
          >
            Google Ads Settings
          </a>{" "}
          to manage personalized ads.
        </p>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => save("rejected")}>
            Reject non-essential
          </Button>
          <Button variant="navy" size="sm" onClick={() => save("accepted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
