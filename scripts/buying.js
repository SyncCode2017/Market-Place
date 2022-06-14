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
    // const myBalance = await marketPlace.myBalance(
    //     "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
    // )
    //await myBalance.wait(1)
    console.log(`Your balance is ${myBalance}`)
    const tx = await marketPlaceConnected.withdrawEther(
        ethers.utils.parseEther("10"),
        {
            from: userBuy.address,
        }
    )
    const newBalance = await marketPlaceConnected.myBalance()
    console.log(`After withdrawal, your new balance is ${newBalance}`)

    // Buying
    console.log(`I want to buy ...`)
    const trx = await marketPlaceConnected.fillOrder(1, 10)
    await trx.wait(1)
    console.log(`Bought something! ...`)
    const tranx = await marketPlaceConnected.OrderReceived(1)
    await tranx.wait(1)
    const buyerBalance = await marketPlaceConnected.myBalance()
    console.log(`After buying, buyer balance is ${buyerBalance}`)

    //Getting Seller Balance
    const marketPlaceSellerConnected = await marketPlace.connect(userSell)
    const sellerBalance = await marketPlaceSellerConnected.myBalance()
    console.log(`After buying, seller balance is ${sellerBalance}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
