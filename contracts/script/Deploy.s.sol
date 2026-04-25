// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/ValidaToken.sol";
import "../src/ValidaCore.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        ValidaToken token = new ValidaToken();
        ValidaCore core = new ValidaCore(address(token));
        token.setValidaCore(address(core));

        console.log("ValidaToken deployed at:", address(token));
        console.log("ValidaCore deployed at:", address(core));

        vm.stopBroadcast();
    }
}
