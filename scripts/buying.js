const { ethers, getNamedAccounts } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

async function main() {
    const { deployer } = await getNamedAccounts()
    const accounts = await ethers.getSigners()
    const userSell = accounts[1]
    const userBuy = accounts[2]
    const marketPlace = await ethers.getContract("Marketplace", deployer)
    console.log(`Got contract MarketPlace at ${marketPlace.address}`)
    const marketPlaceConnected = await marketPlace.connect(userBuy)
    const marketPlaceSellerConnected = await marketPlace.connect(userSell)

    console.log("Deposited!")
    const myBalance = await marketPlaceConnected.myBalance()
    const fmyBalance = ethers.utils.formatEther(myBalance, "ether")

    console.log(`Your balance is ${fmyBalance}`)

    const payment = ethers.utils.parseEther("10")

    // Making transactions
    console.log("I want to buy ...")
    const trx = await marketPlaceConnected.fillOrder(3, 2, {value: payment.mul(2)})
    await trx.wait()
    const trx1 = await marketPlaceConnected.fillOrder(1, 5, {value: payment.mul(5)})
    await trx1.wait()
    const trx2 = await marketPlaceConnected.fillOrder(2, 5, {value: payment.mul(5)})
    await trx2.wait()
    const trx3 = await marketPlaceConnected.fillOrder(5, 1, {value: payment})
    await trx3.wait()
    console.log("Bought something! ...")
    console.log(" ")
    console.log("-------------------------------------------")
    const tranx1 = await marketPlaceConnected.cancelFilledOrder(2)
    await tranx1.wait()
    const IBalance = await marketPlaceConnected.myBalance()

    const fIBalance = ethers.utils.formatEther(IBalance, "ether")
    console.log(
        `After cancelling a filled order, Buyer new balance is ${fIBalance}`
    )
    console.log("-------------------------------------------")
    const tranx2 = await marketPlaceSellerConnected.cancelOpenOrder(4)
    await tranx2.wait()
    const ICBalance = await marketPlaceSellerConnected.myBalance()

    const fICBalance = ethers.utils.formatEther(ICBalance, "ether")
    console.log(
        `After cancelling an open order, Seller new balance is ${fICBalance}`
    )
    console.log("-------------------------------------------")
    console.log(" ")
    const tranx = await marketPlaceConnected.OrderReceived(3)
    await tranx.wait()
    const tranx3 = await marketPlaceConnected.OrderReceived(5)
    await tranx3.wait()
    console.log("--------Buyer received the order!-------------------")
    const buyerBalance = await marketPlaceConnected.myBalance()
    const fbuyerBalance = ethers.utils.formatEther(buyerBalance, "ether")
    console.log(`After buying, buyer balance is ${fbuyerBalance}`)

    // Getting Seller Balance
    //const marketPlaceSellerConnected = await marketPlace.connect(userSell)
    const sellerBalance = await marketPlaceSellerConnected.myBalance()
    const fsellerBalance = ethers.utils.formatEther(sellerBalance, "ether")
    console.log(" ")
    console.log(`After selling, seller balance is ${fsellerBalance}`)

    // Getting FeeAccount Balance
    //const marketPlaceSellerConnected = await marketPlace.connect(userSell)
    const feeAcctBalance = await marketPlace.myBalance()
    const deployerBalance = ethers.utils.formatEther(feeAcctBalance, "ether")
    console.log(" ")
    console.log(`After selling, fee account balance is ${deployerBalance}`)
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
