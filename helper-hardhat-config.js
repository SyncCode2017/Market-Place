const networkConfig = {
    31337: {
        name: "localhost",
    },

    4: {
        name: "rinkeby",
        eth_address: "0x11D634457F99595aBE7B582739fd52b7ed48995A",
    },
    42: {
        name: "kovan",
        eth_address: "0x806a8543F1b28b3623078AD66551102485a84A8F",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
