import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-garden-100 bg-garden-950 text-garden-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌿</span>
              <span className="font-display text-xl font-bold text-white">GardenScene</span>
            </div>
            <p className="text-sm text-garden-300 leading-relaxed">
              Professional garden services across Northamptonshire. Transforming outdoor spaces since day one.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-garden-300">
              <li><Link href="/portfolio?category=lawn-restoration" className="hover:text-white transition-colors">Lawn Restoration</Link></li>
              <li><Link href="/portfolio?category=hedge-trimming" className="hover:text-white transition-colors">Hedge Trimming</Link></li>
              <li><Link href="/portfolio?category=garden-clean-up" className="hover:text-white transition-colors">Garden Clean-Up</Link></li>
              <li><Link href="/portfolio?category=planting-flowers" className="hover:text-white transition-colors">Planting &amp; Flowers</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-garden-300">
              <li>📞 <a href="tel:+441604000000" className="hover:text-white transition-colors">01604 000 000</a></li>
              <li>✉️ <a href="mailto:info@gardenscene.co.uk" className="hover:text-white transition-colors">info@gardenscene.co.uk</a></li>
              <li>📍 Northamptonshire, UK</li>
            </ul>
            <Link href="/quote" className="mt-4 inline-block btn-primary py-2 text-xs">
              Get a Free Quote
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-garden-800 pt-6 text-center text-xs text-garden-500">
          © {new Date().getFullYear()} GardenScene. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
