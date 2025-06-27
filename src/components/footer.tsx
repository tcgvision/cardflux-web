"use client";

import { motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Logo } from "~/components/ui/logo";
import { 
  Twitter, 
  Github, 
  Linkedin, 
  Mail, 
  ArrowRight,
  Heart
} from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "API", href: "/api" },
    { name: "Integrations", href: "/integrations" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Documentation", href: "/docs" },
    { name: "Status", href: "/status" },
    { name: "Community", href: "/community" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
  ],
};

const socialLinks = [
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "Email", href: "mailto:hello@cardflux.com", icon: Mail },
];

// const tcgLogos = [
//   { name: "One Piece TCG", logo: "🎴" },
//   { name: "Pokemon TCG", logo: "⚡" },
//   { name: "Magic: The Gathering", logo: "🔥" },
//   { name: "Yu-Gi-Oh!", logo: "🐉" },
// ];

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-background to-slate-100/50 dark:to-slate-800/50 border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Logo width={32} height={32} />
                <h3 className="text-xl font-bold">CardFlux</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-md">
                The ultimate platform for managing and analyzing your trading card game collection. 
                Scan, sync, and sell with confidence.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer Links - All columns in single row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="flex flex-wrap gap-8">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category} className="min-w-[120px]">
                  <h4 className="font-semibold mb-3 capitalize text-sm">{category}</h4>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-slate-500/10 dark:to-slate-400/10 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Stay updated</h3>
                <p className="text-muted-foreground mb-6">
                  Get the latest updates on new features, market insights, and TCG news.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1"
                  />
                  <Button className="group">
                    Subscribe
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-border/50"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025 CardFlux. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500" /> for the TCG community
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
} 