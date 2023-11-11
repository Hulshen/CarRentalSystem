import { ethers } from "hardhat";

async function main() {
  const CarRentalSystem = await ethers.getContractFactory("CarRentalSystem");
  const carRentalSystem = await CarRentalSystem.deploy();
  await carRentalSystem.deployed();

  console.log(`CarRentalSystem deployed to ${carRentalSystem.address}`);
  const erc20 = await carRentalSystem.myERC20();
  console.log(`erc20 contract has been deployed successfully in ${erc20}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});