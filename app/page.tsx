import {
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Code2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFDFA] relative overflow-hidden flex flex-col justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 grid grid-cols-10 gap-4 p-4 opacity-[0.02] pointer-events-none">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="text-black rotate-12 font-black select-none">MON</div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-20 z-10">
        <div className="space-y-8 text-center">
          {/* Logo Section */}
          <div
            className={cn(
              "inline-flex items-center gap-3 px-6 py-3",
              "bg-white border-4 border-black rounded-2xl",
              "shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
              "hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)]",
              "hover:translate-y-[-4px]",
              "transition-all duration-200",
              "mb-8"
            )}
          >
            <div className="relative">
              <Zap size={48} className="text-purple-600 fill-purple-100" />
              <span className="absolute -top-1 -right-1 text-lg font-black">
                ⚡
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-black text-3xl tracking-tight">
                ParallelFlow
              </span>
              <span className="text-sm font-bold text-gray-500">Monad Workflow Builder</span>
            </div>
          </div>

          {/* Hero Section */}
          <h1 className="text-6xl sm:text-7xl font-black text-black max-w-4xl mx-auto leading-tight">
            Automate Monad Workflows in 1 Second ⚡
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-bold">
            Build, compile, and execute parallel transaction pipelines on Monad Testnet through a drag-and-drop workflow visualizer. No complex coding required!
          </p>

          {/* CTA Button */}
          <div className="flex justify-center gap-4 pt-8">
            <Link href="/workflow">
              <Button
                className={cn(
                  "bg-black text-white border-4 border-black rounded-2xl",
                  "text-xl font-bold px-8 py-6 h-auto",
                  "shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
                  "hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)]",
                  "hover:translate-y-[-4px]",
                  "transition-all duration-200",
                  "flex items-center gap-2"
                )}
              >
                Launch Builder
                <ArrowRight size={24} />
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20">
            {[
              {
                title: "Visual EVM Builder",
                description:
                  "Connect standard web3 wallets (MetaMask/Rabby) and construct automated transaction steps visually.",
                icon: Layers,
              },
              {
                title: "10,000 TPS Parallelism",
                description:
                  "Leverage Monad's parallel execution engine to deploy tokens, NFTs, and send transfers concurrently.",
                icon: Zap,
              },
              {
                title: "Dynamic Solidity Compiler",
                description:
                  "Compile and deploy custom contracts on-chain instantly from the browser compiler.",
                icon: Code2,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={cn(
                  "p-8 bg-white border-4 border-black rounded-2xl text-left",
                  "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                  "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
                  "hover:translate-y-[-2px]",
                  "transition-all duration-200"
                )}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 border-2 border-black rounded-xl mb-4">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-black text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 font-semibold text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
