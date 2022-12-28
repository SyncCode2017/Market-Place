require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const KOVAN_RPC_URL =
    process.env.KOVAN_RPC_URL ||
    "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x11ee3108a0302943effc4a"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL
const PRIVATE_KEY_1 =  process.env.PRIVATE_KEY_P || "0000000000000000000000000000000000000000000000000000000000000000"
const PRIVATE_KEY_2 =  process.env.PRIVATE_KEY_Hardhat_0 || "0000000000000000000000000000000000000000000000000000000000000000"

module.exports = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.8.7" }],
    },

    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
        localhost: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
        kovan: {
            url: KOVAN_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 42,
            blockConfirmations: 6,
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 4,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 4,
        },
        polygonMumbai: {
            url             : POLYGON_MUMBAI_RPC_URL,
            chainId         : 80001,
            accounts        : [PRIVATE_KEY, PRIVATE_KEY_1, PRIVATE_KEY_2],
            saveDeployments : true,
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            4: 0,
            80001: 0,
        },
        userSell: {
            default: 1,
            80001: 1,
        },
        userBuy: {
            default: 2,
            80001: 2,
        },
    },
}
