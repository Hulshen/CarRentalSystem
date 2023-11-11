import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x71194875fd5b87396d57f0c64ad8da9c9961928f89205693cf6bb9fe4e7b170c',
        '0x385ae6776dd2c9d3825e30d6381a3b0ef8f0dd28ca095a04fa74cfb33901ab0e',
        '0x4dfa7c2b22a851cfa4a304b3c275cdc3fe2e97b7a97191ac10d5abe1cfdca5c8',
        '0x158ac60ba6bd74f776796fcf175a597abbf95f5b30c1222d1f36ba9a1f68d7fc',
        '0x3015247fd67a71a22e54d267ff5bbea16fec7b8b26baaa40159ce9d3dfbae071',
      ]
    },
  },
};

export default config;
