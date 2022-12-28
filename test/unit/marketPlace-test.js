const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts, getUnnamedAccounts } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")
const { setupUser, setupUsers } = require("../../utils/helper-functions")

const setup = deployments.createFixture(async () => {
    await deployments.fixture()
    const { deployer, userSell, userBuy } = await getNamedAccounts()

    const contracts = {
        marketplace  : await ethers.getContract("Marketplace"),
    }

    return {
        ...contracts,
        users    : await setupUsers(await getUnnamedAccounts(), contracts),
        deployer : await setupUser(deployer, contracts),
        userBuy    : await setupUser(userBuy, contracts),
        userSell     : await setupUser(userSell, contracts),

    }
})

const verifyItemsAllowed = async(items) => {
    
    for (const item of items) {
        const isAllowed  = await marketPlace.allowedItems(item)
        assert.equal( isAllowed, true)
    }
}

describe("Marketplace Unit Tests", async function () {
    let marketplace, userSell, userBuy, deployer
    const unitValue = ethers.utils.parseEther("10")
    const dict_item = [
        "orange",
        "bread",
        "mango",
        "bannana",
        "beans",
        "rice",
        "32in-bone-straight-wig",
    ]

    beforeEach(async () => {
        await deployments.fixture(["all"])
        ({ deployer, userBuy, userSell, marketplace } = await setup())
    })

    describe("allowed items", function () {
        it("allows the owner to add allowed items", async () => {
            for (let i = 0; i < dict_item.length; i++) {
                const transactionResponse = await deployer.marketPlace.addAllowedItems(
                    dict_item[i]
                )
                await transactionResponse.wait()
            }
            assert.equal(response.toString(), sendValue.toString())
        })
    })
    // describe("withdraw", function () {
    //     //   beforeEach(async () => {
    //     //       //await marketPlaceConnected.depositEther({ value: sendValue })
    //     //   })
    //     it("withdraws ETH", async () => {
    //         const startingBalance = await userBuy.marketplace.myBalance()

    //         // Act
    //         const transactionResponse = await marketPlaceConnected.withdrawEther(startingBalance)
    //         const transactionReceipt = await transactionResponse.wait(1)
    //         //   const { gasUsed, effectiveGasPrice } = transactionReceipt
    //         //   const gasCost = gasUsed.mul(effectiveGasPrice)

    //         const endingBalance = await marketPlaceConnected.myBalance()

    //         // Assert
    //         assert.equal(endingBalance, "0")
    //     })
    //     it("Can only withdraw your balance", async () => {
    //         //const { deployer } = await getNamedAccounts()
    //         const marketPlaceDeployerConnected =
    //                   await marketPlace.connect(deployer)

    //         // Act
    //         await expect(
    //             marketPlaceDeployerConnected.withdrawEther()
    //         ).to.be.revertedWith("Marketplace__ZeroBalance")
    //     })
    // })
})
