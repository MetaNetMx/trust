// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ValidaToken is ERC20, Ownable {
    address public validaCore;

    constructor() ERC20("Valida Token", "HOST") Ownable(msg.sender) {}

    function setValidaCore(address _validaCore) external onlyOwner {
        validaCore = _validaCore;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == validaCore, "Only ValidaCore can mint");
        _mint(to, amount);
    }
}
