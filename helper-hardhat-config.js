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
    5: {
        name: "goerli",
        eth_address: "",
        blockConfirmations: 10,
    },
}
const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
const marketFeeInPercent = 5
const frontEndContractsFile =
    "../nextjs-marketplace/constants/networkMapping.json"
// const frontEndContractsFile2 =
//     "../nextjs-nft-marketplace-thegraph-fcc/constants/networkMapping.json"
const frontEndAbiLocation = "../nextjs-marketplace/constants/"
// const frontEndAbiLocation2 = "../nextjs-nft-marketplace-thegraph-fcc/constants/"

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    frontEndContractsFile,
    //frontEndContractsFile2,
    frontEndAbiLocation,
    marketFeeInPercent,
    //frontEndAbiLocation2,
}
