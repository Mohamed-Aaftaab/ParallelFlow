# ParallelFlow - Visual Workflow Builder for Monad

<div align="center">

![ParallelFlow Logo](https://img.shields.io/badge/ParallelFlow-Visual%20Workflow%20Builder-purple?style=for-the-badge&logo=ethereum)

**Automated drag-and-drop transaction pipelines on the Monad EVM blockchain network**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Monad](https://img.shields.io/badge/Monad-Testnet-blueviolet.svg)](https://testnet.monadexplorer.com/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-Contracts-blue.svg)](https://www.openzeppelin.com/)

</div>

---

## 🚀 Inspiration
Monad introduces 10,000 TPS, 1-second block times, and sub-cent fees. However, builders and power users still spend hours writing custom Web3 scripts or executing slow, repetitive multi-step actions manually (deploying ERC20 tokens, distributing batch payments, managing NFT collections, or spinning up custom Solidity contracts). 

**ParallelFlow** brings the simplicity of visual automation builders (like Zapier) directly to the Monad ecosystem. It enables anyone, regardless of coding background, to visually build, compile, and execute parallelized transaction pipelines on Monad Testnet in 1 second.

---

## ✨ What it does
ParallelFlow is a visual workflow automation builder for Monad. Each visual block represents an EVM action, and connecting them constructs a fully executable transaction flow.

### Key Features
*   🎨 **Visual Pipeline Editor**: Drag, drop, and configure workflow nodes in a custom neobrutalist grid visualizer.
*   ⚡ **Batch Transfer Engine**: Distribute native `MON` or ERC-20 tokens to dozens of recipients in a single atomic transaction using our custom multicall contract.
*   🏗️ **Solidity ERC-20 & NFT Deployers**: Deploy standard, secure contracts to Monad Testnet with custom parameters instantly.
*   🎨 **NFT Minting Block**: Mint collection items to target addresses in a single node.
*   🤖 **AI Solidity Deployer**: Type natural language instructions inside a code block, compile it dynamically via the backend compiler, and deploy it to Monad.
*   🛡️ **Smart EVM Validation**: Verify wallet balances, gas fees, and address formatting before broadcasting to avoid aborted runs.
*   📊 **Real-time Tx Logs**: Output confirmed block explorer transaction hashes (`testnet.monadexplorer.com`) for every step.

---

## 🛠️ How we built it

### Next.js Frontend
- **Framework**: Next.js 15 with React 19 (App Router)
- **Styling**: Tailwind CSS with custom Neobrutalist design tokens
- **EVM Integration**: `viem` and `wagmi` for wallet connection (`window.ethereum`) and client-side transaction signing
- **Icons**: Lucide React

### Express Compiler Backend
- **Framework**: Node.js Express.js
- **Solidity Compiler**: Pure JavaScript `solc` compiler (locks compilation to Solidity version `0.8.20`)
- **Blockchain Interface**: `viem` for deployer account transaction broadcast and wait logic

---

## 📂 Architecture
```
ParallelFlow/
├── app/                    # Next.js Application
│   ├── api/                # API route proxies
│   ├── globals.css         # Styling system
│   ├── layout.tsx          # Root Layout
│   └── workflow/           # Workflow editor page
├── backend/                # Express compiler server
│   ├── contracts/          # Solidity templates
│   │   ├── MonadToken.sol
│   │   ├── MonadNFT.sol
│   │   └── MonadWorkflowExecutor.sol
│   ├── package.json
│   └── server.js           # Server compiler logic
├── components/             # React components
│   ├── ExecuteButton.tsx   # Visual pipeline execution logic
│   ├── Header.tsx          # Custom Monad branding header
│   ├── WalletSelector.tsx  # EVM MetaMask/Rabby wallet connect
│   ├── WorkflowBuilder.tsx # Neobrutalist visual canvas
│   └── WorkflowPiece.tsx   # Individual block renderers
├── constants/
│   └── workflows.ts        # EVM block definition constants
└── services/
    ├── monad.ts            # Public client RPC getters
    ├── transferToken.ts    # Viem transfer service
    └── validateWallet.ts   # EVM wallet balance validator
```

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Browser wallet extension (MetaMask or Rabby Wallet)

### Frontend Setup
1.  Navigate to root project directory:
    ```bash
    cd Spark
    npm install --legacy-peer-deps
    ```
2.  Set up environment variables in `.env.local`:
    ```env
    NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
    NEXT_PUBLIC_MONAD_CHAIN_ID=10143
    NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
    ```
3.  Launch Next.js development server:
    ```bash
    npm run dev
    ```

### Backend Compiler Setup
1.  Navigate to backend directory:
    ```bash
    cd backend
    npm install --legacy-peer-deps
    ```
2.  Add Monad deployer private key inside `.env.local` in root or backend env:
    ```env
    MONAD_DEPLOYER_PRIVATE_KEY=0x_your_private_key
    ```
3.  Launch Express compiler server:
    ```bash
    npm start
    ```

---

## 🎯 Example Workflows
1.  **ERC-20 Launcher**: Connect EVM Wallet $\to$ Validate MON balance $\to$ Deploy ERC-20 Token contract $\to$ Check transaction explorer.
2.  **Solidity AI Generator**: Connect EVM Wallet $\to$ Prompt custom Solidity code (e.g. Counter) $\to$ Compile Solidity $\to$ Deploy to Monad $\to$ Generate PDF transaction summary.
