const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")

const pricePerUnit = ethers.utils.parseEther("10")
const quantity = 10
const dict_item = [
    "orange",
    "bread",
    "mango",
    "bannana",
    "beans",
    "rice",
    "32in-bone-straight-wig",
]
const invalidItem = "blue"

describe("Marketplace Unit Tests", async function () {
    let marketplace, marketplaceConnected, deployer, userBuy, userSell, accounts, marketplaceSeller, marketplaceBuyer
  
    beforeEach(async () => {
        accounts = await ethers.getSigners() 
        deployer = accounts[0]
        userSell = accounts[1]
        userBuy = accounts[2]
        await deployments.fixture(["all"])
        await deployments.fixture(["marketplace"])
        marketplace = await ethers.getContract("Marketplace")
        marketplaceConnected = await ethers.getContract("Marketplace", deployer)
        marketplaceSeller = await marketplace.connect(userSell)
        marketplaceBuyer = await marketplace.connect(userBuy)
    })

    describe("allowed items", function () {
        it("allows the owner to add allowed items", async () => {
            for (const item of dict_item) {
                const trx = await marketplaceConnected.addAllowedItems(item)
                await trx.wait()
                const isAllowed  = await marketplace.allowedItems(item)
                assert.equal(isAllowed, true)
            }
        })
        it("does not allow other users to add allowed items ", async () => {
            await expect(
                marketplaceBuyer.addAllowedItems("bread")
            ).to.be.revertedWith("Marketplace__NotOwner()")
        })
    })

    describe("Listing", function () {
        beforeEach(async () => {
            for (const item of dict_item) {
                const trx = await marketplaceConnected.addAllowedItems(item)
                await trx.wait()
            }
        })
        it("allows listing of a valid item", async () => {
            const trx = await marketplaceSeller.createListing(dict_item[1], quantity, pricePerUnit)
            await trx.wait()
            const orderCount  = await marketplace.orderCount()
            const orderStruct = await marketplace.orders(orderCount)
            assert.equal(orderStruct.seller, userSell.address)
            assert.equal(orderStruct.item, dict_item[1])
            assert.equal(Number(orderStruct.price), pricePerUnit)
        })
        it("does not allow listing of an invalid item", async () => {
            await expect(
                marketplaceSeller.createListing(invalidItem, quantity, pricePerUnit)
            ).to.be.revertedWith("Marketplace__ItemNotAllowed()")
        })
    })
})
