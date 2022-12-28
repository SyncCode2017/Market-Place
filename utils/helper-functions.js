const { ethers } = require("hardhat")

const setupUsers = async(addresses, contracts) => {
    const users = []
    for (const address of addresses) {
        users.push(await setupUser(address, contracts))
    }
    return users
}

const setupUser = async(address, contracts) => {
    const user = { address: address, signer: await ethers.getSigner(address) }
    for (const key of Object.keys(contracts)) {
        user[key] = contracts[key].connect(await ethers.getSigner(address))
    }
    return user 
}

module.exports = { setupUser,setupUsers }