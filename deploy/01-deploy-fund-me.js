// function deployFunc(hre) {
//     console.log("Hi")
// }

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { getNamedAccounts, deployments, network } = require("hardhat")
const { verify } = require("../utils/verify")

// module.exports.default = deployFunc

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre
// }

//const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress

    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("NewMockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")

    const fundme = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundme.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundme.address, [ethUsdPriceFeedAddress])
    }
}

module.exports.tags = ["all", "fundme"]
