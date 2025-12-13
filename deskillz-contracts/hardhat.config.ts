import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

// Default private key for local testing (DO NOT USE IN PRODUCTION)
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      evmVersion: "paris",
    },
  },
  
  networks: {
    // Local development
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    // BSC Testnet
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: [DEPLOYER_PRIVATE_KEY],
      gasPrice: 10000000000, // 10 gwei
    },
    
    // BSC Mainnet
    bscMainnet: {
      url: process.env.BSC_MAINNET_RPC || "https://bsc-dataseed.binance.org",
      chainId: 56,
      accounts: [DEPLOYER_PRIVATE_KEY],
      gasPrice: 5000000000, // 5 gwei
    },
  },
  
  // BSCScan verification
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
    },
  },
  
  // Gas reporting
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    token: "BNB",
    gasPriceApi: "https://api.bscscan.com/api?module=proxy&action=eth_gasPrice",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  
  // TypeChain settings
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  
  // Paths
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  // Mocha settings for tests
  mocha: {
    timeout: 60000, // 60 seconds for blockchain tests
  },
};

export default config;
