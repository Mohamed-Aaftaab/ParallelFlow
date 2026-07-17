// Application configuration from environment variables

export const config = {
  // Network settings
  network: process.env.NEXT_PUBLIC_STARKNET_NETWORK || 'sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io',
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || 'SN_SEPOLIA',

  // Contract addresses
  ethTokenAddress: process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS || '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  strkTokenAddress: process.env.NEXT_PUBLIC_STRK_TOKEN_ADDRESS || '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  batchTransferContract: process.env.NEXT_PUBLIC_BATCH_TRANSFER_CONTRACT || '',

  // Wallet settings
  defaultWallet: (process.env.NEXT_PUBLIC_DEFAULT_WALLET || 'argentx') as 'argentx' | 'braavos',
  enableWalletConnect: process.env.NEXT_PUBLIC_ENABLE_WALLET_CONNECT === 'true',

  // Transaction settings
  defaultBatchSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_BATCH_SIZE || '10', 10),
  defaultBatchDelay: parseInt(process.env.NEXT_PUBLIC_DEFAULT_BATCH_DELAY || '1000', 10),
  maxRetryAttempts: parseInt(process.env.NEXT_PUBLIC_MAX_RETRY_ATTEMPTS || '5', 10),
  txTimeout: parseInt(process.env.NEXT_PUBLIC_TX_TIMEOUT || '300000', 10),

  // Feature flags
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  enableCsvValidation: process.env.NEXT_PUBLIC_ENABLE_CSV_VALIDATION !== 'false',
  enableAddressValidation: process.env.NEXT_PUBLIC_ENABLE_ADDRESS_VALIDATION !== 'false',
  enableGasEstimation: process.env.NEXT_PUBLIC_ENABLE_GAS_ESTIMATION !== 'false',

  // Development settings
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
  enableErrorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',

  // Export settings
  maxExportRecords: parseInt(process.env.NEXT_PUBLIC_MAX_EXPORT_RECORDS || '10000', 10),
  defaultExportFormat: (process.env.NEXT_PUBLIC_DEFAULT_EXPORT_FORMAT || 'csv') as 'csv' | 'json' | 'pdf',

  // Analytics
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
} as const;

// Helper to check if we're in demo mode
export const isDemoMode = () => config.demoMode;

// Helper to get the correct token address
export const getTokenAddress = (token: 'ETH' | 'STRK' | string): string => {
  if (token === 'ETH') return config.ethTokenAddress;
  if (token === 'STRK') return config.strkTokenAddress;
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

