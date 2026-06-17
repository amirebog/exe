import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Vertical layout guide lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mx-auto hidden max-w-[1400px] md:block"
      >
        <div className="absolute inset-y-0 left-1/4 w-px bg-border/70" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
        <div className="absolute inset-y-0 left-3/4 w-px bg-border/70" />
        <div className="absolute inset-y-0 left-4 w-px bg-border/40" />
        <div className="absolute inset-y-0 right-4 w-px bg-border/40" />
      </div>

      {/* Top horizontal rule */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[120px] h-px bg-border/60"
      />

      <Navbar />
      <Hero />

      <Footer />
    </main>
  )
}
