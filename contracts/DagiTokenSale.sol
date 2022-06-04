// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./Crowdsale.sol";
import "./KycContract.sol";

contract DagiTokenSale is Crowdsale {
    KycContract kyc;

    constructor(
        uint256 rate_, // rate in TKNbits
        address payable wallet_,
        IERC20 token_,
        KycContract _kyc
    ) Crowdsale(rate_, wallet_, token_) {
        kyc = _kyc;
    }

    function _preValidatePurchase(address beneficiary, uint256 weiAmount)
        internal
        view
        override
    {
        super._preValidatePurchase(beneficiary, weiAmount);
        require(
            kyc.isKycCompleted(beneficiary),
            "KYC not completed yet, aborting"
        );
    }
}
