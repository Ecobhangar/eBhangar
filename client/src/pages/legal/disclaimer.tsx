import LegalLayout from "@/components/LegalLayout";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Disclaimer() {
  return (
    <LegalLayout title="Disclaimer">
      <Card className="p-6 sm:p-8 shadow-lg border-green-100 dark:border-green-900/30">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚖️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-[Poppins] text-foreground mb-2">
                Disclaimer
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-foreground">
            <p>
              <span className="text-green-600 dark:text-green-400 font-semibold">eBhangar</span> acts solely as a digital intermediary connecting users with independent scrap collectors.
            </p>
            
            <p>
              The platform does not directly buy, sell, or store any scrap materials.
            </p>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-amber-900 dark:text-amber-200">
                    Vendors are responsible for the quality of service, pricing, and payments.
                  </p>
                  <p className="text-amber-900 dark:text-amber-200">
                    eBhangar holds no liability for disputes or miscommunication between parties.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <p className="text-center text-muted-foreground italic">
                Use of the platform indicates acceptance of this disclaimer.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </LegalLayout>
  );
}
