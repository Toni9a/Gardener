import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { PortfolioEntry } from "@/types";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

async function getFeaturedProjects(): Promise<PortfolioEntry[]> {
  const { data } = await supabase
    .from("portfolio")
    .select("*")
    .order("display_order", { ascending: true })
    .limit(3);
  return data ?? [];
}

const services = [
  { icon: "🌿", title: "Lawn Restoration", desc: "From patchy and tired to lush and green." },
  { icon: "✂️", title: "Hedge Trimming", desc: "Precise shaping and overgrowth removal." },
  { icon: "🧹", title: "Garden Clean-Up", desc: "Full clearance, weeding, and tidying." },
  { icon: "🌸", title: "Planting & Flowers", desc: "Seasonal planting and flower bed design." },
];

export default async function HomePage() {
  const featured = await getFeaturedProjects();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-garden-900 via-garden-800 to-garden-700 text-white">
        <div className="absolute inset-0 opacity-10 bg-[url('/hero-pattern.svg')] bg-repeat" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 text-center">
          <p className="text-garden-300 text-sm font-semibold uppercase tracking-widest mb-4">
            Professional Garden Maintenance · Northamptonshire
          </p>
          <h1 className="font-display text-5xl font-bold text-white sm:text-6xl lg:text-7xl leading-tight">
            Your Garden,<br />
            <span className="text-garden-300">Transformed.</span>
          </h1>
          <p className="mt-6 text-lg text-garden-100 max-w-2xl mx-auto leading-relaxed">
            Green Scene brings neglected, tired gardens back to life. Lawn restoration, hedge trimming,
            full clean-ups, and beautiful planting — all across Northamptonshire.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="btn-earth text-base px-8 py-4">
              Get a Free Quote
            </Link>
            <Link href="/transform" className="btn-secondary border-white text-white hover:bg-white/10 text-base px-8 py-4">
              See Your Garden Transformed
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="section-heading">What We Do</h2>
            <p className="section-sub mx-auto">
              From a quick tidy to a full transformation — we handle every aspect of garden care.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ icon, title, desc }) => (
              <div key={title} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured work */}
      {featured.length > 0 && (
        <section className="py-20 bg-garden-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="section-heading">Recent Work</h2>
              <p className="section-sub mx-auto">
                Drag the slider to see the before and after.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((project) => (
                <div key={project.id} className="card overflow-hidden">
                  <BeforeAfterSlider
                    before={project.before_image}
                    after={project.after_image}
                    alt={project.title}
                  />
                  <div className="p-4">
                    <span className="inline-block rounded-full bg-garden-100 px-3 py-1 text-xs font-medium text-garden-700 capitalize mb-2">
                      {project.category.replace(/-/g, " ")}
                    </span>
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    {project.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/portfolio" className="btn-primary">
                View All Work
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA — Garden Transformation Tool */}
      <section className="py-20 bg-earth-50 border-y border-earth-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-earth-600 text-sm font-semibold uppercase tracking-widest mb-4">Powered by AI</p>
          <h2 className="section-heading">See What Your Garden Could Look Like</h2>
          <p className="section-sub mx-auto">
            Upload a photo of your garden and our AI will show you similar transformations we&apos;ve done
            — or generate a custom vision of what&apos;s possible.
          </p>
          <div className="mt-8">
            <Link href="/transform" className="btn-earth text-base px-10 py-4">
              Try the Garden Transformation Tool →
            </Link>
          </div>
        </div>
      </section>

      {/* Service area */}
      <section className="py-16 bg-white text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-3xl mb-4">📍</p>
          <h2 className="font-display text-2xl font-bold text-garden-900">Serving Northamptonshire</h2>
          <p className="mt-3 text-gray-600">
            We cover all areas across Northamptonshire including Northampton, Kettering, Corby,
            Wellingborough, Daventry, and surrounding villages.
          </p>
          <Link href="/contact" className="mt-6 inline-block btn-secondary">
            Check If We Cover Your Area
          </Link>
        </div>
      </section>
    </>
  );
}
