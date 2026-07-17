"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Coins,
  RefreshCw,
} from "lucide-react";
import {
  validateWallet,
  formatValidationResult,
  type WalletValidationResult,
  type Token,
} from "@/services/validateWallet";

interface ValidateWalletExecutionProps {
  walletAddress: string;
  validationType: "Quick Check" | "Full Validation" | "With Token Scan";
  minimumBalanceCheck: "Skip" | "Check ETH Only" | "Check All Tokens";
  onComplete?: (result: WalletValidationResult) => void;
}

const ValidateWalletExecution: React.FC<ValidateWalletExecutionProps> = ({
  walletAddress,
  validationType,
  minimumBalanceCheck,
  onComplete,
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<WalletValidationResult | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = async () => {
    setIsValidating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const validationResult = await validateWallet(
        walletAddress,
        validationType,
        minimumBalanceCheck
      );

      clearInterval(progressInterval);
      setProgress(100);
      setResult(validationResult);
      onComplete?.(validationResult);
    } catch (error) {
      console.error("Validation error:", error);
      setResult({
        isValid: false,
        hasBalance: false,
        tokens: [],
        totalUsdValue: "$0.00",
        errors: [error instanceof Error ? error.message : "Validation failed"],
        warnings: [],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="animate-spin text-blue-600" size={24} />;
    }
    if (result?.isValid) {
      return <CheckCircle className="text-green-600" size={24} />;
    }
    return <XCircle className="text-red-600" size={24} />;
  };

  const getStatusColor = () => {
    if (isValidating) return "border-blue-500 bg-blue-50";
    if (result?.isValid) return "border-green-500 bg-green-50";
    return "border-red-500 bg-red-50";
  };

  return (
    <Card
      className={cn(
        "border-2 rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all duration-300",
        getStatusColor()
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {getStatusIcon()}
          <span className="text-lg font-bold">
            {isValidating
              ? "Validating Wallet..."
              : result?.isValid
              ? "✅ Wallet Validated"
              : "❌ Validation Failed"}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {isValidating && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              {progress < 30
                ? "Checking address format..."
                : progress < 60
                ? "Fetching balances..."
                : progress < 90
                ? "Scanning tokens..."
                : "Almost done..."}
            </p>
          </div>
        )}

        {/* Results */}
        {result && !isValidating && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white border-2 border-black rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Address</div>
                <div className="text-sm font-bold">
                  {result.isValid ? (
                    <span className="text-green-600">✓ Valid</span>
                  ) : (
                    <span className="text-red-600">✗ Invalid</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white border-2 border-black rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Balance</div>
                <div className="text-sm font-bold">
                  {result.hasBalance ? (
                    <span className="text-green-600">✓ Has Funds</span>
                  ) : (
                    <span className="text-orange-600">⚠ Low</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white border-2 border-black rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Total Value</div>
                <div className="text-sm font-bold text-purple-600">
                  {result.totalUsdValue}
                </div>
              </div>
            </div>

            {/* Token List */}
            {result.tokens.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Coins size={16} />
                  Available Tokens ({result.tokens.length})
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.tokens.map((token, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-3",
                        "bg-white border-2 rounded-lg",
                        "hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all",
                        token.symbol === "ETH" && "border-blue-400",
                        token.symbol === "STRK" && "border-purple-400",
                        token.symbol === "USDC" && "border-green-400",
                        token.symbol === "CHIPPY" && "border-orange-400",
                        !["ETH", "STRK", "USDC", "CHIPPY"].includes(token.symbol) && "border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            "border-2 border-black font-bold text-sm",
                            token.symbol === "ETH" && "bg-blue-500 text-white",
                            token.symbol === "STRK" && "bg-purple-500 text-white",
                            token.symbol === "USDC" && "bg-green-500 text-white",
                            token.symbol === "CHIPPY" && "bg-orange-500 text-white",
                            !["ETH", "STRK", "USDC", "CHIPPY"].includes(token.symbol) && "bg-gray-500 text-white"
                          )}
                        >
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{token.symbol}</div>
                          <div className="text-xs text-gray-500">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{token.balance}</div>
                        <div className="text-xs text-gray-500">{token.usdValue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="p-3 bg-red-50 border-2 border-red-400 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                  <XCircle size={16} />
                  Errors
                </div>
                <ul className="space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="p-3 bg-orange-50 border-2 border-orange-400 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
                  <AlertTriangle size={16} />
                  Warnings
                </div>
                <ul className="space-y-1">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-orange-600">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Retry Button */}
            <Button
              onClick={runValidation}
              variant="outline"
              className={cn(
                "w-full border-2 border-black rounded-lg",
                "shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
                "hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                "hover:translate-y-[-2px]",
                "transition-all duration-200",
                "font-bold"
              )}
            >
              <RefreshCw size={16} className="mr-2" />
              Validate Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidateWalletExecution;

