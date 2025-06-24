"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Check, ArrowRight, Sparkles, Users, Shield, Zap } from "lucide-react";

export default function GetStartedPage() {
  const router = useRouter();

  const handleSignUp = () => {
    router.push("/auth/sign-up");
  };

  const handleSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">TCG Vision</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleSignIn}>
                Sign in
              </Button>
              <Button onClick={handleSignUp}>
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Get Started with TCG Vision
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of TCG businesses using our platform to streamline their operations, 
            manage inventory, and grow their sales.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Quick Setup</CardTitle>
              <CardDescription>
                Get your shop up and running in minutes with our intuitive onboarding process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Create your shop profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Set up your team</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Start scanning cards</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Invite team members and manage roles with granular permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Role-based access control</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Real-time collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Activity tracking</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Enterprise Security</CardTitle>
              <CardDescription>
                Bank-level security with SOC 2 compliance and data encryption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>End-to-end encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Regular security audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>GDPR compliance</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Transform Your TCG Business?</CardTitle>
              <CardDescription>
                Start your free trial today. No credit card required. Cancel anytime.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleSignUp} className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={handleSignIn}>
                  Sign in to Existing Account
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                By creating an account, you agree to our{" "}
                <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 