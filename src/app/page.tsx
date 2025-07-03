"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { CardBackground } from "~/components/card-background";
import { LogoCarousel } from "~/components/logo-carousel";
import { FeaturesSection } from "~/components/features-section";
import { HowItWorksSection } from "~/components/how-it-works-section";
import { PricingSection } from "~/components/pricing-section";
import { Footer } from "~/components/footer";
import { WaitlistModal } from "~/components/waitlist-modal";
import { ArrowRight, Play, Sparkles, Zap, Target, Store, Users, Gift } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const handleGetStarted = () => {
    router.push("/get-started");
  };

  const handleWatchDemo = () => {
    router.push("/learn-more");
  };

  const handleJoinWaitlist = () => {
    setIsWaitlistOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-slate-100/20 dark:to-slate-800/20">
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
              <span>Complete Collectible Store Management Platform</span>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-4 sm:mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight md:text-3xl text-muted-foreground">
              Unified Commerce • Intelligent Automation • Community Focus
            </h2>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto max-w-5xl text-3xl sm:text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl mb-4 sm:mb-6 leading-tight"
          >
            The ultimate POS and inventory platform for{" "}
            <span className="bg-gradient-to-r from-primary to-slate-600 dark:to-slate-400 bg-clip-text text-transparent">
              collectible stores
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mx-auto max-w-3xl text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4 sm:px-0"
          >
            From trading cards to figures, comics to games - manage everything in one powerful platform. 
            TCG stores get specialized AI scanning and tournament features, while other collectible stores 
            get TCG capabilities as a bonus. Built for modern collectible retailers who want to scale efficiently.
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
              Start Free Trial
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
            <Button 
              variant="secondary" 
              size="lg"
              className="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg group w-full sm:w-auto"
              onClick={handleJoinWaitlist}
            >
              <Gift className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Join Waitlist
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
              <Store className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Unified Inventory</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>AI-Powered Scanning</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Smart Analytics</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Community Tools</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logo Carousel Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-slate-100/20 dark:to-slate-800/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Trusted by Collectible Stores Worldwide
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of collectible store owners who trust CardFlux to manage their inventory, 
              streamline operations, and grow their business.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <LogoCarousel 
              className="max-w-5xl mx-auto" 
              speed={25} 
              pauseOnHover={true}
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Footer */}
      <Footer />

      {/* Waitlist Modal */}
      <WaitlistModal 
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        source="landing_page"
      />
    </div>
  );
}
