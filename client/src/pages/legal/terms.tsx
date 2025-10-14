import LegalLayout from "@/components/LegalLayout";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <LegalLayout title="Terms & Conditions">
      <Card className="p-6 sm:p-8 shadow-lg border-green-100 dark:border-green-900/30">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📜</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-[Poppins] text-foreground mb-2">
                Terms & Conditions
              </h2>
              <p className="text-muted-foreground">
                Welcome to <span className="text-green-600 dark:text-green-400 font-semibold">eBhangar</span> — a digital platform that connects users with verified local scrap vendors for easy recycling and pickup services.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <p className="text-foreground mb-4">
              By using our app, you agree to the following terms:
            </p>
            
            <div className="space-y-3">
              {[
                "eBhangar is a digital intermediary; we do not buy or sell scrap directly.",
                "All scrap pickups are managed independently by third-party vendors.",
                "Users must provide accurate address and contact information for smooth pickup.",
                "Any payment disputes are to be resolved directly between the user and the vendor.",
                "eBhangar reserves the right to modify terms and services at any time."
              ].map((term, index) => (
                <div key={index} className="flex items-start gap-3" data-testid={`term-${index}`}>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{term}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Important:</h3>
                <p className="text-amber-800 dark:text-amber-300">
                  eBhangar will never demand payment or offer cash-for-scrap directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </LegalLayout>
  );
}
