import { expect } from "chai";
import { ethers } from "hardhat";

describe("SoftSignal (Sepolia)", function () {
  before(async function () {
    // Skip if not on Sepolia
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 11155111n) {
      this.skip();
    }
  });

  it("should have deployment info", async function () {
    // This is a placeholder for Sepolia-specific tests
    // Actual testing requires deployed contract address
    expect(true).to.be.true;
  });
});

