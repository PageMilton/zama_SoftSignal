import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:addEntry")
  .addParam("mood", "Mood score (0-10)")
  .addParam("stress", "Stress level (0-10)")
  .addParam("sleep", "Sleep quality (0-10)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const SoftSignal = await deployments.get("SoftSignal");
    const signers = await ethers.getSigners();

    const softSignalFactory = await ethers.getContractFactory("SoftSignal");
    const softSignal = softSignalFactory.attach(SoftSignal.address) as any;

    const mood = parseInt(taskArguments.mood);
    const stress = parseInt(taskArguments.stress);
    const sleep = parseInt(taskArguments.sleep);

    console.log(`Adding entry: mood=${mood}, stress=${stress}, sleep=${sleep}`);

    // For localhost/mock mode, we'll need to encrypt these values
    // This is a simplified example - actual implementation depends on network
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Note: In real usage, these should be encrypted using FHEVM instance
    // For testing on localhost, use mock encryption
    
    console.log("Note: This task requires proper FHEVM encryption setup");
    console.log("Please use the frontend or test suite for encrypted entries");
  });

task("task:getEntryCount")
  .addOptionalParam("address", "User address (defaults to deployer)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const SoftSignal = await deployments.get("SoftSignal");
    const signers = await ethers.getSigners();

    const softSignalFactory = await ethers.getContractFactory("SoftSignal");
    const softSignal = softSignalFactory.attach(SoftSignal.address) as any;

    const userAddress = taskArguments.address || signers[0].address;
    const count = await softSignal.getUserEntryCount(userAddress);

    console.log(`User ${userAddress} has ${count} entries`);
  });

task("task:getTotalEntries").setAction(async function (taskArguments: TaskArguments, hre) {
  const { ethers, deployments } = hre;
  const SoftSignal = await deployments.get("SoftSignal");

  const softSignalFactory = await ethers.getContractFactory("SoftSignal");
  const softSignal = softSignalFactory.attach(SoftSignal.address) as any;

  const total = await softSignal.getTotalEntryCount();
  console.log(`Total entries in system: ${total}`);
});
