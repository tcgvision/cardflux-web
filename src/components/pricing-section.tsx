"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { WaitlistModal } from "~/components/waitlist-modal";
import { Check, Star, Gift } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small collectible stores",
    price: { monthly: 0, annual: 0 },
    features: [
      "Up to 500 products",
      "Basic inventory management",
      "Simple POS system",
      "Email support",
      "Basic analytics"
    ],
    popular: false,
    cta: "Get Started",
    color: "border-gray-200"
  },
  {
    name: "Professional",
    description: "For growing collectible businesses",
    price: { monthly: 29, annual: 24 },
    features: [
      "Unlimited products",
      "AI-powered card scanning",
      "Multi-category POS",
      "Advanced analytics",
      "Customer management",
      "Priority support",
      "Local product finder"
    ],
    popular: true,
    cta: "Start Free Trial",
    color: "border-primary"
  },
  {
    name: "Enterprise",
    description: "For established collectible chains",
    price: { monthly: 79, annual: 64 },
    features: [
      "Everything in Professional",
      "Multi-location support",
      "Advanced integrations",
      "Custom reporting",
      "Dedicated support",
      "White-label options",
      "SLA guarantee"
    ],
    popular: false,
    cta: "Contact Sales",
    color: "border-slate-200"
  }
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const handleJoinWaitlist = () => {
    setIsWaitlistOpen(true);
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-slate-100/20 dark:to-slate-800/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl mb-4">
            Simple, transparent pricing for collectible stores
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
            Choose the plan that best fits your collectible store. All plans include a 14-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className={`text-sm ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 20%
              </Badge>
            </span>
          </div>
        </motion.div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-primary to-slate-600 dark:to-slate-400 text-white border-0 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border/50'} bg-card/50 backdrop-blur-sm`}>
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-4 sm:mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl sm:text-4xl font-bold">
                        ${isAnnual ? plan.price.annual : plan.price.monthly}
                      </span>
                      {plan.price.monthly > 0 && (
                        <span className="text-muted-foreground ml-1 text-sm sm:text-base">
                          /month
                        </span>
                      )}
                    </div>
                    {plan.price.monthly > 0 && isAnnual && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Billed annually (${plan.price.annual * 12})
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 sm:gap-3">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80'} text-sm sm:text-base`}
                    variant={plan.popular ? 'default' : 'secondary'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Waitlist CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <div className="bg-gradient-to-r from-primary/10 to-slate-600/10 dark:to-slate-400/10 rounded-lg p-6 sm:p-8 max-w-2xl mx-auto">
            <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">
              <Gift className="mr-1 h-3 w-3" />
              Early Access
            </Badge>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Want to be first in line?
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-4">
              Join our waitlist and get exclusive early access with a 10% launch discount when CardFlux goes live.
            </p>
            <Button 
              onClick={handleJoinWaitlist}
              variant="outline"
              className="group"
            >
              <Gift className="mr-2 h-4 w-4" />
              Join the Waitlist
            </Button>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="text-muted-foreground text-sm sm:text-base">
            Questions? <a href="/contact" className="text-primary hover:underline">Contact our sales team</a>
          </p>
        </motion.div>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal 
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        source="pricing_page"
      />
    </section>
  );
} 