import { Recycle } from "lucide-react";

export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { box: "w-9 h-9", icon: "w-5 h-5" },
    default: { box: "w-10 h-10", icon: "w-6 h-6" },
    large: { box: "w-12 h-12", icon: "w-7 h-7" }
  };

  const { box, icon } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className={`${box} rounded-xl bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 relative overflow-hidden group`}>
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        {/* Recycle icon with animation */}
        <Recycle className={`${icon} text-white relative z-10 group-hover:rotate-180 transition-transform duration-500`} />
      </div>
      <span className="text-xl font-bold font-[Poppins] bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">
        eBhangar
      </span>
    </div>
  );
}
