"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Layers,
  Zap,
  Target,
  Sparkles,
  Shield
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Collection Tracking",
    description: "Track your entire collection with AI-powered scanning and automatic categorization",
    color: "text-blue-500"
  },
  {
    icon: TrendingUp,
    title: "Price Analytics",
    description: "Real-time market data and trends to make informed buying and selling decisions",
    color: "text-green-500"
  },
  {
    icon: PieChart,
    title: "Portfolio Insights",
    description: "Detailed performance metrics and portfolio value tracking over time",
    color: "text-purple-500"
  },
  {
    icon: Layers,
    title: "Multi-TCG Support",
    description: "Support for OPTCG, Pokemon, Magic: The Gathering, Yu-Gi-Oh, and more",
    color: "text-orange-500"
  },
  {
    icon: Zap,
    title: "Instant Scanning",
    description: "Scan cards instantly with our advanced AI recognition technology",
    color: "text-yellow-500"
  },
  {
    icon: Target,
    title: "Smart Pricing",
    description: "Intelligent pricing suggestions based on market conditions and card condition",
    color: "text-red-500"
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Get personalized recommendations and market predictions powered by AI",
    color: "text-indigo-500"
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description: "Bank-level security with encrypted data storage and regular backups",
    color: "text-emerald-500"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl mb-4">
            Everything you need to manage your TCG collection
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            From scanning cards to tracking performance, Card Flux provides all the tools you need 
            to take your trading card game collection to the next level.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 