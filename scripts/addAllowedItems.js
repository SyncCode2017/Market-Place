const { getNamedAccounts, ethers } = require("hardhat")
const { network  } = require("hardhat")
const { moveBlocks, sleep } = require("../utils/move-blocks")

const dict_item = [
    "orange",
    "bread",
    "mango",
    "bannana",
    "beans",
    "rice",
    "32in-bone-straight-wig",
]

async function main() {
    const chainId = network.config.chainId
    const { deployer } = await getNamedAccounts()
    const accounts = await ethers.getSigners()
    const userSell = accounts[1]
    const userBuy = accounts[2]
    const marketPlace = await ethers.getContract("Marketplace", deployer)
    //const marketPlaceConnected = await marketPlace.connect(deployer)
    console.log(`Got contract MarketPlace at ${marketPlace.address}`)

    console.log("Updating supported items...")
    for (let i = 0; i < dict_item.length; i++) {
        const transactionResponse = await marketPlace.addAllowedItems(
            dict_item[i]
        )

        await transactionResponse.wait()
        console.log("entered ...")
    }
    // console.log(`allowed items are ${allowedItems}`)
    if (chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
