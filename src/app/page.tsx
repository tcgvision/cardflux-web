"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { HeroParallax } from "~/components/ui/hero-parallax";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/get-started");
  };

  const products = [
    {
      title: "Dashboard",
      thumbnail: "/landing-page-images/dash.png",
    },
    {
      title: "Hero",
      thumbnail: "/landing-page-images/hero.png",
    },
    {
      title: "Pricing",
      thumbnail: "/landing-page-images/pricing.png",
    },
  ];
  return (
    <div className="flex min-h-screen flex-col">
      <HeroParallax products={products}></HeroParallax>
      {/* Hero Section */}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose TCG Vision?
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Everything you need to run your TCG business efficiently
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-bold">AI-Powered Scanning</h3>
            <p className="text-muted-foreground mt-2">
              Instantly identify cards and update inventory with our advanced AI
              technology
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-bold">Real-Time Pricing</h3>
            <p className="text-muted-foreground mt-2">
              Stay competitive with automatic price updates from major
              marketplaces
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-bold">Powerful Analytics</h3>
            <p className="text-muted-foreground mt-2">
              Make data-driven decisions with comprehensive sales and inventory
              insights
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
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
              <div className="bg-card rounded-lg border p-8">
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="text-muted-foreground mt-2">
                  For hobby shops and solo sellers
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>300 AI scans per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Up to 5,000 inventory items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Real-time pricing lookup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>CSV export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button className="mt-8 w-full" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>

              {/* Growth Plan */}
              <div className="bg-card rounded-lg border p-8">
                <h3 className="text-2xl font-bold">Growth</h3>
                <p className="text-muted-foreground mt-2">
                  For scaling TCG businesses
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$149</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Unlimited AI scans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Unlimited inventory items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
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
              <div className="bg-card rounded-lg border p-8">
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="text-muted-foreground mt-2">
                  For hobby shops and solo sellers
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$39</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>300 AI scans per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Up to 5,000 inventory items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Real-time pricing lookup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>CSV export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button className="mt-8 w-full" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>

              {/* Growth Plan - Annual */}
              <div className="bg-card rounded-lg border p-8">
                <h3 className="text-2xl font-bold">Growth</h3>
                <p className="text-muted-foreground mt-2">
                  For scaling TCG businesses
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$119</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Unlimited AI scans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Unlimited inventory items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-primary h-4 w-4" />
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
