// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonadWorkflowExecutor is Ownable {
    constructor() Ownable(msg.sender) {}

    // Batch transfer native MON
    function batchTransferMON(address payable[] calldata recipients, uint256[] calldata amounts) external payable {
        require(recipients.length == amounts.length, "Recipients and amounts length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "Transfer failed");
        }
    }

    // Batch transfer ERC-20 tokens
    function batchTransferToken(IERC20 token, address[] calldata recipients, uint256[] calldata amounts) external {
        require(recipients.length == amounts.length, "Recipients and amounts length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            require(token.transferFrom(msg.sender, recipients[i], amounts[i]), "ERC20 transferFrom failed");
        }
    }
}
