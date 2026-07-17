import { Recipient } from "@/types";
import { checkTransactionStatus } from "./starknet";
import {
  prepareTransferCalls,
  executeMulticall,
  splitIntoBatches,
} from "./multicall";

export interface BatchTransferResult {
  successful: number;
  failed: number;
  results: Recipient[];
}

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

  // Split recipients into optimal batches using Starknet's multicall
  const batches = splitIntoBatches(recipients, batchSize);

  // Process each batch using native multicall
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];

    try {
      // Prepare multicall: all transfers in this batch go in ONE transaction!
      const calls = prepareTransferCalls(
        batch.map((r) => ({ address: r.address, amount: r.amount })),
        tokenAddress
      );

      // Execute multicall: single transaction for all transfers in batch
      const { transactionHash } = await executeMulticall(calls);

      // Update batch recipients with tx hash
      for (let i = 0; i < batch.length; i++) {
        const recipientIndex = batchIndex * batch.length + i;
        if (recipientIndex < results.length) {
          results[recipientIndex].txHash = transactionHash;
          results[recipientIndex].status = "processing";
        }
      }

      // Check transaction status
      const status = await checkTransactionStatus(transactionHash);

      // Update recipients based on status
      for (let i = 0; i < batch.length; i++) {
        const recipientIndex = batchIndex * batch.length + i;
        if (recipientIndex >= results.length) continue;
        results[recipientIndex].status = status === "success" ? "success" : "failed";
        
        if (status === "success") {
          successful++;
        } else {
          failed++;
        }
      }
    } catch (error) {
      // Mark all recipients in this batch as failed
      for (let i = 0; i < batch.length; i++) {
        const recipientIndex = batchIndex * batch.length + i;
        if (recipientIndex >= results.length) continue;
        results[recipientIndex].status = "failed";
        failed++;
      }
    }

    // Report progress
    const completed = Math.min(
      (batchIndex + 1) * batch.length,
      recipients.length
    );
    if (onProgress) {
      onProgress(
        Math.min(completed, recipients.length),
        recipients.length
      );
    }

    // Wait before processing next batch (except for the last batch)
    if (batchIndex < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return {
    successful,
    failed,
    results,
  };
};

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

    // Strict validation (check address format)
    if (validationLevel === "Strict" || validationLevel === "With Balance Check") {
      if (!recipient.address.startsWith("0x")) {
        errors.push(`Row ${i + 1}: Address must start with 0x`);
      }

      if (recipient.address.length !== 66) {
        errors.push(`Row ${i + 1}: Invalid address length`);
      }
    }

    // Check for duplicate addresses
    const duplicateIndex = recipients.findIndex(
      (r, idx) => idx < i && r.address === recipient.address
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

