const express = require("express");
const cors = require("cors");
const solc = require("solc");
const path = require("path");
const { createWalletClient, http, publicActions, parseEther, isAddress } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const app = express();
// Restrict CORS to known origins only
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://parallelflow.netlify.app",
  "https://parallelflow.vercel.app",
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, same-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: origin ${origin} not allowed`), false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.text({ type: "text/plain" }));

// Load configurations
const rpcUrl = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
const privateKey = process.env.MONAD_DEPLOYER_PRIVATE_KEY;

// Validate that a real private key is configured
if (!privateKey || privateKey === "YOUR_MONAD_TESTNET_PRIVATE_KEY_HERE" || privateKey.length < 60) {
  console.warn("⚠️  MONAD_DEPLOYER_PRIVATE_KEY not configured in .env.local");
  console.warn("    Backend server-side deployment disabled. All deployments will use browser wallet (MetaMask).");
  console.warn("    To enable backend deployment: set MONAD_DEPLOYER_PRIVATE_KEY in .env.local");
}

const account = privateKey && privateKey !== "YOUR_MONAD_TESTNET_PRIVATE_KEY_HERE" && privateKey.length >= 60
  ? privateKeyToAccount(privateKey)
  : null;

const walletClient = account ? createWalletClient({
  account,
  chain: {
    id: 10143,
    name: "Monad Testnet",
    nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } }
  },
  transport: http(rpcUrl)
}).extend(publicActions) : null;

console.log("🚀 ParallelFlow Backend initialized.");
if (account) {
  console.log("   Deployer Address:", account.address);
} else {
  console.log("   Mode: Compile-only (browser wallet required for deployment)");
}

/**
 * Standard Solidity compilation helper
 */
function compileSolidity(contractName, sourceCode) {
  const input = {
    language: "Solidity",
    sources: {
      "Contract.sol": {
        content: sourceCode
      }
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"]
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === "error");
    if (errors.length > 0) {
      throw new Error(errors.map(e => e.message).join("\n"));
    }
  }

  const contracts = output.contracts["Contract.sol"];
  if (!contracts) {
    throw new Error("No contracts compiled in source.");
  }

  // Find exact contract name or fallback to the first compiled contract
  const targetName = contracts[contractName] ? contractName : Object.keys(contracts)[0];
  const contractData = contracts[targetName];

  return {
    abi: contractData.abi,
    bytecode: `0x${contractData.evm.bytecode.object}`
  };
}

/**
 * Endpoint: /create-token
 */
app.post("/create-token", async (req, res) => {
  try {
    const { name, symbol, max_token, decimals = 18 } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({ error: "Missing name or symbol" });
    }

    const erc20Sol = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    contract ParallelToken {
        string public name;
        string public symbol;
        uint8 public decimals;
        uint256 public totalSupply;
        mapping(address => uint256) public balanceOf;
        mapping(address => mapping(address => uint256)) public allowance;

        event Transfer(address indexed from, address indexed to, uint256 value);
        event Approval(address indexed owner, address indexed spender, uint256 value);

        constructor(string memory _name, string memory _symbol, uint256 _initialSupply, uint8 _decimals) {
            name = _name;
            symbol = _symbol;
            decimals = _decimals;
            totalSupply = _initialSupply * (10 ** uint256(_decimals));
            balanceOf[msg.sender] = totalSupply;
            emit Transfer(address(0), msg.sender, totalSupply);
        }

        function transfer(address to, uint256 value) public returns (bool success) {
            require(balanceOf[msg.sender] >= value, "Insufficient balance");
            balanceOf[msg.sender] -= value;
            balanceOf[to] += value;
            emit Transfer(msg.sender, to, value);
            return true;
        }

        function approve(address spender, uint256 value) public returns (bool success) {
            allowance[msg.sender][spender] = value;
            emit Approval(msg.sender, spender, value);
            return true;
        }

        function transferFrom(address from, address to, uint256 value) public returns (bool success) {
            require(balanceOf[from] >= value, "Insufficient balance");
            require(allowance[from][msg.sender] >= value, "Insufficient allowance");
            balanceOf[from] -= value;
            balanceOf[to] += value;
            allowance[from][msg.sender] -= value;
            emit Transfer(from, to, value);
            return true;
        }
    }
    `;

    console.log("Compiling ERC-20 contract...");
    const { abi, bytecode } = compileSolidity("ParallelToken", erc20Sol);

    if (req.body.compile_only) {
      return res.json({ success: true, abi, bytecode, args: [name, symbol, max_token.toString(), decimals.toString()] });
    }

    if (!walletClient) {
      return res.status(400).json({ error: "Backend deployer not configured. Connect via MetaMask/Rabby browser wallet to deploy." });
    }

    console.log("Deploying ERC-20 to Monad...");
    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      args: [name, symbol, BigInt(max_token), parseInt(decimals)],
      gas: 3000000n
    });

    const receipt = await walletClient.waitForTransactionReceipt({ hash, timeout: 60000 });
    const explorerUrl = `https://testnet.monadexplorer.com/tx/${hash}`;

    return res.status(201).json({
      success: true,
      name,
      symbol,
      contract_address: receipt.contractAddress,
      transaction_hash: hash,
      transaction_url: explorerUrl
    });

  } catch (error) {
    console.error("Token deployment error:", error);
    let msg = error.message || "Unknown deployment error";
    if (msg.includes("intrinsic gas") || msg.includes("exceeds the balance")) {
      msg = `Deployer account needs MON testnet tokens. Connect your browser wallet (MetaMask) to deploy directly. Details: ${error.message}`;
    }
    return res.status(500).json({ error: msg });
  }
});

/**
 * Endpoint: /deploy-nft
 */
app.post("/deploy-nft", async (req, res) => {
  try {
    const { name, symbol, base_uri } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({ error: "Missing name or symbol" });
    }

    const erc721Sol = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    contract ParallelNFT {
        string public name;
        string public symbol;
        string private _baseURIString;
        uint256 private _nextTokenId;
        address public owner;

        mapping(uint256 => address) private _owners;
        mapping(address => uint256) private _balances;
        mapping(uint256 => string) private _tokenURIs;

        event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

        constructor(string memory _name, string memory _symbol, string memory _baseUri) {
            name = _name;
            symbol = _symbol;
            _baseURIString = _baseUri;
            owner = msg.sender;
        }

        function mintItem(address recipient, string memory tokenURI) public returns (uint256) {
            require(msg.sender == owner, "Only owner can mint");
            uint256 tokenId = _nextTokenId++;
            _owners[tokenId] = recipient;
            _balances[recipient] += 1;
            _tokenURIs[tokenId] = tokenURI;

            emit Transfer(address(0), recipient, tokenId);
            return tokenId;
        }

        function tokenURI(uint256 tokenId) public view returns (string memory) {
            return string(abi.encodePacked(_baseURIString, _tokenURIs[tokenId]));
        }
    }
    `;

    console.log("Compiling NFT contract...");
    const { abi, bytecode } = compileSolidity("ParallelNFT", erc721Sol);

    if (req.body.compile_only) {
      return res.json({ success: true, abi, bytecode, args: [name, symbol, base_uri] });
    }

    if (!walletClient) {
      return res.status(400).json({ error: "Backend deployer not configured. Connect via MetaMask/Rabby browser wallet to deploy." });
    }

    console.log("Deploying NFT to Monad...");
    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      args: [name, symbol, base_uri],
      gas: 3000000n
    });

    const receipt = await walletClient.waitForTransactionReceipt({ hash, timeout: 60000 });
    const explorerUrl = `https://testnet.monadexplorer.com/tx/${hash}`;

    return res.status(201).json({
      success: true,
      name,
      symbol,
      contract_address: receipt.contractAddress,
      transaction_hash: hash,
      transaction_url: explorerUrl
    });

  } catch (error) {
    console.error("NFT deployment error:", error);
    let msg = error.message;
    if (msg && (msg.includes("intrinsic gas") || msg.includes("exceeds the balance"))) {
      msg = `Deployer account needs MON testnet tokens. Connect your browser wallet (MetaMask) to deploy directly. Details: ${error.message}`;
    }
    return res.status(500).json({ error: msg });
  }
});

/**
 * Endpoint: /mint-nft
 */
app.post("/mint-nft", async (req, res) => {
  try {
    const { contract_address, recipient, uri } = req.body;

    if (!contract_address || !recipient || !uri) {
      return res.status(400).json({ error: "Missing contract_address, recipient, or uri" });
    }

    const abi = [
      {
        inputs: [
          { name: "recipient", type: "address" },
          { name: "tokenURI", type: "string" }
        ],
        name: "mintItem",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function"
      }
    ];

    if (!walletClient) {
      return res.status(400).json({ error: "Backend deployer not configured. Connect via MetaMask/Rabby browser wallet to mint." });
    }

    console.log("Minting NFT item...");
    const hash = await walletClient.writeContract({
      address: contract_address,
      abi,
      functionName: "mintItem",
      args: [recipient, uri]
    });

    await walletClient.waitForTransactionReceipt({ hash, timeout: 60000 });
    const explorerUrl = `https://testnet.monadexplorer.com/tx/${hash}`;

    return res.json({
      success: true,
      contract_address,
      recipient,
      transaction_hash: hash,
      transaction_url: explorerUrl
    });

  } catch (error) {
    console.error("NFT minting error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: /deploy-contract
 */
app.post("/deploy-contract", async (req, res) => {
  try {
    let solidityCode;
    if (req.headers["content-type"] === "application/json" || req.body.code) {
      solidityCode = req.body.code;
    } else {
      solidityCode = req.body;
    }

    if (!solidityCode) {
      return res.status(400).json({ error: "No contract code provided" });
    }

    console.log("Compiling custom Solidity contract...");
    const { abi, bytecode } = compileSolidity("CustomContract", solidityCode);

    if (req.body.compile_only) {
      return res.json({ success: true, abi, bytecode, args: [] });
    }

    if (!walletClient) {
      return res.status(400).json({ error: "Backend deployer not configured. Connect via MetaMask/Rabby browser wallet to deploy." });
    }

    console.log("Deploying custom contract to Monad...");
    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      gas: 3000000n
    });

    const receipt = await walletClient.waitForTransactionReceipt({ hash, timeout: 60000 });
    const explorerUrl = `https://testnet.monadexplorer.com/tx/${hash}`;

    return res.status(201).json({
      success: true,
      contract_address: receipt.contractAddress,
      transaction_hash: hash,
      transaction_url: explorerUrl
    });

  } catch (error) {
    console.error("Custom contract deployment error:", error);
    let msg = error.message;
    if (msg && (msg.includes("intrinsic gas") || msg.includes("exceeds the balance"))) {
      msg = `Deployer account needs MON testnet tokens. Connect your browser wallet (MetaMask) to deploy directly. Details: ${error.message}`;
    }
    return res.status(500).json({ error: msg });
  }
});

/**
 * Endpoint: /build-contract
 */
app.post("/build-contract", (req, res) => {
  try {
    const { instructions = "", contractName = "GeneratedContract" } = req.body;
    const lowerInstructions = instructions.toLowerCase();

    const cleanName = contractName.replace(/[^a-zA-Z0-9_]/g, "") || "GeneratedContract";

    let code;
    let explanation;

    if (lowerInstructions.includes("counter")) {
      code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ${cleanName} {
    uint256 public count;

    function increment() public {
        count += 1;
    }

    function decrement() public {
        require(count > 0, "Counter underflow");
        count -= 1;
    }
}
`;
      explanation = "A minimal counter smart contract written in Solidity with increment, decrement, and getter features.";
    } else if (lowerInstructions.includes("token") || lowerInstructions.includes("erc20")) {
      code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ${cleanName} {
    string public name = "Monad Spark Token";
    string public symbol = "SPARK";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**18;
    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor() {
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
}
`;
      explanation = "A standard Solidity ERC-20 token contract declaring custom initial supply and name/symbol parameters.";
    } else if (lowerInstructions.includes("voting") || lowerInstructions.includes("ballot")) {
      code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ${cleanName} {
    mapping(address => bool) public hasVoted;
    uint256 public yesVotes;
    uint256 public noVotes;

    function vote(bool support) public {
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        if (support) {
            yesVotes += 1;
        } else {
            noVotes += 1;
        }
    }
}
`;
      explanation = "A simple voting ballot contract supporting vote casting and counting.";
    } else {
      code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ${cleanName} {
    string public description = "Auto-generated contract for Monad Testnet";
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function updateDescription(string memory newDesc) public {
        require(msg.sender == owner, "Only owner can update");
        description = newDesc;
    }
}
`;
      explanation = "A customizable Solidity contract featuring owner-locked state modifier variables.";
    }

    return res.json({
      success: true,
      contractCode: code,
      contractName: cleanName,
      contractType: "Solidity",
      explanation
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`📡 Express Solidity Compiler service listening on port ${PORT}`);
});
