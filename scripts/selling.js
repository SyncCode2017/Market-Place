const { getNamedAccounts, ethers, network } = require("hardhat")
//const { network, deployments } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

async function main() {
    const price = ethers.utils.parseEther("10")
    const accounts = await ethers.getSigners()
    const userSell = accounts[1]
    // const userBuy = accounts[2]
    //await deployments.fixture(["all"])
    const marketPlace = await ethers.getContract("Marketplace")
    console.log(`Got contract MarketPlace at ${marketPlace.address}`)

    console.log("Listing an item to sell")
    const marketPlaceConnected = await marketPlace.connect(userSell)
    const tx = await marketPlaceConnected.makeOrder(
        "orange",
        10,
        price
    )
    await tx.wait(1)
    const tx1 = await marketPlaceConnected.makeOrder(
        "mango",
        15,
        price
    )
    await tx1.wait(1)
    const tx2 = await marketPlaceConnected.makeOrder(
        "rice",
        5,
        price
    )
    await tx2.wait(1)
    const tx3 = await marketPlaceConnected.makeOrder(
        "orange",
        20,
        price
    )
    await tx3.wait(1)
    const tx4 = await marketPlaceConnected.makeOrder(
        "32in-bone-straight-wig",
        1,
        price
    )
    await tx4.wait(1)
    console.log("Listed!")
    const openOrder = await marketPlace.open_order()

    console.log("[OrderId], [Items], [Quantity Available], [Price /1000]")
    console.log(`The open orders are ${openOrder}`)

    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
