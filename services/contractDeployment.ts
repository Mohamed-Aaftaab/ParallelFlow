/**
 * Contract Deployment Service for Monad
 * Calls backend Solidity compiler service to compile and deploy standard ERC-20, NFT, and custom Solidity contracts
 * Supports both client-side MetaMask browser wallet deployment and backend deployer server deployment.
 */

import { createWalletClient, custom, publicActions } from "viem";
import { monadTestnet } from "./monad";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export interface CreateTokenParams {
  name: string;
  symbol: string;
  max_token: number;
  decimals: number;
}

export interface DeployContractParams {
  cairoCode: string; // This holds the raw Solidity code
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
 * Deploy contract using browser wallet extension (MetaMask/Rabby)
 */
async function deployViaBrowserWallet(
  abi: any[],
  bytecode: string,
  args: any[],
  userAddress: string
): Promise<DeploymentResult> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("Browser wallet extension not detected");
  }

  const walletClient = createWalletClient({
    chain: monadTestnet,
    transport: custom((window as any).ethereum),
  }).extend(publicActions);

  console.log("🌐 Deploying contract via Browser Wallet (MetaMask)...");
  const hash = await walletClient.deployContract({
    abi,
    bytecode: bytecode.startsWith("0x") ? (bytecode as `0x${string}`) : (`0x${bytecode}` as `0x${string}`),
    args,
    account: userAddress as `0x${string}`,
  });

  const receipt = await walletClient.waitForTransactionReceipt({ hash });

  return {
    success: true,
    contractAddress: receipt.contractAddress as string,
    transactionHash: hash,
    details: receipt,
  };
}

/**
 * Deploy a new ERC-20 Solidity token contract on Monad Testnet
 */
export async function createToken(
  params: CreateTokenParams,
  userAddress?: string
): Promise<DeploymentResult> {
  try {
    console.log("🪙 Creating Solidity ERC-20 token on Monad:", params);

    // Try client-side deployment via MetaMask if user wallet is connected
    if (typeof window !== "undefined" && (window as any).ethereum && userAddress && userAddress !== "0x0000000000000000000000000000000000000000") {
      try {
        const compileRes = await fetch(`${BASE_URL}/create-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...params, compile_only: true }),
        });

        if (compileRes.ok) {
          const compileData = await compileRes.json();
          if (compileData.success && compileData.abi && compileData.bytecode) {
            return await deployViaBrowserWallet(
              compileData.abi,
              compileData.bytecode,
              [params.name, params.symbol, BigInt(params.max_token), parseInt(params.decimals.toString())],
              userAddress
            );
          }
        }
      } catch (clientErr: any) {
        console.warn("Client-side deploy failed, falling back to backend deployer:", clientErr.message);
      }
    }

    // Fallback to backend server deployment
    const response = await fetch(`${BASE_URL}/create-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errJson;
      try { errJson = JSON.parse(errorText); } catch (_) {}
      throw new Error(errJson?.error || `HTTP ${response.status}: ${errorText}`);
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
 * Deploy a custom Solidity smart contract dynamically
 */
export async function deployContract(
  params: DeployContractParams,
  userAddress?: string
): Promise<DeploymentResult> {
  try {
    console.log("📄 Deploying custom Solidity contract on Monad...");

    if (typeof window !== "undefined" && (window as any).ethereum && userAddress && userAddress !== "0x0000000000000000000000000000000000000000") {
      try {
        const compileRes = await fetch(`${BASE_URL}/deploy-contract`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: params.cairoCode, compile_only: true }),
        });

        if (compileRes.ok) {
          const compileData = await compileRes.json();
          if (compileData.success && compileData.abi && compileData.bytecode) {
            return await deployViaBrowserWallet(
              compileData.abi,
              compileData.bytecode,
              [],
              userAddress
            );
          }
        }
      } catch (clientErr: any) {
        console.warn("Client-side deploy failed, falling back to backend deployer:", clientErr.message);
      }
    }

    const response = await fetch(`${BASE_URL}/deploy-contract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: params.cairoCode }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errJson;
      try { errJson = JSON.parse(errorText); } catch (_) {}
      throw new Error(errJson?.error || `HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
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
 * Deploy an ERC-721 NFT collection contract on Monad Testnet
 */
export async function deployNFT(
  params: DeployNFTParams,
  userAddress?: string
): Promise<DeploymentResult> {
  try {
    console.log("🖼️ Deploying ERC-721 NFT collection on Monad:", params);

    if (typeof window !== "undefined" && (window as any).ethereum && userAddress && userAddress !== "0x0000000000000000000000000000000000000000") {
      try {
        const compileRes = await fetch(`${BASE_URL}/deploy-nft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...params, compile_only: true }),
        });

        if (compileRes.ok) {
          const compileData = await compileRes.json();
          if (compileData.success && compileData.abi && compileData.bytecode) {
            return await deployViaBrowserWallet(
              compileData.abi,
              compileData.bytecode,
              [params.name, params.symbol, params.base_uri],
              userAddress
            );
          }
        }
      } catch (clientErr: any) {
        console.warn("Client-side deploy failed, falling back to backend deployer:", clientErr.message);
      }
    }

    const response = await fetch(`${BASE_URL}/deploy-nft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errJson;
      try { errJson = JSON.parse(errorText); } catch (_) {}
      throw new Error(errJson?.error || `HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
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
 * Mint an NFT item from collection contract
 */
export async function mintNFT(
  params: MintNFTParams
): Promise<DeploymentResult> {
  try {
    console.log("🎨 Minting NFT item on Monad:", params);

    const response = await fetch(`${BASE_URL}/mint-nft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errJson;
      try { errJson = JSON.parse(errorText); } catch (_) {}
      throw new Error(errJson?.error || `HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      contractAddress: data.contract_address || data.contractAddress,
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
