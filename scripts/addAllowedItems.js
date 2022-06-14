const { getNamedAccounts, ethers } = require("hardhat")
//const { network, deployments,  } = require("hardhat")

const dict_item = ["orange", "bread", "mango", "bannana", "beans", "rice"]
var allowedItems = []

async function main() {
    const { deployer } = await getNamedAccounts()
    const accounts = await ethers.getSigners()
    const userSell = accounts[1]
    const userBuy = accounts[2]
    //await deployments.fixture(["all"])
    const marketPlace = await ethers.getContract("Marketplace", deployer)
    //const marketPlaceConnected = await marketPlace.connect(deployer)
    console.log(`Got contract MarketPlace at ${marketPlace.address}`)

    console.log("Updating supported items...")
    // const transactionResponse = await marketPlace.addAllowedItems(
    //     dict_item[0].toString,
    //     {
    //         from: deployer.address,
    //     }
    // )
    //await transactionResponse.wait(1)
    dict_item.forEach(storeItem)

    async function storeItem(item) {
        const transactionResponse = await marketPlace.addAllowedItems(item)
        await transactionResponse.wait(1)
    }

    // const items = dict_item.length
    // for (let i = 0; i < items; i++) {
    //     const transactionResponse = await marketPlace.addAllowedItems(
    //         dict_item[i]
    //     )

    //     await transactionResponse.wait(1)
    //     console.log(`${transactionResponse}`)
    // }
    allowedItems = await marketPlace.allowedItems
    console.log(`allowed items are ${toString(allowedItems)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
