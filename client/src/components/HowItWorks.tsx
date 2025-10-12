import { Phone, Package, Truck } from "lucide-react";

const steps = [
  {
    icon: Phone,
    title: "Book Online",
    description: "Select items and schedule a pickup at your convenience"
  },
  {
    icon: Package,
    title: "Get Estimate",
    description: "Receive instant price quote based on current market rates"
  },
  {
    icon: Truck,
    title: "Pickup & Payment",
    description: "Our verified vendor collects and pays you on the spot"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-[Poppins] mb-3" data-testid="text-how-it-works-title">How It Works</h2>
          <p className="text-muted-foreground">Three simple steps to turn your scrap into cash</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="text-center" data-testid={`step-${idx}`}>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
