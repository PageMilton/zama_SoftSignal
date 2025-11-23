import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploySoftSignal: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = await deploy("SoftSignal", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log(`SoftSignal contract deployed at: ${deployed.address}`);
};

export default deploySoftSignal;
deploySoftSignal.tags = ["SoftSignal"];
