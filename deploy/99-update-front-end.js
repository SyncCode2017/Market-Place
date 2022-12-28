const {
    frontEndContractsFile,
    // frontEndContractsFile2,
    frontEndAbiLocation,
    // frontEndAbiLocation2,
} = require("../helper-hardhat-config")
require("dotenv").config()
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const marketplace = await ethers.getContract("Marketplace")
    fs.writeFileSync(
        `${frontEndAbiLocation}Marketplace.json`,
        marketplace.interface.format(ethers.utils.FormatTypes.json)
    )
    // fs.writeFileSync(
    //     `${frontEndAbiLocation2}Marketplace.json`,
    //     marketplace.interface.format(ethers.utils.FormatTypes.json)
    // )

    // const basicNft = await ethers.getContract("BasicNft")
    // fs.writeFileSync(
    //     `${frontEndAbiLocation}BasicNft.json`,
    //     basicNft.interface.format(ethers.utils.FormatTypes.json)
    // )
    // fs.writeFileSync(
    //     `${frontEndAbiLocation2}BasicNft.json`,
    //     basicNft.interface.format(ethers.utils.FormatTypes.json)
    // )
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const marketplace = await ethers.getContract("Marketplace")
    const contractAddresses = JSON.parse(
        fs.readFileSync(frontEndContractsFile, "utf8")
    )
    if (chainId in contractAddresses) {
        if (
            !contractAddresses[chainId]["Marketplace"].includes(
                marketplace.address
            )
        ) {
            contractAddresses[chainId]["Marketplace"].push(marketplace.address)
        }
    } else {
        contractAddresses[chainId] = {
            Marketplace: [marketplace.address],
        }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
    // fs.writeFileSync(frontEndContractsFile2, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]
