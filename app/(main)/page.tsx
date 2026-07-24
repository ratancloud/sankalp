import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  PlayCircle,
  Zap,
  ShieldCheck,
  BarChart3,
  Smartphone,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div aria-hidden="true" className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(#ddd7f7_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1e1535_1px,transparent_1px)] opacity-50" />
          <div className="absolute top-0 z-0 h-screen w-screen bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,oklch(0.44_0.22_275/0.12),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,oklch(0.68_0.20_278/0.25),transparent)]" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Announcement Pill */}
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 mb-8 backdrop-blur-md transition-colors hover:bg-primary/10">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            <span className="text-sm font-medium text-primary">v1.0 is now live</span>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
            Reclaim your time. <br className="hidden md:block" />
            <span className="bg-linear-to-r from-sky-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
              Conquer your day.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            Time Arena isn&apos;t just a todo list. It&apos;s a command center for your productivity. 
            Track tasks, analyze sessions, and stay focused with zero distractions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 rounded-full px-8 text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30" asChild>
              <Link href="/signup">
                Start for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-full px-8 text-base bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-muted/50 transition-all" asChild>
              <Link href="/about">
                <PlayCircle className="mr-2 h-5 w-5" />
                See how it works
              </Link>
            </Button>
          </div>

          {/* Hero Visual Mockup */}
          <div className="relative mx-auto mt-16 max-w-5xl lg:mt-24 group">
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary/30 to-indigo-500/30 opacity-30 blur-2xl transition duration-1000 group-hover:opacity-50 group-hover:duration-200" />
            <div className="relative rounded-xl border bg-background/50 p-2 shadow-2xl backdrop-blur-sm ring-1 ring-white/10 lg:rounded-2xl lg:p-4">
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SOCIAL PROOF ==================== */}
      <section className="py-12 border-y bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-muted-foreground mb-8 uppercase tracking-widest">
            Trusted by productive teams everywhere
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-75">
             {/* Simple Text Placeholders for Logos (Replace with SVGs if you have them) */}
             <span className="text-xl font-bold flex items-center gap-2"><Globe className="h-5 w-5" /> Acme Corp</span>
             <span className="text-xl font-bold flex items-center gap-2"><Zap className="h-5 w-5" /> BoltShift</span>
             <span className="text-xl font-bold flex items-center gap-2"><Terminal className="h-5 w-5" /> DevFlow</span>
             <span className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> SecureTech</span>
          </div>
        </div>
      </section>

      {/* ==================== BENTO FEATURES GRID ==================== */}
      <section className="py-24 relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;ve stripped away the clutter and left only the tools that actually help you get things done.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="md:col-span-2 bg-linear-to-br from-background to-muted/20 border-border/50 transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Real-time Analytics</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Visualize your productivity peaks. Understand exactly where your time goes with detailed daily and weekly breakdowns.
                </p>
                {/* Mini Mockup for Chart */}
                <div className="h-32 w-full rounded-lg bg-background border border-dashed flex items-end justify-around p-4 pb-0 gap-2 opacity-70">
                   {[40, 70, 50, 90, 60, 80].map((h, i) => (
                     <div key={i} style={{ height: `${h}%` }} className="w-full bg-blue-500/20 rounded-t-sm" />
                   ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-linear-to-r from-background to-muted/20 border-border/50 transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground flex-1">
                  Built on the edge with Next.js 15. Tasks load instantly, syncing happens in the background. Zero lag.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-linear-to-br from-background to-muted/20 border-border/50 transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="h-12 w-12 rounded-lg bg-violet-500/10 dark:bg-violet-500/15 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Enterprise Secure</h3>
                <p className="text-muted-foreground flex-1">
                  Bank-grade encryption for your data. Session management, secure auth, and strict privacy controls.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="md:col-span-2 bg-linear-to-br from-background to-muted/20 border-border/50 transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-8">
                 <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                      <div className="h-12 w-12 rounded-lg bg-orange-500/10 dark:bg-orange-500/15 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
                        <Smartphone className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Mobile First Design</h3>
                      <p className="text-muted-foreground text-lg">
                        Manage your tasks on the go. Our responsive PWA interface feels like a native app on iOS and Android.
                      </p>
                    </div>
                    <div className="flex-1 w-full max-w-xs">
                       <div className="aspect-3/4 rounded-xl border-4 border-muted bg-background p-3 shadow-inner">
                          <div className="space-y-3">
                             <div className="h-8 w-8 rounded-full bg-primary/20" />
                             <div className="h-4 w-full rounded bg-muted" />
                             <div className="h-4 w-2/3 rounded bg-muted" />
                             <div className="mt-8 space-y-2">
                                <div className="h-10 w-full rounded-lg bg-muted/30 border" />
                                <div className="h-10 w-full rounded-lg bg-muted/30 border" />
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-20 text-center shadow-2xl sm:px-12 sm:py-24">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_0%,transparent_60%)] pointer-events-none" />
            
            <h2 className="relative mb-6 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
              Ready to master your time?
            </h2>
            <p className="relative mb-10 mx-auto max-w-xl text-lg text-primary-foreground/80">
              Join thousands of users who have switched to Time Arena for a cleaner, faster, and more focused workflow.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="h-14 w-full sm:w-auto rounded-full px-8 text-base font-bold" asChild>
                <Link href="/signup">Get Started for Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 w-full sm:w-auto rounded-full px-8 text-base border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground bg-transparent" asChild>
                <Link href="/contact-us">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- CSS-Only Dashboard Mockup (Refined) ---
function HeroMockup() {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border bg-background shadow-sm">
      {/* Mock Header */}
      <div className="flex h-12 items-center justify-between border-b bg-muted/20 px-4">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400/80" />
          <div className="h-3 w-3 rounded-full bg-amber-400/80" />
          <div className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <div className="hidden sm:block h-6 w-1/3 rounded-full bg-muted/50" />
        <div className="h-8 w-8 rounded-full bg-primary/20" />
      </div>
      
      {/* Mock Body */}
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="hidden w-64 border-r bg-muted/5 p-4 md:block">
          <div className="space-y-4">
             <div className="h-8 w-full rounded-md bg-primary/10" />
             <div className="space-y-2 pt-4">
               <div className="h-4 w-3/4 rounded bg-muted" />
               <div className="h-4 w-1/2 rounded bg-muted" />
               <div className="h-4 w-5/6 rounded bg-muted" />
             </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="h-10 w-48 rounded-lg bg-muted/50" />
            <div className="h-10 w-24 rounded-lg bg-primary" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
             {[1, 2, 3].map((i) => (
               <div key={i} className="rounded-xl border bg-card p-5 shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10" />
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                 </div>
                 <div className="h-4 w-12 rounded bg-muted mb-2" />
                 <div className="h-6 w-20 rounded bg-foreground/10" />
               </div>
             ))}
          </div>

          <div className="rounded-xl border border-dashed bg-muted/10 p-12 flex flex-col items-center justify-center text-muted-foreground gap-4">
             <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
                <Terminal className="h-8 w-8 opacity-40" />
             </div>
             <div className="text-center space-y-2">
                <div className="h-4 w-32 bg-muted mx-auto rounded" />
                <div className="h-3 w-48 bg-muted/50 mx-auto rounded" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}