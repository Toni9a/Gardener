import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-garden-900 text-white py-16 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Get In Touch</h1>
        <p className="mt-4 text-garden-200 text-lg max-w-xl mx-auto">
          We&apos;re based in Northamptonshire and would love to help with your garden.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Contact details */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-garden-900">Contact Details</h2>

            <div className="card p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="text-2xl">📞</div>
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <a href="tel:+441604000000" className="text-garden-700 hover:text-garden-900 text-lg font-medium">
                    01604 000 000
                  </a>
                  <p className="text-xs text-gray-400 mt-1">Mon–Sat, 8am–6pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-2xl">✉️</div>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <a href="mailto:info@gardenscene.co.uk" className="text-garden-700 hover:text-garden-900">
                    info@gardenscene.co.uk
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-2xl">📍</div>
                <div>
                  <p className="font-semibold text-gray-900">Service Area</p>
                  <p className="text-gray-600 leading-relaxed">
                    Northamptonshire, including Northampton, Kettering, Corby, Wellingborough, Daventry,
                    and surrounding villages.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Follow Our Work</h3>
              <p className="text-sm text-gray-600 mb-4">
                See our latest garden transformations on Facebook.
              </p>
              <a
                href="https://www.facebook.com/GardenScene"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                GardenScene on Facebook
              </a>
            </div>
          </div>

          {/* Quote CTA */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-garden-900">Ready to Get Started?</h2>

            <div className="card p-8 bg-garden-50 border-garden-200 text-center">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Request a Free Quote</h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Fill in our quick form with details about your garden. We&apos;ll review your information and
                get back to you within 24 hours with a no-obligation quote.
              </p>
              <Link href="/quote" className="btn-primary w-full">
                Get a Free Quote →
              </Link>
            </div>

            <div className="card p-8 bg-earth-50 border-earth-200 text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">See Your Garden Transformed</h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Upload a photo of your garden and our AI will show you similar transformations or
                generate a bespoke vision of what your garden could look like.
              </p>
              <Link href="/transform" className="btn-earth w-full">
                Try the Transformation Tool →
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Existing Client?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Access your Garden Buddy dashboard to track watering reminders and garden health scores.
              </p>
              <Link href="/garden-buddy" className="btn-secondary text-sm w-full text-center">
                Client Login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
