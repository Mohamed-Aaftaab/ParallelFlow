/**
 * EVM Receiver Validation Service for Monad
 */
import { isAddress } from "viem";
import { monadClient, getMONBalance } from "./monad";

export interface ReceiverValidationResult {
  isValid: boolean;
  address: string;
  hasBalance: boolean;
  isDeployed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate receiver address on Monad Testnet
 */
export async function validateReceiverAddress(
  address: string,
  validationType: "Format Only" | "Format + Balance Check" | "Full Validation" = "Format + Balance Check"
): Promise<ReceiverValidationResult> {
  console.log(`🔍 Validating receiver address`);
  console.log(`   Address: ${address}`);
  console.log(`   Type: ${validationType}`);

  const result: ReceiverValidationResult = {
    isValid: false,
    address: address,
    hasBalance: false,
    isDeployed: false,
    errors: [],
    warnings: [],
  };

  try {
    // Step 1: Validate address format
    if (!isAddress(address)) {
      result.errors.push("Invalid EVM address format");
      return result;
    }
    result.isValid = true;

    // Step 2: Format Only - just verify address is valid
    if (validationType === "Format Only") {
      return result;
    }

    // Step 3: Check if address has balance (Format + Balance Check)
    if (validationType === "Format + Balance Check" || validationType === "Full Validation") {
      const monBalanceStr = await getMONBalance(address);
      const balance = parseFloat(monBalanceStr);
      result.hasBalance = balance > 0;

      if (!result.hasBalance) {
        result.warnings.push("Receiver address has zero balance (may be a new account)");
      }
    }

    // Step 4: Full validation - check if address is a deployed smart contract or EOA
    if (validationType === "Full Validation") {
      const code = await monadClient.getBytecode({ address: address as `0x${string}` });
      result.isDeployed = code !== undefined && code !== "0x";
      
      if (result.isDeployed) {
        result.warnings.push("Receiver is a deployed smart contract address");
      } else {
        result.warnings.push("Receiver is a standard Externally Owned Account (EOA)");
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return result;
  }
}
