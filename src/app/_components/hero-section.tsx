"use client";

import { motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth/sign-up");
  };

  const handleLearnMore = () => {
    router.push("/learn-more");
  };

  return (
    <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      {/* Decorative borders */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-primary to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-primary to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>
      
      <div className="px-4 py-10 md:py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 mb-8 flex justify-center"
        >
          <div className="inline-flex items-center rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span>AI-Powered TCG Management Platform</span>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="relative z-10 mb-6 flex justify-center"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
              Scan. Sync. Sell.
            </h2>
          </div>
        </motion.div>

        {/* Main heading with word animation */}
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {"Streamline your TCG business with intelligent automation"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1 + 0.4,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.6 }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          From scanning cards to syncing inventory and maximizing sales - CardFlux handles everything. 
          Built for modern TCG shops and collectors who want to scale efficiently.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.4 }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button 
            size="lg" 
            className="group w-60 transform transition-all duration-300 hover:-translate-y-0.5"
            onClick={handleGetStarted}
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="w-60 transform transition-all duration-300 hover:-translate-y-0.5"
            onClick={handleLearnMore}
          >
            Watch Demo
          </Button>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.6 }}
          className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-600 dark:text-neutral-400"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Instant AI Scanning</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span>Real-time Pricing</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Smart Analytics</span>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.8 }}
          className="relative z-10 mt-20 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
            <div className="aspect-[16/9] h-auto w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎴</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">CardFlux Dashboard</h3>
                <p className="text-muted-foreground">AI-powered card recognition and inventory management</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 2.0 }}
          className="relative z-10 mt-16 grid grid-cols-2 gap-8 border-t border-border/40 pt-8 sm:grid-cols-4"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">99%</div>
            <div className="text-sm text-muted-foreground">Recognition Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">5k+</div>
            <div className="text-sm text-muted-foreground">Cards Supported</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">24/7</div>
            <div className="text-sm text-muted-foreground">Price Updates</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">500+</div>
            <div className="text-sm text-muted-foreground">Happy Shops</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 