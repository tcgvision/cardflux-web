"use client";

import { motion } from "motion/react";
import { ThreeDCard } from "~/components/3d-card-demo";

const steps = [
  {
    number: "01",
    title: "Scan Instantly",
    description: "Point your camera at any TCG card. Our AI recognizes it in seconds—no typing, no searching, just instant identification.",
    imageSrc: "/cards/Scan_Instantly-Card_Flux-event.avif",
  },
  {
    number: "02",
    title: "Sync Everything",
    description: "Your inventory updates in real-time across POS, Discord bot, and mobile app. One scan, infinite connections.",
    imageSrc: "/cards/Sync_Everything-Card_Flux-event.avif",
  },
  {
    number: "03",
    title: "Sell Smarter",
    description: "Live pricing, automated Discord storefront, and analytics help you move inventory faster and maximize profits.",
    imageSrc: "/cards/Sell_Smarter-Card_Flux-event (1).avif",
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            ⚡ How CardFlux Works
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl mb-4">
            From Scan to Sale in{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Three Steps
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Transform your TCG business with AI-powered scanning, real-time sync, and automated selling tools.
          </p>
        </motion.div>

        <div className="relative">
          {/* Animated connecting flow */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent transform -translate-y-1/2 z-0">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/50 to-purple-500/50 h-px"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
              viewport={{ once: true }}
              style={{ transformOrigin: "left" }}
            />
          </div>
          
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-3 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <ThreeDCard 
                  imageSrc={step.imageSrc}
                  alt={step.title}
                  className="w-full max-w-[16rem]"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16 sm:mt-20"
        >
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border border-primary/20 rounded-xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
            <div className="relative">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-4">
                🚀 Ready to Transform Your TCG Business?
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                Join the CardFlux Revolution
              </h3>
              <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg max-w-2xl mx-auto">
                Start scanning, syncing, and selling smarter today. No setup fees, no long-term contracts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <motion.button 
                  className="px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-base sm:text-lg"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start 14-Day Free Trial
                </motion.button>
                <motion.button 
                  className="px-8 sm:px-10 py-3 sm:py-4 border-2 border-primary/30 rounded-xl font-semibold hover:bg-primary/10 transition-all duration-300 text-base sm:text-lg"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Watch Live Demo
                </motion.button>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-4">
                No credit card required • Cancel anytime • Setup in under 5 minutes
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}