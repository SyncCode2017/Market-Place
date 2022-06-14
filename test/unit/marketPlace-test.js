const { getNamedAccounts, deployments, ethers } = require("hardhat")
//const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { assert, expect } = require("chai")

describe("Marketplace", function () {
    let marketPlace
    //let mockV3Aggregator
    let deployer
    const sendValue = ethers.utils.parseEther("1")
    //const withdrawValue = ethers.utils.parseEther("0.5")
    beforeEach(async () => {
        const accounts = await ethers.getSigners()
        const userSell = accounts[1]
        const userBuy = accounts[2]
        const { deployer } = await getNamedAccounts()
        await deployments.fixture(["all"])
        marketPlace = await ethers.getContract("Marketplace")
    })

    describe("deposit", function () {
        it("Updates the amount deposit data structure", async () => {
            await marketPlace.depositEther({ value: sendValue })
            const response = await marketPlace.myBalance()
            // assert.equal(response.toString(), sendValue.toString())
        })
    })
    describe("withdraw", function () {
        beforeEach(async () => {
            await marketPlace.depositEther({ value: sendValue })
        })
        it("withdraws ETH", async () => {
            const startingDeployerBalance =
                await marketPlace.provider.myBalance()

            // Act
            const transactionResponse = await marketPlace.withdrawEther(
                sendValue
            )
            const transactionReceipt = await transactionResponse.wait()
            // const { gasUsed, effectiveGasPrice } = transactionReceipt
            // const gasCost = gasUsed.mul(effectiveGasPrice)

            // const endingDeployerBalance = await marketPlace.provider.balanceOf(
            //     deployer
            // )

            // // Assert
            // assert.equal(endingDeployerBalance, 0)
        })
    })
})
