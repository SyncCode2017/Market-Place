const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Marketplace Unit Tests", async function () {
          let marketPlace, sendValue, accounts, userSell, userBuy, deployer

          beforeEach(async () => {
              await deployments.fixture(["all"])
              marketPlace = await ethers.getContract("Marketplace")
              sendValue = ethers.utils.parseEther("10")
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              userSell = accounts[1]
              userBuy = accounts[2]
          })

          describe("deposit", function () {
              it("Updates the amount deposit in data structure", async () => {
                  const marketPlaceConnected = await marketPlace.connect(
                      userBuy
                  )
                  await marketPlaceConnected.depositEther({ value: sendValue })
                  const response = await marketPlaceConnected.myBalance()
                  assert.equal(response.toString(), sendValue.toString())
              })
          })
          describe("withdraw", function () {
              //   beforeEach(async () => {
              //       //await marketPlaceConnected.depositEther({ value: sendValue })
              //   })
              it("withdraws ETH", async () => {
                  const marketPlaceConnected = await marketPlace.connect(
                      userBuy
                  )
                  const startingBalance = await marketPlaceConnected.myBalance()

                  // Act
                  const transactionResponse =
                      await marketPlaceConnected.withdrawEther(startingBalance)
                  const transactionReceipt = await transactionResponse.wait(1)
                  //   const { gasUsed, effectiveGasPrice } = transactionReceipt
                  //   const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingBalance = await marketPlaceConnected.myBalance()

                  // Assert
                  assert.equal(endingBalance, "0")
              })
              it("Can only withdraw your balance", async () => {
                  //const { deployer } = await getNamedAccounts()
                  const marketPlaceDeployerConnected =
                      await marketPlace.connect(deployer)

                  // Act
                  await expect(
                      marketPlaceDeployerConnected.withdrawEther(sendValue)
                  ).to.be.revertedWith("Marketplace__SmallerBalance")
              })
          })
      })
