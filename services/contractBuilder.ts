/**
 * Contract Builder Service using Solidity dynamic compiler on backend
 * Generates smart contract templates based on natural language instructions
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export interface ContractBuilderRequest {
  instructions: string;
  contractType?: "Cairo" | "Solidity" | "Auto-detect";
  contractName?: string;
}

export interface ContractBuilderResponse {
  success: boolean;
  contractCode?: string;
  contractName?: string;
  contractType?: string;
  explanation?: string;
  error?: string;
}

/**
 * Build contract with backend Solidity generator
 */
export async function buildContractWithAgenticStark(
  request: ContractBuilderRequest
): Promise<ContractBuilderResponse> {
  try {
    console.log("🤖 Generating Solidity contract via ParallelFlow compiler:", request);

    const response = await fetch(`${BASE_URL}/build-contract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instructions: request.instructions,
        contractType: "Solidity",
        contractName: request.contractName || "GeneratedContract",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log("✅ Contract built successfully:", data);

    return {
      success: true,
      contractCode: data.contractCode,
      contractName: data.contractName || request.contractName,
      contractType: "Solidity",
      explanation: data.explanation,
    };
  } catch (error) {
    console.error("❌ Failed to build contract:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to build contract",
    };
  }
}

/**
 * Validate contract instructions
 */
export function validateContractInstructions(instructions: string): {
  valid: boolean;
  error?: string;
} {
  if (!instructions || instructions.trim().length === 0) {
    return {
      valid: false,
      error: "Contract instructions are required",
    };
  }

  if (instructions.length < 5) {
    return {
      valid: false,
      error: "Contract instructions must be at least 5 characters long",
    };
  }

  if (instructions.length > 2000) {
    return {
      valid: false,
      error: "Contract instructions must be less than 2000 characters",
    };
  }

  return { valid: true };
}

/**
 * Get contract type suggestions based on instructions
 */
export function getContractTypeSuggestions(instructions: string): string[] {
  return ["Solidity"];
}

/**
 * Format contract code for display
 */
export function formatContractCode(code: string, contractType: string): string {
  if (!code) return "";
  return `// Solidity Contract\n${code}`;
}

/**
 * Get example instructions for different contract types
 */
export const EXAMPLE_INSTRUCTIONS = {
  counter: "Create a Solidity counter contract with increment/decrement and a getter.",
  token: "Create a simple Solidity ERC20 token contract.",
  voting: "Create a Solidity voting contract to cast and count votes.",
};
