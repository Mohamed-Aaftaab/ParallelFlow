"use client";

import { useState, useEffect } from "react";
import WorkflowBuilder from "@/components/WorkflowBuilder";
import WalletSelector from "@/components/WalletSelector";
import { NavigationTabs } from "@/components/NavigationTabs";

export default function WorkflowPage() {
  const [wallet, setWallet] = useState<{ address: string; type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load wallet from localStorage on mount
  useEffect(() => {
    console.log("🔄 Loading wallet from localStorage...");
    const savedWallet = localStorage.getItem("connectedWallet");
    if (savedWallet) {
      try {
        const parsedWallet = JSON.parse(savedWallet);
        console.log("✅ Loaded wallet from localStorage:", parsedWallet);
        setWallet(parsedWallet);
      } catch (error) {
        console.error("❌ Failed to parse saved wallet:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const handleWalletConnected = (walletData: { address: string; type: string }) => {
    console.log("🎯 handleWalletConnected called with:", walletData);
    setWallet(walletData);
    localStorage.setItem("connectedWallet", JSON.stringify(walletData));
  };

  const handleDisconnect = () => {
    setWallet(null);
    localStorage.removeItem("connectedWallet");
    localStorage.removeItem("wallet_private_key");
    sessionStorage.removeItem("wallet_private_key");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFFDFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-black"></div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <WalletSelector 
        onWalletConnected={handleWalletConnected} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDFA]">
      <NavigationTabs />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 p-6 bg-white border-4 border-black rounded-3xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Monad Workflow Builder</h1>
            <p className="text-sm font-bold text-gray-500 mt-2 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Connected EVM: <span className="font-mono text-purple-600 bg-purple-50 px-2 py-0.5 border border-purple-200 rounded-md">{wallet.address}</span> ({wallet.type})
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-5 py-3 bg-red-500 text-white font-bold border-2 border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
          >
            Disconnect Wallet
          </button>
        </div>
        <WorkflowBuilder wallet={wallet} />
      </div>
    </div>
  );
}
