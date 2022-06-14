const { getNamedAccounts, ethers } = require("hardhat")
//const { network, deployments } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const accounts = await ethers.getSigners()
    const userSell = accounts[1]
    const userBuy = accounts[2]
    //await deployments.fixture(["all"])
    const marketPlace = await ethers.getContract("Marketplace", deployer)
    console.log(`Got contract MarketPlace at ${marketPlace.address}`)

    console.log("Listing an item to sell")
    const marketPlaceConnected = await marketPlace.connect(userSell)
    const tx = await marketPlaceConnected.makeOrder("orange", 20, 20)
    await tx.wait(1)
    //const openOrder = await marketPlaceConnected.open_order
    //console.log(`The open orders are ${toString(openOrder)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
