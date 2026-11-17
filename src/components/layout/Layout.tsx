import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CookieConsent from "@/components/CookieConsent";
import { AdSenseLoader } from "@/components/ads/AdSense";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdSenseLoader />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Layout;
