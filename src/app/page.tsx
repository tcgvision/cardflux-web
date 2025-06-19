"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { HeroSection } from "./_components/hero-section";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/dashboard/sign-up");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <HeroSection />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose TCG Vision?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to run your TCG business efficiently
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-bold">AI-Powered Scanning</h3>
            <p className="mt-2 text-muted-foreground">
              Instantly identify cards and update inventory with our advanced AI technology
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-bold">Real-Time Pricing</h3>
            <p className="mt-2 text-muted-foreground">
              Stay competitive with automatic price updates from major marketplaces
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-bold">Powerful Analytics</h3>
            <p className="mt-2 text-muted-foreground">
              Make data-driven decisions with comprehensive sales and inventory insights
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that best fits your needs
          </p>
        </div>

        <Tabs defaultValue="monthly" className="mt-12">
          <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual (Save 20%)</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="mt-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Starter Plan */}
              <div className="rounded-lg border bg-card p-8">
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="mt-2 text-muted-foreground">For hobby shops and solo sellers</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>300 AI scans per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Up to 5,000 inventory items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Real-time pricing lookup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>CSV export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button className="mt-8 w-full" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>

              {/* Growth Plan */}
              <div className="rounded-lg border bg-card p-8">
                <h3 className="text-2xl font-bold">Growth</h3>
                <p className="mt-2 text-muted-foreground">For scaling TCG businesses</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$149</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Unlimited AI scans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Unlimited inventory items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="mt-8 w-full" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="annual" className="mt-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Starter Plan - Annual */}
              <div className="rounded-lg border bg-card p-8">
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="mt-2 text-muted-foreground">For hobby shops and solo sellers</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$39</span>
                  <span className="text-muted-foreground">/month</span>
                  <div className="text-sm text-primary">Save $120/year</div>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>300 AI scans per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Up to 5,000 inventory items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Real-time pricing lookup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>CSV export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button className="mt-8 w-full" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>

              {/* Growth Plan - Annual */}
              <div className="rounded-lg border bg-card p-8">
                <h3 className="text-2xl font-bold">Growth</h3>
                <p className="mt-2 text-muted-foreground">For scaling TCG businesses</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$119</span>
                  <span className="text-muted-foreground">/month</span>
                  <div className="text-sm text-primary">Save $360/year</div>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Unlimited AI scans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Unlimited inventory items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="mt-8 w-full" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
