"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Upload, Brain, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Collection",
    description: "Scan or import your cards using our AI-powered recognition system. Support for photos, CSV imports, and manual entry.",
    color: "text-blue-500"
  },
  {
    number: "02",
    icon: Brain,
    title: "Get Insights",
    description: "Receive AI-powered analytics, valuations, and market insights to understand your collection's true potential.",
    color: "text-purple-500"
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Track Performance",
    description: "Monitor your portfolio growth, track price changes, and make data-driven decisions to maximize your returns.",
    color: "text-green-500"
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Get started in three simple steps. Our platform makes it easy to manage and grow your TCG collection.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent transform -translate-y-1/2 z-0" />
          
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="h-full text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="relative mb-4 sm:mb-6">
                      {/* Step number background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xs sm:text-sm font-bold text-primary">{step.number}</span>
                      </div>
                    </div>
                    
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${step.color}`} />
                    </div>
                    
                    <CardTitle className="text-lg sm:text-xl font-semibold mb-2">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs sm:text-sm leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to get started?</h3>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                Join thousands of collectors who are already using Card Flux to manage their collections.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm sm:text-base">
                  Start Free Trial
                </button>
                <button className="px-6 sm:px-8 py-2.5 sm:py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors text-sm sm:text-base">
                  Watch Demo
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
} 