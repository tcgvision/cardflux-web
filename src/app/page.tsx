"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/get-started");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-background">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background/40" />
        
        {/* Content */}
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-sm backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span>AI-Powered TCG Management</span>
            </div>

            {/* Main heading */}
            <h1 className="mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Modern TCG Inventory Management
            </h1>

            {/* Subheading */}
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-muted-foreground">
              Streamline your card shop operations with AI-powered scanning, real-time pricing, and powerful analytics.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="group" onClick={handleGetStarted}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push("/learn-more")}>
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-8 border-t border-border/40 pt-8 sm:grid-cols-4">
              <div>
                <div className="text-3xl font-bold">300+</div>
                <div className="text-sm text-muted-foreground">Daily Scans</div>
              </div>
              <div>
                <div className="text-3xl font-bold">5k+</div>
                <div className="text-sm text-muted-foreground">Cards Tracked</div>
              </div>
              <div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-muted-foreground">Price Updates</div>
              </div>
              <div>
                <div className="text-3xl font-bold">99%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
          </div>
        </div>
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
