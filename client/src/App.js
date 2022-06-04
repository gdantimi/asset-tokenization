import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import DagiToken from "./contracts/DagiToken.json";
import DagiTokenSale from "./contracts/DagiTokenSale.json";
import KycContract from "./contracts/KycContract.json";


import "./App.css";

class App extends Component {

  state = {};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      await this.refreshAccounts();

      // Get the contract instance.
      //this.networkId = await this.web3.eth.net.getId(); <<- this doesn't work with MetaMask anymore
      this.networkId = await this.web3.eth.net.getId();

      const self = this;

      window.ethereum.on('accountsChanged', function (accounts) {
        this.accounts = self.refreshAccounts();
      })

      this.myToken = new this.web3.eth.Contract(
        DagiToken.abi,
        DagiToken.networks[this.networkId] && DagiToken.networks[this.networkId].address,
      );

      this.myTokenSale = new this.web3.eth.Contract(
        DagiTokenSale.abi,
        DagiTokenSale.networks[this.networkId] && DagiTokenSale.networks[this.networkId].address,
      );
      this.kycContract = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      await this.getCoinsBalance();
      await this.getCoinsSupply();
      this.contractOwner = await this.myToken.methods.owner().call();

      this.listenToTokenTransfer();
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      const initialState = {
        loaded: true,
        tokenSaleAddress: this.myTokenSale._address,
        tokenContractAddress: this.myToken._address,
        amountToBuy: 1,
        amountToMint: 10,
        userBalance: 0
      };
      this.setState(initialState);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }

  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Dagi Tokens</h1>
        <h6>Contract owner: {this.contractOwner}</h6>
        <h2>Total supply of tokens: {this.state.totalSupply}</h2>


        {this.state.currentAccount === this.contractOwner && <div>
          <h2>Enable account</h2>
          Address to allow: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange} />
          <button type="button" onClick={this.handleKycSubmit}>Add Address to Whitelist</button>


          <h2>Mint coins</h2>
          Amount of tokens: <input type="text" name="amountToMint" value={this.state.amountToMint} onChange={this.handleInputChange} />
          <button type="button" onClick={this.mintCoins}>MINT!</button>
        </div>
        }

        <h2>Buy Dagi Tokens</h2>
        <p>Send Ether to this address: {this.state.tokenSaleAddress}</p>
        <p>OR</p>

        Amount of tokens: <input type="text" name="amountToBuy" value={this.state.amountToBuy} onChange={this.handleInputChange} />
        <button type="button" onClick={this.buyCoins}>BUY!</button>
        <p>Contract address: {this.state.tokenContractAddress}</p>

        <h2>You have {this.state.dagiTokensBalance} DagiCoins</h2>

        <div>Network id: {this.networkId}</div>
      </div >
    );
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }


  handleKycSubmit = async () => {
    const { kycAddress } = this.state;
    try {

      await this.kycContract.methods.setKycCompleted(kycAddress).send({ from: this.accounts[0] });
      alert("Account " + kycAddress + " is now whitelisted");
    } catch (error) {
      alert(error);

    }
  }

  refreshAccounts = async () => {
    this.accounts = await this.web3.eth.getAccounts();
    this.setState({
      currentAccount: this.accounts[0]
    });
    console.log(`New accounts: ${this.accounts}`);
  };

  buyCoins = async () => {
    const amountToBuy = this.state.amountToBuy;

    const buyerAccount = this.accounts[0];
    const tokenSaleAddress = this.state.tokenSaleAddress;

    let estimatedGas = await this.web3.eth.estimateGas({ from: buyerAccount, to: tokenSaleAddress, value: amountToBuy })
    const params = {
      from: buyerAccount,
      to: tokenSaleAddress,
      value: amountToBuy,
      gas: estimatedGas,
    };
    await this.web3.eth.sendTransaction(params, function (err, res) {
      if (err) {
        alert(`Transaction error: ${err}`);
        console.log(`Transaction error: ${err}`);
        return;
      }
      console.log(`Transaction result: ${JSON.stringify(res)}`);
    });
  };

  mintCoins = async () => {
    const tokenSaleAddress = this.state.tokenSaleAddress;
    const amountToMint = this.state.amountToMint;
    console.log(`Current address: ${this.accounts[0]}`)

    await this.myToken.methods.mint(tokenSaleAddress, amountToMint).send({ from: this.accounts[0] })
      .then(response => {
        this.getCoinsSupply();
      })
      .catch(err => {
        alert(err.message);
        console.log(err)
      });
  };

  listenToTokenTransfer = async () => {
    this.myToken.events.Transfer({ to: this.accounts[0] }).on("data", this.getCoinsBalance);
  }

  getCoinsBalance = async () => {
    const address = this.accounts[0]
    if (!address) {
      return;
    }

    let balance = await this.myToken.methods.balanceOf(address).call();
    this.setState({
      dagiTokensBalance: balance
    });
  }

  getCoinsSupply = async () => {
    let totalSupply = await this.myToken.methods.totalSupply().call();
    this.setState({
      totalSupply
    });
  };


};

export default App;
