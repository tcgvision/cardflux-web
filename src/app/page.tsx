import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
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
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
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
                <Button className="mt-8 w-full">Get Started</Button>
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
                    <span>Unlimited inventory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Up to 5 team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Discord bot integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Role-based access control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>50% off website development</span>
                  </li>
                </ul>
                <Button className="mt-8 w-full">Get Started</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="annual" className="mt-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Starter Plan Annual */}
              <div className="rounded-lg border bg-card p-8">
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="mt-2 text-muted-foreground">For hobby shops and solo sellers</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$490</span>
                  <span className="text-muted-foreground">/year</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Save 2 months</p>
                {/* Same features as monthly */}
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
                <Button className="mt-8 w-full">Get Started</Button>
              </div>

              {/* Growth Plan Annual */}
              <div className="rounded-lg border bg-card p-8">
                <h3 className="text-2xl font-bold">Growth</h3>
                <p className="mt-2 text-muted-foreground">For scaling TCG businesses</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$1,490</span>
                  <span className="text-muted-foreground">/year</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Save 2 months</p>
                {/* Same features as monthly */}
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Unlimited AI scans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Unlimited inventory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Up to 5 team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Discord bot integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Role-based access control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>50% off website development</span>
                  </li>
                </ul>
                <Button className="mt-8 w-full">Get Started</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Separator className="my-8" />

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about TCG Vision
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is TCG Vision?</AccordionTrigger>
              <AccordionContent>
                TCG Vision is a modern inventory management system designed specifically for trading card game shops. It combines AI-powered scanning, real-time pricing, and powerful analytics to help you manage your inventory efficiently.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How does the AI scanning work?</AccordionTrigger>
              <AccordionContent>
                Our AI scanning technology uses advanced computer vision to quickly identify and catalog your cards. Simply take a photo of your cards, and our system will automatically identify them and add them to your inventory.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Can I upgrade my plan later?</AccordionTrigger>
              <AccordionContent>
                Yes, you can upgrade your plan at any time. When you upgrade, you&apos;ll only be charged the prorated difference for the remaining time in your billing cycle.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>What kind of support do you offer?</AccordionTrigger>
              <AccordionContent>
                Starter plan users receive email support, while Growth plan users get priority support with dedicated Slack/Zoom access. Our support team is available to help you with any questions or issues you may have.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>How does the Discord bot integration work?</AccordionTrigger>
              <AccordionContent>
                The Discord bot allows you to manage your inventory directly from your Discord server. You can check prices, update inventory, and even process sales without leaving Discord. This feature is available exclusively on the Growth plan.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
