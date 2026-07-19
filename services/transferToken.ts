/**
 * Monad Token Transfer Service (EVM compliant)
 */
import { createWalletClient, http, parseEther, isAddress, custom } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadClient } from "./monad";

export interface TransferResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  details?: any;
}

/**
 * Transfer native MON tokens on Monad Testnet.
 * Only MON (native) transfers are supported. ERC-20 transfers require
 * a deployed token contract address.
 */
export async function transferToken(
  token: "MON" | "USDT" | "USDC" | "WETH",
  receiverAddress: string,
  amount: string,
  privateKey: string, // optional imported private key
  walletAddress: string
): Promise<TransferResult> {
  console.log(`💸 Initiating token transfer on Monad Testnet`);
  console.log(`   Token: ${token}`);
  console.log(`   Receiver: ${receiverAddress}`);
  console.log(`   Amount: ${amount}`);
  console.log(`   From: ${walletAddress}`);

  try {
    // Validate inputs
    if (!isAddress(receiverAddress)) {
      throw new Error("Invalid EVM receiver address");
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Invalid transfer amount");
    }

    // Only native MON transfers are supported on-chain.
    // USDT/USDC/WETH require a real deployed contract address on Monad Testnet.
    if (token !== "MON") {
      throw new Error(
        `${token} is not yet deployed on Monad Testnet. Only native MON transfers are supported. ` +
        `To transfer ERC-20 tokens, deploy a token first using the "Deploy ERC-20 Token" block and use its contract address.`
      );
    }

    let txHash: `0x${string}`;

    // Mode A: Connected via Browser Extension (MetaMask/Rabby)
    if (!privateKey && typeof window !== "undefined" && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      
      const walletClient = createWalletClient({
        chain: {
          id: 10143,
          name: "Monad Testnet",
          nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
          rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } }
        },
        transport: custom(ethereum)
      });

      txHash = await walletClient.sendTransaction({
        account: walletAddress as `0x${string}`,
        to: receiverAddress as `0x${string}`,
        value: parseEther(amount)
      });
    }
    // Mode B: Connected via Private Key
    else if (privateKey) {
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      
      const walletClient = createWalletClient({
        account,
        chain: {
          id: 10143,
          name: "Monad Testnet",
          nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
          rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } }
        },
        transport: http("https://testnet-rpc.monad.xyz")
      });

      txHash = await walletClient.sendTransaction({
        to: receiverAddress as `0x${string}`,
        value: parseEther(amount)
      });
    } else {
      throw new Error("No wallet connection available to sign transaction");
    }

    console.log(`✅ Transfer submitted. Hash: ${txHash!}`);

    // Wait for receipt with a 60-second timeout to prevent infinite hang
    const receipt = await monadClient.waitForTransactionReceipt({
      hash: txHash!,
      timeout: 60_000,
    });
    console.log(`✅ Transfer confirmed in block ${receipt.blockNumber}`);

    return {
      success: receipt.status === "success",
      transactionHash: txHash!,
      details: {
        token,
        from: walletAddress,
        to: receiverAddress,
        amount,
        receipt
      }
    };

  } catch (error: any) {
    console.error(`❌ Transfer failed:`, error);
    return {
      success: false,
      error: error.message || "Transfer failed"
    };
  }
}
