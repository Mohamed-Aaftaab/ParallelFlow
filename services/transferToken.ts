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
 * Transfer native MON or standard ERC-20 tokens
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

      if (token === "MON") {
        txHash = await walletClient.sendTransaction({
          account: walletAddress as `0x${string}`,
          to: receiverAddress as `0x${string}`,
          value: parseEther(amount)
        });
      } else {
        // Simple mock ERC-20 transfer ABI
        const erc20Abi = [
          {
            name: "transfer",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "recipient", type: "address" },
              { name: "amount", type: "uint256" }
            ],
            outputs: [{ name: "", type: "bool" }]
          }
        ] as const;

        // Use mock address or custom address
        const tokenAddress = token === "USDT" 
          ? "0x8888888888888888888888888888888888888888" 
          : "0x9999999999999999999999999999999999999999";

        const { request } = await monadClient.simulateContract({
          account: walletAddress as `0x${string}`,
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "transfer",
          args: [receiverAddress as `0x${string}`, parseEther(amount)]
        });

        txHash = await walletClient.writeContract(request);
      }
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

      if (token === "MON") {
        txHash = await walletClient.sendTransaction({
          to: receiverAddress as `0x${string}`,
          value: parseEther(amount)
        });
      } else {
        const erc20Abi = [
          {
            name: "transfer",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "recipient", type: "address" },
              { name: "amount", type: "uint256" }
            ],
            outputs: [{ name: "", type: "bool" }]
          }
        ] as const;

        const tokenAddress = token === "USDT" 
          ? "0x8888888888888888888888888888888888888888" 
          : "0x9999999999999999999999999999999999999999";

        const { request } = await monadClient.simulateContract({
          account,
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "transfer",
          args: [receiverAddress as `0x${string}`, parseEther(amount)]
        });

        txHash = await walletClient.writeContract(request);
      }
    } else {
      throw new Error("No wallet connection available to sign transaction");
    }

    console.log(`✅ Transfer submitted. Hash: ${txHash}`);

    // Wait for receipt
    const receipt = await monadClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`✅ Transfer confirmed in block ${receipt.blockNumber}`);

    return {
      success: receipt.status === "success",
      transactionHash: txHash,
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
