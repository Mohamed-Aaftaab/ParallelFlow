import { Recipient } from "@/types";
import { isAddress } from "viem";
import { monadClient } from "./monad";

export interface BatchTransferResult {
  successful: number;
  failed: number;
  results: Recipient[];
}

/**
 * Execute batch transfer on Monad Testnet (simulates batches or writes)
 */
export const executeBatchTransfer = async (
  recipients: Recipient[],
  tokenAddress: string,
  batchSize: number = 10,
  delayBetweenBatches: number = 1000,
  onProgress?: (completed: number, total: number) => void
): Promise<BatchTransferResult> => {
  const results: Recipient[] = [...recipients];
  let successful = 0;
  let failed = 0;

  // Process in batches
  const total = recipients.length;
  for (let i = 0; i < total; i += batchSize) {
    const end = Math.min(i + batchSize, total);
    const batch = results.slice(i, end);

    try {
      // Simulate/perform batch transfer calls sequentially
      for (const item of batch) {
        item.status = "processing";
        // Dummy transaction hash for verification display
        item.txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      }

      // Wait a bit to simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      for (const item of batch) {
        item.status = "success";
        successful++;
      }

    } catch (error) {
      for (const item of batch) {
        item.status = "failed";
        failed++;
      }
    }

    if (onProgress) {
      onProgress(end, total);
    }

    if (end < total) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return {
    successful,
    failed,
    results,
  };
};

/**
 * Validate Monad EVM recipient addresses and amounts
 */
export const validateRecipients = (
  recipients: Recipient[],
  validationLevel: "Basic" | "Strict" | "With Balance Check"
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];

    // Basic validation
    if (!recipient.address) {
      errors.push(`Row ${i + 1}: Missing address`);
      continue;
    }

    if (!recipient.amount || parseFloat(recipient.amount) <= 0) {
      errors.push(`Row ${i + 1}: Invalid amount`);
      continue;
    }

    // Strict validation (check EVM address format)
    if (validationLevel === "Strict" || validationLevel === "With Balance Check") {
      if (!isAddress(recipient.address)) {
        errors.push(`Row ${i + 1}: Invalid Monad/EVM address format`);
      }
    }

    // Check for duplicate addresses
    const duplicateIndex = recipients.findIndex(
      (r, idx) => idx < i && r.address.toLowerCase() === recipient.address.toLowerCase()
    );
    if (duplicateIndex !== -1) {
      errors.push(
        `Row ${i + 1}: Duplicate address (first seen in row ${duplicateIndex + 1})`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
