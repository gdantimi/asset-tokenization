var DagiToken = artifacts.require("./DagiToken.sol");
var DagiTokenSale = artifacts.require("./DagiTokenSale.sol");
var KycContract = artifacts.require("./KycContract.sol");

module.exports = async function (deployer) {
    let addresses = await web3.eth.getAccounts();
    await deployer.deploy(DagiToken);
    await deployer.deploy(KycContract);
    try {

        await deployer.deploy(DagiTokenSale, 1, addresses[0], DagiToken.address, KycContract.address);

        let dagiTokenInstance = await DagiToken.deployed();
        await dagiTokenInstance.transfer(DagiTokenSale.address, 1000);
    } catch (error) {
        console.log(error)
    }
};