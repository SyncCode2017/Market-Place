const { getNamedAccounts, ethers } = require("hardhat")
//const { network, deployments } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const accounts = await ethers.getSigners()
    const userSell = accounts[1]
    const userBuy = accounts[2]
    //await deployments.fixture(["all"])
    const marketPlace = await ethers.getContract("Marketplace")
    console.log(`Got contract MarketPlace at ${marketPlace.address}`)

    console.log("Listing an item to sell")
    const marketPlaceConnected = await marketPlace.connect(userSell)
    const tx = await marketPlaceConnected.makeOrder(
        "orange",
        10,
        ethers.utils.parseEther("0.1")
    )
    await tx.wait(1)
    const tx1 = await marketPlaceConnected.makeOrder(
        "mango",
        15,
        ethers.utils.parseEther("0.3")
    )
    await tx1.wait(1)
    const tx2 = await marketPlaceConnected.makeOrder(
        "rice",
        5,
        ethers.utils.parseEther("2")
    )
    await tx2.wait(1)
    console.log("Listed!")
    const openOrder = await marketPlace.open_order()

    console.log("[OrderId], [Items], [Quantity Available], [Price /1000]")
    console.log(`The open orders are ${openOrder}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
