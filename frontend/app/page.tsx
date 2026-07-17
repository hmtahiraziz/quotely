import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/Button";
import {
  IconArrowRight,
  IconBolt,
  IconCode,
  IconDoc,
  IconPalette,
  IconPlus,
} from "@/components/ui/Icons";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav variant="marketing" />

      <main>
        <section className="relative mx-auto grid max-w-container items-center gap-16 overflow-hidden px-4 py-16 sm:px-10 md:py-28 lg:grid-cols-2">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 left-1/3 h-72 w-72 rounded-full bg-primary-fixed-dim/25 blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-start gap-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-3 py-1 font-display text-mono-label uppercase tracking-widest text-on-primary-fixed">
              <IconBolt size={14} />
              Instant Quoting Power
            </div>

            <h1 className="font-display text-display-md tracking-tight text-on-surface md:text-display-lg">
              Get an instant,{" "}
              <span className="text-primary">accurate quote</span> for your next
              project.
            </h1>

            <p className="max-w-[540px] text-body-lg text-on-surface-variant">
              Professional proposals for agencies and consultants — built in
              minutes with catalog pricing your clients can trust.
            </p>

            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link href="/quote" className="w-full sm:w-auto">
                <Button className="w-full px-10 py-5 text-headline-md sm:w-auto">
                  Get Started
                  <IconArrowRight size={20} />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full px-10 py-5 text-headline-md sm:w-auto"
                >
                  How it works
                </Button>
              </a>
            </div>

            <div className="mt-4 flex w-full items-center gap-4 border-t border-outline-variant/10 pt-8">
              <div className="flex -space-x-3">
                {[
                  { src: "/avatars/avatar-1.jpg", alt: "Maya Chen" },
                  { src: "/avatars/avatar-2.jpg", alt: "Jordan Blake" },
                  { src: "/avatars/avatar-3.jpg", alt: "Sofia Reyes" },
                ].map((person) => (
                  <img
                    key={person.src}
                    src={person.src}
                    alt={person.alt}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full border-2 border-surface object-cover"
                  />
                ))}
              </div>
              <p className="text-label-sm text-on-surface-variant">
                Trusted by teams who send{" "}
                <span className="font-semibold text-on-surface">
                  clear, scoped proposals
                </span>
                .
              </p>
            </div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md lg:max-w-none">
            <div className="animate-float rounded-xl border border-primary/20 bg-white p-6 shadow-card sm:p-8">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-headline-md text-on-surface">
                    Professional Package
                  </h3>
                  <p className="text-label-sm text-on-surface-variant">
                    Web Design · Marketing Site
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 font-display text-mono-label text-primary">
                  DRAFT
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-surface-container p-3">
                  <div className="flex items-center gap-3 text-primary">
                    <IconPalette size={18} />
                    <span className="text-label-sm text-on-surface">
                      UI/UX Design Phase
                    </span>
                  </div>
                  <span className="font-semibold text-on-surface">$2,400</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container p-3">
                  <div className="flex items-center gap-3 text-primary">
                    <IconCode size={18} />
                    <span className="text-label-sm text-on-surface">
                      Frontend Architecture
                    </span>
                  </div>
                  <span className="font-semibold text-on-surface">$4,500</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-primary p-3 text-on-primary">
                  <div className="flex items-center gap-3">
                    <IconDoc size={18} />
                    <span className="text-label-sm">Estimated Total</span>
                  </div>
                  <span className="font-display text-2xl font-semibold tracking-tight sm:text-price-xl">
                    $6,900
                  </span>
                </div>
              </div>

              <p className="mt-4 border-t border-outline-variant/10 pt-4 text-xs text-on-surface-variant">
                Pricing locked from your live catalog at proposal time.
              </p>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto max-w-container px-4 py-20 sm:px-10"
        >
          <div className="mb-10 max-w-xl">
            <h2 className="font-display text-headline-md text-on-surface md:text-display-md">
              How it works
            </h2>
            <p className="mt-3 text-body-md text-on-surface-variant">
              Four focused steps. Server-side pricing keeps every proposal
              honest.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                Icon: IconDoc,
                title: "Select",
                body: "Choose a service and package from your professional catalog.",
              },
              {
                Icon: IconPlus,
                title: "Customize",
                body: "Add service-specific extras and watch the estimate update live.",
              },
              {
                Icon: IconArrowRight,
                title: "Propose",
                body: "Submit once — we lock the price and you download the PDF.",
              },
            ].map((item) => (
              <div
                key={item.title}
                id={item.title === "Select" ? "features" : undefined}
                className="group rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                  <item.Icon size={22} />
                </div>
                <h3 className="mb-3 font-display text-headline-md text-on-surface">
                  {item.title}
                </h3>
                <p className="text-body-md text-on-surface-variant">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Link
        href="/quote"
        className="fixed bottom-6 right-6 z-40 inline-flex select-none items-center gap-2 rounded-full bg-primary px-5 py-3 text-label-sm text-on-primary shadow-primary transition-colors hover:bg-primary-hover"
      >
        <IconPlus size={18} />
        New Proposal
      </Link>
    </div>
  );
}
