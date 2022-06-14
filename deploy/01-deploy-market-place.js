const { getNamedAccounts, deployments, network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
// let ethAddress
// const getEthAddress = async () => {
//     let eth_Address
//     if (developmentChains.includes(network.name)) {
//         const token = await deployments.get("Token")
//         eth_Address = token.address
//     } else {
//         eth_Address = networkConfig[chainId]["eth_address"]
//     }
//     return eth_Address
// }
// module.exports = getEthAddress
// ethAddress = getEthAddress()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("----------------------------------------------------")
    log("Deploying MarketPlace and waiting for confirmations...")
    const marketPlace = await deploy("Marketplace", {
        from: deployer,
        args: [deployer, 5],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`MarketPlace deployed at ${marketPlace.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(marketPlace.address, [deployer, 5])
    }
}
//module.exports = ethAddress
module.exports.tags = ["all", "marketplace"]
// to run only this script
// yarn hardhat deploy --tags marketplace
