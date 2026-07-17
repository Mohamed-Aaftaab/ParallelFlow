/**
 * Contract Deployment Service for Monad
 * Calls backend Solidity compiler service to deploy standard ERC-20, NFT, and custom Solidity contracts
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export interface CreateTokenParams {
  name: string;
  symbol: string;
  max_token: number;
  decimals: number;
}

export interface DeployContractParams {
  cairoCode: string; // This holds the raw Solidity code now
  contractName?: string;
}

export interface DeployNFTParams {
  name: string;
  symbol: string;
  base_uri: string;
}

export interface MintNFTParams {
  contract_address: string;
  recipient: string;
  uri: string;
}

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
  details?: any;
}

/**
 * Deploy a new ERC-20 Solidity token contract on Monad Testnet
 */
export async function createToken(
  params: CreateTokenParams
): Promise<DeploymentResult> {
  try {
    console.log("🪙 Creating Solidity ERC-20 token on Monad:", params);

    const response = await fetch(`${BASE_URL}/create-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ ERC-20 token deployed successfully:", data);

    return {
      success: true,
      contractAddress: data.contract_address || data.contractAddress,
      transactionHash: data.transaction_hash || data.transactionHash,
      details: data,
    };
  } catch (error) {
    console.error("❌ Token creation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token creation failed",
    };
  }
}

/**
 * Deploy a custom Solidity smart contract dynamically using the backend compiler
 */
export async function deployContract(
  params: DeployContractParams
): Promise<DeploymentResult> {
  try {
    console.log("📄 Deploying custom Solidity contract on Monad...");

    const response = await fetch(`${BASE_URL}/deploy-contract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: params.cairoCode, // Pass raw Solidity contract code
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Custom contract deployed successfully:", data);

    return {
      success: true,
      contractAddress: data.contract_address || data.contractAddress,
      transactionHash: data.transaction_hash || data.transactionHash,
      details: data,
    };
  } catch (error) {
    console.error("❌ Custom contract deployment failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Contract deployment failed",
    };
  }
}

/**
 * Deploy a standard ERC-721 NFT collection contract on Monad Testnet
 */
export async function deployNFT(
  params: DeployNFTParams
): Promise<DeploymentResult> {
  try {
    console.log("🖼️ Deploying Solidity ERC-721 collection on Monad:", params);

    const response = await fetch(`${BASE_URL}/deploy-nft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ NFT contract deployed successfully:", data);

    return {
      success: true,
      contractAddress: data.contract_address || data.contractAddress,
      transactionHash: data.transaction_hash || data.transactionHash,
      details: data,
    };
  } catch (error) {
    console.error("❌ NFT deployment failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "NFT deployment failed",
    };
  }
}

/**
 * Mint a new NFT item to recipient address
 */
export async function mintNFT(
  params: MintNFTParams
): Promise<DeploymentResult> {
  try {
    console.log("🎨 Minting NFT on Monad:", params);

    const response = await fetch(`${BASE_URL}/mint-nft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ NFT minted successfully:", data);

    return {
      success: true,
      transactionHash: data.transaction_hash || data.transactionHash,
      details: data,
    };
  } catch (error) {
    console.error("❌ NFT minting failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "NFT minting failed",
    };
  }
}
