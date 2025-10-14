import LegalLayout from "@/components/LegalLayout";
import { Card } from "@/components/ui/card";
import { Mail, User, Clock, Leaf } from "lucide-react";

export default function ContactGrievance() {
  return (
    <LegalLayout title="Contact / Grievance">
      <Card className="p-6 sm:p-8 shadow-lg border-green-100 dark:border-green-900/30">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📞</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-[Poppins] text-foreground mb-2">
                Contact / Grievance Page
              </h2>
              <p className="text-muted-foreground">
                For any queries, feedback, or grievance, please contact us:
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
            <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
              <Mail className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <a 
                  href="mailto:support@ebhangar.com" 
                  className="text-lg font-semibold text-green-600 dark:text-green-400 hover:underline"
                  data-testid="link-contact-email"
                >
                  support@ebhangar.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Grievance Officer</p>
                <p className="text-lg font-semibold text-foreground">eBhangar Support Team</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Response Time</p>
                <p className="text-lg font-semibold text-foreground">Within 48 business hours</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800/30">
              <div className="flex items-center gap-3 justify-center">
                <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                <p className="text-center text-foreground">
                  Thank you for helping us promote responsible recycling and a cleaner India 🌿
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </LegalLayout>
  );
}
