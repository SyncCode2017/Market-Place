const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const accounts = await ethers.getSigners()
    const userSell = accounts[1]
    const userBuy = accounts[2]
    const marketPlace = await ethers.getContract("Marketplace", deployer)
    console.log(`Got contract MarketPlace at ${marketPlace.address}`)
    console.log("Depositing ...")
    console.log(`the user is ${userBuy.address}`)
    const marketPlaceConnected = await marketPlace.connect(userBuy)
    // await marketPlaceConnected.approve(
    //     marketPlace.address,
    //     ethers.utils.parseEther("10")
    // )
    const transactionResponse = await marketPlaceConnected.depositEther({
        value: ethers.utils.parseEther("100"),
    })

    await transactionResponse.wait(1)
    console.log("Deposited!")
    const myBalance = await marketPlaceConnected.myBalance()
    const fmyBalance = ethers.utils.formatEther(myBalance, "ether")

    console.log(`Your balance is ${fmyBalance}`)
    const tx = await marketPlaceConnected.withdrawEther(
        ethers.utils.parseEther("10")
    )
    const newBalance = await marketPlaceConnected.myBalance()

    const fnewBalance = ethers.utils.formatEther(newBalance, "ether")
    console.log(`After withdrawal, your new balance is ${fnewBalance}`)

    // Making transactions
    console.log(`I want to buy ...`)
    const trx = await marketPlaceConnected.fillOrder(3, 2)
    await trx.wait(1)
    const trx1 = await marketPlaceConnected.fillOrder(1, 5)
    await trx1.wait(1)
    const trx2 = await marketPlaceConnected.fillOrder(5, 5)
    await trx2.wait(1)
    console.log("Bought something! ...")
    console.log(" ")
    console.log("-------------------------------------------")
    const tranx1 = await marketPlaceConnected.cancelFilledOrder(5)
    await tranx1.wait(1)
    const IBalance = await marketPlaceConnected.myBalance()

    const fIBalance = ethers.utils.formatEther(IBalance, "ether")
    console.log(`After cancelling an order, your new balance is ${fIBalance}`)
    console.log("-------------------------------------------")
    console.log(" ")
    const tranx = await marketPlaceConnected.OrderReceived(3)
    await tranx.wait(1)
    console.log("--------Buyer received the order!-------------------")
    const buyerBalance = await marketPlaceConnected.myBalance()
    const fbuyerBalance = ethers.utils.formatEther(buyerBalance, "ether")
    console.log(`After buying, buyer balance is ${fbuyerBalance}`)

    //Getting Seller Balance
    const marketPlaceSellerConnected = await marketPlace.connect(userSell)
    const sellerBalance = await marketPlaceSellerConnected.myBalance()
    const fsellerBalance = ethers.utils.formatEther(sellerBalance, "ether")
    console.log(" ")
    console.log(`After selling, seller balance is ${fsellerBalance}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
