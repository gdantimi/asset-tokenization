const token = artifacts.require("DagiToken");

const BN = web3.utils.BN;
const chai = require("./ChaiSetup");
const expect = chai.expect;
const initialSupply = 1000;

contract("Token test", async accounts => {
    const [initialHolder, recipient] = accounts;

    beforeEach(async () => {
        this.dagiToken = await token.new();
    });

    it("All tokens should be in the initial account", async () => {
        let instance = this.dagiToken;
        let totalSupply = await instance.totalSupply();

        await expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(totalSupply);
    });


    it("Should send tokens from the initial holder to the recipient account", async () => {
        const tokensToSend = 1;

        let instance = this.dagiToken;
        let totalSupply = await instance.totalSupply();

        await expect(instance.transfer(recipient, tokensToSend)).to.eventually.be.fulfilled;
        await expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(tokensToSend)));
        expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(tokensToSend));
    });

    it("Should not possible to send more tokens than holder account has", async () => {
        const tokensToSend = initialSupply + 1;

        let instance = this.dagiToken;
        let totalSupply = await instance.totalSupply();
        let recipientBalance = await instance.balanceOf(recipient);

        await expect(instance.transfer(recipient, tokensToSend)).to.eventually.be.rejected;
        await expect(instance.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(totalSupply);
        expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(recipientBalance);
    });

});