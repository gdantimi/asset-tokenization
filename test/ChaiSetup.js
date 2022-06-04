"use strict";

const chai = require("chai");
chai.use(require("chai-bn")(web3.utils.BN))
chai.use(require("chai-as-promised"));

module.exports = chai;