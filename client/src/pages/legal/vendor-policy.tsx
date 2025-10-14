import LegalLayout from "@/components/LegalLayout";
import { Card } from "@/components/ui/card";
import { CheckCircle, ShieldAlert, Handshake } from "lucide-react";

export default function VendorPolicy() {
  return (
    <LegalLayout title="Vendor Onboarding Policy">
      <Card className="p-6 sm:p-8 shadow-lg border-green-100 dark:border-green-900/30">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Handshake className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-[Poppins] text-foreground mb-2">
                Vendor Onboarding Policy
              </h2>
              <p className="text-muted-foreground">
                All vendors registered on <span className="text-green-600 dark:text-green-400 font-semibold">eBhangar</span> must comply with ethical recycling and transparent trade practices.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Vendor responsibilities:
            </h3>
            
            <div className="space-y-3">
              {[
                "Maintain cleanliness and safety during pickup.",
                "Offer fair and consistent pricing.",
                "Respect user privacy and time.",
                "Ensure legal disposal or recycling of collected scrap."
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3" data-testid={`responsibility-${index}`}>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-900 dark:text-red-200">
                eBhangar may suspend or remove vendors who fail to follow these policies.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </LegalLayout>
  );
}
