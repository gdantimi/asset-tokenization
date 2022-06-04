const token = artifacts.require("DagiToken");
const tokenSale = artifacts.require("DagiTokenSale");
const kycContract = artifacts.require("KycContract");



const BN = web3.utils.BN;
const chai = require("./ChaiSetup");
const expect = chai.expect;

contract("Token Sale test", async accounts => {
    const [initialHolder, recipient, anotherAccount] = accounts;

    it("Initial holder account should be empty", async () => {
        let tokenInstance = await token.deployed();

        expect(tokenInstance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(new BN(0));
    });

    it("All tokens should be in the token sale smart contract", async () => {
        let tokenInstance = await token.deployed();

        let totalSupply = await tokenInstance.totalSupply();
        let tokenSaleContractBalance = await tokenInstance.balanceOf(tokenSale.address)

        expect(tokenSaleContractBalance).to.be.a.bignumber.equal(totalSupply);
    });

    it("should be possible to buy one token by sending ether to the smart contract", async () => {
        let tokenInstance = await token.deployed();
        let tokenSaleInstance = await tokenSale.deployed();

        let recipientBalance = await tokenInstance.balanceOf(recipient);

        let kycInstance = await kycContract.deployed();
        await kycInstance.setKycCompleted(recipient);

        await expect(tokenSaleInstance.sendTransaction({ from: recipient, value: web3.utils.toWei("1", "wei") })).to.be.fulfilled;
        let recipientBalanceAfterTransaction = await tokenInstance.balanceOf(recipient);

        expect(recipientBalanceAfterTransaction).to.be.a.bignumber.equal(recipientBalance + 1)

    });

});