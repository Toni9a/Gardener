import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Green Scene — Garden Maintenance in Northamptonshire",
    template: "%s | Green Scene",
  },
  description:
    "Green Scene provides professional lawn restoration, hedge trimming, garden clean-up, and planting services across Northamptonshire. Domestic & commercial. Call 01604 701021.",
  keywords: ["green scene", "garden maintenance", "Northamptonshire", "lawn", "hedge trimming", "East Hunsbury", "Northampton gardener"],
  openGraph: {
    title: "Green Scene Garden Maintenance",
    description: "Professional garden maintenance in Northamptonshire · 01604 701021",
    type: "website",
    locale: "en_GB",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
