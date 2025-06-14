import { Inter } from "next/font/google";
import { Navbar } from "~/app/_components/navbar";
import "~/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TCG Vision - Enterprise",
  description: "TCG Vision Enterprise Dashboard",
};

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 