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
              <span className="font-display text-xl font-bold text-white">Green Scene</span>
            </div>
            <p className="text-sm text-garden-300 leading-relaxed">
              Professional garden maintenance across Northamptonshire. Domestic &amp; commercial contractors.
            </p>
            <a
              href="https://www.facebook.com/OriginalGreenScene/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-xs text-garden-400 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Follow us on Facebook
            </a>
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
              <li>📞 <a href="tel:01604701021" className="hover:text-white transition-colors">01604 701021</a></li>
              <li>📱 <a href="tel:07973187072" className="hover:text-white transition-colors">07973 187072</a></li>
              <li>✉️ <a href="mailto:info@greenscene.uk.net" className="hover:text-white transition-colors">info@greenscene.uk.net</a></li>
              <li>📍 East Hunsbury, Northampton, NN4 0SD</li>
            </ul>
            <Link href="/quote" className="mt-4 inline-block btn-primary py-2 text-xs">
              Get a Free Quote
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-garden-800 pt-6 text-center text-xs text-garden-500">
          © {new Date().getFullYear()} Green Scene Garden Maintenance · David Elkington · All rights reserved.
        </div>
      </div>
    </footer>
  );
}
