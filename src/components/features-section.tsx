"use client";

import { motion } from "motion/react";
import { cn } from "~/lib/utils";
import { 
  Camera,
  TrendingUp,
  BarChart3,
  Layers,
  Zap,
  Target,
  Sparkles,
  Shield,
  Smartphone,
  Database,
  Globe,
  Users,
  Store,
  Package,
  Search,
  CreditCard
} from "lucide-react";

const features = [
  {
    title: "Unified Inventory Management",
    description: "Manage all your products - cards, figures, comics, games, and more - in one centralized system.",
    icon: <Store className="w-6 h-6" />,
  },
  {
    title: "AI-Powered Card Scanning",
    description: "Instantly scan and identify TCG cards with our advanced computer vision technology.",
    icon: <Camera className="w-6 h-6" />,
  },
  {
    title: "Multi-Category POS",
    description: "Fast, seamless checkout for any product type with integrated payment processing.",
    icon: <CreditCard className="w-6 h-6" />,
  },
  {
    title: "Smart Analytics",
    description: "Cross-category insights and performance metrics to optimize your entire business.",
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    title: "Local Product Finder",
    description: "Let customers search your inventory in real-time across all product categories.",
    icon: <Search className="w-6 h-6" />,
  },
  {
    title: "Condition Tracking",
    description: "Track condition and value for collectible items with specialized grading systems.",
    icon: <Package className="w-6 h-6" />,
  },
  {
    title: "Community Tools",
    description: "Build customer loyalty with wishlists, tournaments, and engagement features.",
    icon: <Users className="w-6 h-6" />,
  },
  {
    title: "Secure & Scalable",
    description: "Bank-level security with cloud-based infrastructure that grows with your business.",
    icon: <Shield className="w-6 h-6" />,
  },
];

export function FeaturesSection() {
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
            Universal platform with collectible superpowers
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
            CardFlux combines the power of unified inventory management with specialized features for collectible stores. 
            TCG stores get AI scanning and tournament tools, while other stores get TCG capabilities as a bonus.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4 || index === 8) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800",
        index >= 4 && index < 8 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-slate-100 dark:from-slate-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && index < 8 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-slate-100 dark:from-slate-800 to-transparent pointer-events-none" />
      )}
      {index >= 8 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-slate-100 dark:from-slate-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-slate-600 dark:group-hover/feature:bg-slate-400 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </motion.div>
  );
}; 