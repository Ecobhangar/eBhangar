import { Link } from "wouter";
import { Logo } from "./Logo";

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" data-testid="link-home">
              <div className="hover-elevate active-elevate-2 rounded-lg px-2 py-1 cursor-pointer">
                <Logo size="default" />
              </div>
            </Link>
            <div className="ml-auto">
              <h1 className="text-lg font-semibold text-foreground hidden sm:block">
                {title}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold font-[Poppins] text-foreground mb-6 sm:hidden">
          {title}
        </h1>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-card mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo size="small" />
              <span className="text-sm text-muted-foreground">
                © 2024 eBhangar. All rights reserved.
              </span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/legal/terms" data-testid="link-terms">
                <span className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                  Terms
                </span>
              </Link>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <Link href="/legal/privacy" data-testid="link-privacy">
                <span className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                  Privacy
                </span>
              </Link>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <Link href="/legal/disclaimer" data-testid="link-disclaimer">
                <span className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                  Disclaimer
                </span>
              </Link>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <Link href="/legal/vendor-policy" data-testid="link-vendor-policy">
                <span className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                  Vendor Policy
                </span>
              </Link>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <Link href="/legal/contact" data-testid="link-contact">
                <span className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                  Contact
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
