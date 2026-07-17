// Application configuration from environment variables for Monad

export const config = {
  // Network settings
  network: 'monad-testnet',
  rpcUrl: process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz',
  chainId: 10143,

  // Contract addresses (dummy placeholders or set dynamically)
  monTokenAddress: '0x0000000000000000000000000000000000000000',
  usdcTokenAddress: '0x0f5d2fb29fb7d3cfee441a241097e082903b488f', // Example ERC-20
  batchTransferContract: process.env.NEXT_PUBLIC_BATCH_TRANSFER_CONTRACT || '',

  // Wallet settings
  defaultWallet: 'metamask',
  enableWalletConnect: true,

  // Transaction settings
  defaultBatchSize: 10,
  defaultBatchDelay: 1000,
  maxRetryAttempts: 5,
  txTimeout: 300000,

  // Feature flags
  demoMode: false,
  enableCsvValidation: true,
  enableAddressValidation: true,
  enableGasEstimation: true,

  // Development settings
  debug: true,
  enableErrorReporting: false,

  // Export settings
  maxExportRecords: 1000,
  defaultExportFormat: 'csv' as 'csv' | 'json' | 'pdf',

  // Analytics
  gaId: undefined,
  mixpanelToken: undefined,
} as const;

// Helper to check if we're in demo mode
export const isDemoMode = () => config.demoMode;

// Helper to get the correct token address
export const getTokenAddress = (token: 'MON' | 'USDC' | string): string => {
  if (token === 'MON') return config.monTokenAddress;
  if (token === 'USDC') return config.usdcTokenAddress;
  return token; // Assume it's a custom token address
};

// Helper to check if address validation is enabled
export const shouldValidateAddresses = () => config.enableAddressValidation;

// Helper to log debug messages
export const debugLog = (...args: any[]) => {
  if (config.debug) {
    console.log('[DEBUG]', ...args);
  }
};

// Export default config
export default config;
