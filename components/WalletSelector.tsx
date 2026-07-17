"use client";

import { useState } from "react";
import { Wallet, Upload, Link2 } from "lucide-react";
import { isAddress } from "viem";

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const walletOptions: WalletOption[] = [
  {
    id: "browser",
    name: "MetaMask / Rabby Wallet",
    description: "Connect standard browser wallet extension on Monad Testnet",
    icon: "🦊",
  },
  {
    id: "privatekey",
    name: "Load with Private Key",
    description: "Import EVM account using your private key",
    icon: "🔑",
  },
  {
    id: "manual",
    name: "Load Existing Address",
    description: "Inspect another EVM wallet address",
    icon: "📝",
  },
];

interface WalletSelectorProps {
  onWalletConnected: (wallet: { address: string; type: string }) => void;
}

export default function WalletSelector({ onWalletConnected }: WalletSelectorProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWalletSelect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setError(null);

    if (walletId === "manual" || walletId === "privatekey") {
      return;
    }

    setIsConnecting(true);

    try {
      const ethereum = (window as any).ethereum;
      
      if (!ethereum) {
        throw new Error("Web3 browser wallet extension not found. Please install MetaMask or Rabby.");
      }

      // Request account access
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No EVM accounts found");
      }

      // Try switching chain to Monad Testnet (Chain ID 10143)
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x279f" }], // 10143 in hex is 0x279f
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x279f",
                  chainName: "Monad Testnet",
                  nativeCurrency: {
                    name: "Monad MON",
                    symbol: "MON",
                    decimals: 18,
                  },
                  rpcUrls: ["https://testnet-rpc.monad.xyz"],
                  blockExplorerUrls: ["https://testnet.monadexplorer.com"],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add Monad Testnet chain", addError);
          }
        }
      }

      const walletData = {
        address: accounts[0],
        type: "Browser Extension",
      };

      console.log("✅ Web3 Wallet connected:", walletData);
      onWalletConnected(walletData);
    } catch (err: any) {
      console.error("❌ Wallet connection error:", err);
      setError(err.message || "Failed to connect browser wallet");
      setIsConnecting(false);
    }
  };

  const handleManualConnect = () => {
    if (!manualAddress) {
      setError("Please enter a wallet address");
      return;
    }

    if (!isAddress(manualAddress)) {
      setError("Invalid EVM wallet address format. Address must start with 0x and be 42 characters long.");
      return;
    }

    const walletData = {
      address: manualAddress,
      type: "Manual (EVM)",
    };

    console.log("✅ Manual EVM wallet loaded:", walletData);
    onWalletConnected(walletData);
  };

  const handlePrivateKeyConnect = async () => {
    if (!privateKey) {
      setError("Please enter a private key");
      return;
    }

    const cleanKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    if (cleanKey.length !== 66) {
      setError("Invalid private key format. Private key should be a 32-byte hex string (64 characters + optional 0x prefix).");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/wallet/derive-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ privateKey: cleanKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to derive address");
      }

      const data = await response.json();
      const { address } = data;

      const walletData = {
        address: address,
        type: "Private Key",
      };

      console.log("✅ EVM Wallet loaded from private key:", walletData);
      
      localStorage.setItem("wallet_private_key", cleanKey);
      
      onWalletConnected(walletData);
    } catch (err: any) {
      console.error("❌ Failed to load wallet from private key:", err);
      setError(err.message || "Failed to load wallet from private key");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 grid grid-cols-10 gap-4 p-4 opacity-[0.02] pointer-events-none">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="text-black rotate-12 font-black">MON</div>
        ))}
      </div>

      <div className="bg-white border-4 border-black rounded-3xl p-8 max-w-2xl w-full shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 border-4 border-black rounded-2xl mb-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <Wallet className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-black text-black mb-2 tracking-tight">
            Connect ParallelFlow
          </h1>
          <p className="text-gray-600 font-semibold">
            Choose a wallet to continue to the Monad workflow builder
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <p className="text-red-900 font-bold text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {walletOptions.map((wallet) => (
            <div key={wallet.id}>
              <button
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={isConnecting && selectedWallet !== "manual"}
                className={`w-full p-6 border-4 border-black rounded-2xl transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] active:translate-y-[0px] ${
                  selectedWallet === wallet.id
                    ? "bg-purple-100"
                    : "bg-white"
                } ${
                  isConnecting && selectedWallet !== "manual"
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{wallet.icon}</div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-extrabold text-black">
                      {wallet.name}
                    </h3>
                    <p className="text-sm font-semibold text-gray-500">{wallet.description}</p>
                  </div>
                  {isConnecting && selectedWallet === wallet.id && wallet.id !== "manual" && (
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-t-transparent border-black"></div>
                  )}
                </div>
              </button>

              {/* Private Key Input */}
              {selectedWallet === "privatekey" && wallet.id === "privatekey" && (
                <div className="mt-4 p-6 bg-yellow-50 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <label className="block text-sm font-black text-black mb-2">
                    EVM Private Key
                  </label>
                  <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border-2 border-black rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4 font-mono text-sm font-bold bg-white"
                  />
                  <button
                    onClick={handlePrivateKeyConnect}
                    disabled={isConnecting}
                    className="w-full px-4 py-3 bg-black text-white border-2 border-black rounded-xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Load Account
                      </>
                    )}
                  </button>
                  <div className="mt-3 p-3 bg-yellow-100 border-2 border-black rounded-xl">
                    <p className="text-xs text-yellow-900 font-bold">
                      ⚠️ <strong>Security Warning:</strong> Never share your private key. It is stored 100% locally in your browser cache.
                    </p>
                  </div>
                </div>
              )}

              {/* Manual Address Input */}
              {selectedWallet === "manual" && wallet.id === "manual" && (
                <div className="mt-4 p-6 bg-gray-50 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <label className="block text-sm font-black text-black mb-2">
                    EVM Wallet Address
                  </label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border-2 border-black rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4 font-mono text-sm font-bold bg-white"
                  />
                  <button
                    onClick={handleManualConnect}
                    className="w-full px-4 py-3 bg-black text-white border-2 border-black rounded-xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all font-bold flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Load Address
                  </button>
                  <p className="mt-2 text-xs text-gray-500 font-bold">
                    💡 Tip: Paste any 0x EVM wallet address to inspect or build offline workflow plans.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t-2 border-black flex justify-between items-center text-xs font-bold text-gray-500">
          <span>🔒 Safe and local to your browser</span>
          <a href="https://testnet.monadexplorer.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 transition-colors flex items-center gap-1">
            Monad Explorer <Link2 className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
