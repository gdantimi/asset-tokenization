// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";

contract KycContract is Ownable {
    mapping(address => bool) allowed;

    function setKycCompleted(address addr) public onlyOwner {
        allowed[addr] = true;
    }

    function setKycRevoked(address addr) public onlyOwner {
        allowed[addr] = false;
    }

    function isKycCompleted(address addr) public view returns (bool) {
        return allowed[addr];
    }
}
