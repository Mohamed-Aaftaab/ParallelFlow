/**
 * EVM Wallet Validation Service for Monad
 */
import { isAddress } from "viem";
import { getMONBalance, getERC20Balance } from "./monad";

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  contractAddress: string;
  usdValue?: string;
}

export interface WalletValidationResult {
  isValid: boolean;
  hasBalance: boolean;
  tokens: Token[];
  totalUsdValue: string;
  errors: string[];
  warnings: string[];
}

/**
 * Validate wallet and fetch balance/tokens on Monad Testnet
 */
export async function validateWallet(
  walletAddress: string,
  validationType: "Quick Check" | "Full Validation" | "With Token Scan" = "Full Validation",
  minimumBalanceCheck: "Skip" | "Check MON Only" | "Check All Tokens" = "Check MON Only"
): Promise<WalletValidationResult> {
  console.log(`🔍 Validating EVM wallet on Monad Testnet`);
  console.log(`   Address: ${walletAddress}`);
  console.log(`   Type: ${validationType}`);
  console.log(`   Balance Check: ${minimumBalanceCheck}`);

  const result: WalletValidationResult = {
    isValid: false,
    hasBalance: false,
    tokens: [],
    totalUsdValue: "$0.00",
    errors: [],
    warnings: [],
  };

  try {
    // Step 1: Validate EVM address format
    if (!isAddress(walletAddress)) {
      result.errors.push("Invalid EVM address format");
      return result;
    }
    result.isValid = true;

    // Step 2: Quick check - just verify address is valid
    if (validationType === "Quick Check") {
      result.warnings.push("Quick check only validates EVM address format");
      return result;
    }

    // Step 3: Fetch native MON balance
    const monBalanceStr = await getMONBalance(walletAddress);
    const monBalanceNum = parseFloat(monBalanceStr);
    
    // We assume 1 MON = $2.50 for a mock visual portfolio USD valuation
    const monUsdValue = `$` + (monBalanceNum * 2.50).toFixed(2);

    result.tokens.push({
      symbol: "MON",
      name: "Monad Native Token",
      balance: parseFloat(monBalanceStr).toFixed(4),
      decimals: 18,
      contractAddress: "0x0000000000000000000000000000000000000000",
      usdValue: monUsdValue
    });

    // Step 4: Full/Token scan - Scan for standard ERC20 Testnet tokens
    if (validationType === "With Token Scan" || validationType === "Full Validation") {
      // Mock standard testnet tokens for UI portfolio metrics
      const mockTestnetTokens = [
        {
          symbol: "USDT",
          name: "Tether USD",
          contractAddress: "0x8888888888888888888888888888888888888888",
          decimals: 6,
          price: 1.00
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          contractAddress: "0x9999999999999999999999999999999999999999",
          decimals: 6,
          price: 1.00
        }
      ];

      for (const token of mockTestnetTokens) {
        // Query balance on Monad testnet RPC
        const balance = await getERC20Balance(token.contractAddress, walletAddress);
        const balNum = parseFloat(balance);
        if (balNum > 0 || validationType === "With Token Scan") {
          result.tokens.push({
            symbol: token.symbol,
            name: token.name,
            balance: balNum.toFixed(4),
            decimals: token.decimals,
            contractAddress: token.contractAddress,
            usdValue: `$` + (balNum * token.price).toFixed(2)
          });
        }
      }
    }

    // Step 5: Check if wallet has balance
    if (minimumBalanceCheck !== "Skip") {
      if (minimumBalanceCheck === "Check MON Only") {
        result.hasBalance = monBalanceNum > 0.001; // Require small MON for gas
      } else {
        result.hasBalance = result.tokens.some(t => parseFloat(t.balance) > 0);
      }

      if (!result.hasBalance) {
        result.warnings.push("Wallet has insufficient MON balance for gas fees");
      }
    }

    // Step 6: Calculate total USD portfolio value
    const totalUsd = result.tokens.reduce((sum, token) => {
      const val = parseFloat(token.usdValue?.replace(/[$,]/g, "") || "0");
      return sum + val;
    }, 0);
    result.totalUsdValue = `$` + totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return result;
  } catch (error) {
    result.errors.push(`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return result;
  }
}
