"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { CardBackground } from "~/components/card-background";
import { FeaturesSection } from "~/components/features-section";
import { HowItWorksSection } from "~/components/how-it-works-section";
import { PricingSection } from "~/components/pricing-section";
import { Footer } from "~/components/footer";
import { ArrowRight, Play, Sparkles, Zap, Target } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/get-started");
  };

  const handleWatchDemo = () => {
    router.push("/learn-more");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        {/* Card Background with Parallax */}
        <CardBackground className="absolute inset-0" />
        
        {/* Content Overlay */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center rounded-full border bg-background/50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm backdrop-blur-sm mb-4 sm:mb-6">
              <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>AI-Powered TCG Management Platform</span>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-4 sm:mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary md:text-3xl">
              Scan. Sync. Sell.
            </h2>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto max-w-4xl text-3xl sm:text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl mb-4 sm:mb-6 leading-tight"
          >
            Advanced analytics for your{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Trading Card Game
            </span>{" "}
            collection
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4 sm:px-0"
          >
            From scanning cards to syncing inventory and maximizing sales - Card Flux handles everything. 
            Built for modern TCG shops and collectors who want to scale efficiently.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0"
          >
            <Button 
              size="lg" 
              className="group px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg w-full sm:w-auto"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg group w-full sm:w-auto"
              onClick={handleWatchDemo}
            >
              <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground px-4 sm:px-0"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Instant AI Scanning</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Real-time Pricing</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Smart Analytics</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2.5 sm:h-3 bg-muted-foreground/50 rounded-full mt-1.5 sm:mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
