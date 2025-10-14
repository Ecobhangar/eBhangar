import LegalLayout from "@/components/LegalLayout";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <Card className="p-6 sm:p-8 shadow-lg border-green-100 dark:border-green-900/30">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-[Poppins] text-foreground mb-2">
                Privacy Policy
              </h2>
              <p className="text-muted-foreground">
                At <span className="text-green-600 dark:text-green-400 font-semibold">eBhangar</span>, your privacy matters.
              </p>
              <p className="text-foreground mt-2">
                We collect only necessary information such as your name, phone number, and address to schedule pickups.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              How we use your data:
            </h3>
            
            <div className="space-y-3">
              {[
                "To connect you with nearby scrap vendors.",
                "To notify you about pickup confirmations and updates.",
                "To improve service experience and security."
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3" data-testid={`use-${index}`}>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              We never:
            </h3>
            
            <div className="space-y-3">
              {[
                "Sell your personal information.",
                "Share your details with unrelated third parties."
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3" data-testid={`never-${index}`}>
                  <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
            <p className="text-foreground">
              For any privacy concerns, contact us at{" "}
              <a 
                href="mailto:support@ebhangar.com" 
                className="text-green-600 dark:text-green-400 font-semibold hover:underline"
                data-testid="link-privacy-email"
              >
                support@ebhangar.com
              </a>
            </p>
          </div>
        </div>
      </Card>
    </LegalLayout>
  );
}
