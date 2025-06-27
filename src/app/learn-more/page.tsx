"use client";

import { Button } from "~/components/ui/button";
import { ArrowRight, Check, Zap, LineChart, Scan } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LearnMore() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-background">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Discover Card Flux
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-muted-foreground">
              The all-in-one solution for modern TCG businesses. Learn how we&apos;re revolutionizing card shop management.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-12 md:grid-cols-2">
          {/* AI Scanning */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Scan className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">AI-Powered Scanning</h3>
            </div>
            <p className="text-muted-foreground">
              Our advanced AI technology instantly identifies cards from photos, eliminating manual data entry and reducing errors.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Instant card recognition</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Condition assessment</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Batch scanning support</span>
              </li>
            </ul>
          </div>

          {/* Real-Time Pricing */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Real-Time Pricing</h3>
            </div>
            <p className="text-muted-foreground">
              Stay competitive with automatic price updates from major marketplaces and historical price tracking.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Live market prices</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Price history tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Custom pricing rules</span>
              </li>
            </ul>
          </div>

          {/* Analytics */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Powerful Analytics</h3>
            </div>
            <p className="text-muted-foreground">
              Make data-driven decisions with comprehensive insights into your inventory, sales, and market trends.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Sales performance tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Inventory value analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Market trend insights</span>
              </li>
            </ul>
          </div>

          {/* Team Management */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Team Management</h3>
            </div>
            <p className="text-muted-foreground">
              Streamline your operations with role-based access control and team collaboration features.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Role-based permissions</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Activity tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Team performance metrics</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-3xl font-bold">Ready to Transform Your TCG Business?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join the growing community of Card Flux users and take your business to the next level.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" className="group" onClick={() => router.push("/create-shop")}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 