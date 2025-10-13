import { Phone, Package, Truck } from "lucide-react";

const steps = [
  {
    icon: Phone,
    title: "Book Online",
    description: "Select items and schedule a pickup at your convenience",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Package,
    title: "Get Estimate",
    description: "Receive instant price quote based on current market rates",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    icon: Truck,
    title: "Pickup & Payment",
    description: "Our verified vendor collects and pays you on the spot",
    gradient: "from-teal-500 to-cyan-500"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-background via-green-50/30 to-background dark:from-background dark:via-green-950/10 dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-[Poppins] mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" data-testid="text-how-it-works-title">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to turn your scrap into cash
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="group relative"
              data-testid={`step-${idx}`}
            >
              {/* Card with Hover Effect */}
              <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {idx + 1}
                </div>

                {/* Icon with Gradient Background */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-center font-[Poppins]">{step.title}</h3>
                <p className="text-muted-foreground text-center leading-relaxed">{step.description}</p>
              </div>

              {/* Connecting Line (hidden on last item) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-green-300 to-emerald-300 dark:from-green-700 dark:to-emerald-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
