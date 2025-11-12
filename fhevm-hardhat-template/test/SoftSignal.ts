// Updated by RosemarySheridan on 2025-11-07 // Updated // Updated
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, deployments, fhevm } from "hardhat";
import { SoftSignal, SoftSignal__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

describe("SoftSignal", function () {
  let signers: Signers;
  let softSignal: SoftSignal;
  let softSignalAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    await deployments.fixture(["SoftSignal"]);
    const SoftSignalDeployment = await deployments.get("SoftSignal");
    const factory = (await ethers.getContractFactory("SoftSignal")) as SoftSignal__factory;
    softSignal = factory.attach(SoftSignalDeployment.address) as SoftSignal;
    softSignalAddress = SoftSignalDeployment.address;
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(softSignalAddress).to.be.properAddress;
    });

    it("should return 0 for new user entry count", async function () {
      const count = await softSignal.getUserEntryCount(signers.alice.address);
      expect(count).to.equal(0);
    });

    it("should return 0 for total entry count", async function () {
      const total = await softSignal.getTotalEntryCount();
      expect(total).to.equal(0);
    });
  });

  describe("Entry Management", function () {
    it("should add a new emotion entry", async function () {
      const mood = 700; // Scale: 7.0 * 100
      const stress = 500;
      const sleep = 800;
      const timestamp = Math.floor(Date.now() / 1000);
      const tags = [ethers.encodeBytes32String("Work"), ethers.encodeBytes32String("Health")];

      const input = fhevm.createEncryptedInput(softSignalAddress, signers.alice.address);
      input.add16(mood);
      input.add16(stress);
      input.add16(sleep);
      const encryptedInputs = await input.encrypt();

      const tx = await softSignal
        .connect(signers.alice)
        .addEntry(
          encryptedInputs.handles[0],
          encryptedInputs.handles[1],
          encryptedInputs.handles[2],
          timestamp,
          tags,
          encryptedInputs.inputProof
        );

      await expect(tx).to.emit(softSignal, "EntryAdded");

      const entryCount = await softSignal.getUserEntryCount(signers.alice.address);
      expect(entryCount).to.equal(1);
    });

    it("should retrieve entry metadata", async function () {
      const mood = 600;
      const stress = 400;
      const sleep = 700;
      const timestamp = Math.floor(Date.now() / 1000);
      const tags: string[] = [];

      const input = fhevm.createEncryptedInput(softSignalAddress, signers.alice.address);
      input.add16(mood);
      input.add16(stress);
      input.add16(sleep);
      const encryptedInputs = await input.encrypt();

      await softSignal
        .connect(signers.alice)
        .addEntry(
          encryptedInputs.handles[0],
          encryptedInputs.handles[1],
          encryptedInputs.handles[2],
          timestamp,
          tags,
          encryptedInputs.inputProof
        );

      const entryIds = await softSignal.getUserEntryIds(signers.alice.address, 0, 1);
      expect(entryIds.length).to.equal(1);

      const entry = await softSignal.getEntry(entryIds[0]);
      expect(entry.owner).to.equal(signers.alice.address);
      expect(entry.timestamp).to.equal(timestamp);
    });
  });

  describe("Access Control", function () {
    it("should allow owner to grant decryption access", async function () {
      const input = fhevm.createEncryptedInput(softSignalAddress, signers.alice.address);
      input.add16(700);
      input.add16(500);
      input.add16(800);
      const encryptedInputs = await input.encrypt();

      await softSignal
        .connect(signers.alice)
        .addEntry(
          encryptedInputs.handles[0],
          encryptedInputs.handles[1],
          encryptedInputs.handles[2],
          Math.floor(Date.now() / 1000),
          [],
          encryptedInputs.inputProof
        );

      const entryIds = await softSignal.getUserEntryIds(signers.alice.address, 0, 1);
      const tx = await softSignal.connect(signers.alice).allowAccount(entryIds[0], signers.alice.address);

      await expect(tx).to.emit(softSignal, "EntryAllowed");
    });

    it("should prevent non-owner from granting access", async function () {
      const input = fhevm.createEncryptedInput(softSignalAddress, signers.alice.address);
      input.add16(700);
      input.add16(500);
      input.add16(800);
      const encryptedInputs = await input.encrypt();

      await softSignal
        .connect(signers.alice)
        .addEntry(
          encryptedInputs.handles[0],
          encryptedInputs.handles[1],
          encryptedInputs.handles[2],
          Math.floor(Date.now() / 1000),
          [],
          encryptedInputs.inputProof
        );

      const entryIds = await softSignal.getUserEntryIds(signers.alice.address, 0, 1);

      await expect(
        softSignal.connect(signers.bob).allowAccount(entryIds[0], signers.bob.address)
      ).to.be.revertedWith("Only owner can grant access");
    });
  });
});

