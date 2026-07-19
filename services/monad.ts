import { createPublicClient, http, isAddress, formatEther } from "viem";

const RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";

export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
  blockExplorers: { default: { name: "MonadExplorer", url: "https://testnet.monadexplorer.com" } },
} as const;

// Create public client for Monad Testnet
export const monadClient = createPublicClient({
  chain: monadTestnet,
  transport: http(RPC_URL),
});

/**
 * Validate EVM Address
 */
export function isValidEVMAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Get native MON balance
 */
export async function getMONBalance(address: string): Promise<string> {
  try {
    if (!isAddress(address)) return "0";
    const balance = await monadClient.getBalance({ address: address as `0x${string}` });
    return formatEther(balance);
  } catch (error) {
    console.error("Error getting MON balance:", error);
    return "0";
  }
}

/**
 * Get standard ERC20 balance
 */
export async function getERC20Balance(tokenAddress: string, walletAddress: string): Promise<string> {
  try {
    if (!isAddress(tokenAddress) || !isAddress(walletAddress)) return "0";
    
    // ERC20 balanceof ABI
    const abi = [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function"
      }
    ] as const;

    const [decimals, balance] = await Promise.all([
      monadClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi,
        functionName: "decimals",
      }).catch(() => 18),
      monadClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi,
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
      }).catch(() => 0n),
    ]);

    return (Number(balance) / 10 ** decimals).toString();
  } catch (error) {
    console.error("Error getting ERC20 balance:", error);
    return "0";
  }
}
