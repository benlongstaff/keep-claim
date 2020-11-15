const ethers = require("ethers");

const BondedECDSAKeepFactory = require("@keep-network/keep-ecdsa/artifacts/BondedECDSAKeepFactory.json");
const BondedECDSAKeep = require("@keep-network/keep-ecdsa/artifacts/BondedECDSAKeep.json");
const ECDSARewards = require("@keep-network/keep-ecdsa/artifacts/ECDSARewards.json");

const infura = process.env.INFURA_API;
const network = "homestead";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

if (process.argv.length < 3 || !process.argv[2]) {
  console.error("node main.js [operator]");
  process.exit(1);
}

async function main() {
  const ip = new ethers.providers.InfuraProvider(network, infura);
  const operatorAddress = process.argv[2].toLowerCase();
  const ecdsaKFContract = new ethers.Contract(
    BondedECDSAKeepFactory.networks["1"].address,
    BondedECDSAKeepFactory.abi,
    ip
  );
  const ecdsaRewards = new ethers.Contract(
    ECDSARewards.networks["1"].address,
    ECDSARewards.abi,
    ip
  );
  const keeps = await ecdsaKFContract.queryFilter(
    ecdsaKFContract.filters.BondedECDSAKeepCreated()
  );
  let claimableKeeps = [];
  let counter = 0;

  for (var i = 0; i < keeps.length; i++) {
    for (var j = 0; j < keeps[i].args[1].length; j++) {
      if (keeps[i].args[1][j].toLowerCase() !== operatorAddress) {
        // just look for our operator address
        continue;
      }
      counter += 1;
      let keepAddress = keeps[i].args[0].toLowerCase();
      let paddedAddress = `${keepAddress}000000000000000000000000`; // padding 24 zeros on the end to make it work with the contracts bytes32 interface
      const rewardClaimed = await ecdsaRewards.rewardClaimed(paddedAddress);
      const keepContract = new ethers.Contract(
        keepAddress,
        BondedECDSAKeep.abi,
        ip
      );

      console.log(`[${counter}]\tkeep address:\t ${keepAddress} `);
      if (rewardClaimed === false) {
        await sleep(300); // lazy way to avoid rate limiting in free infura account
        var isClosed = await keepContract.isClosed();
        await sleep(300); // lazy way to avoid rate limiting in free infura account
        var isTerminated = await keepContract.isTerminated();
        console.log(`\tterminated:\t\t ${isTerminated}`);
        console.log(`\tclosed:\t\t\t ${isClosed}`);
        console.log(
          `\tclaimable:\t\t ${isClosed === true && isTerminated === false}`
        );
        console.log(`\tclaimed:\t\t ${rewardClaimed}`);
        if (isClosed === true && isTerminated === false) {
          claimableKeeps.push(keepAddress);
        }
      } else {
        await sleep(300); // lazy way to avoid rate limiting in free infura account
      }
    }
  }
  console.log(`--------------------------`);
  console.log(`Claimable Keeps`);
  console.log(
    `https://etherscan.io/address/0xc5aC5A8892230E0A3e1c473881A2de7353fFcA88#writeContract`
  );
  console.log(`--------------------------`);
  console.log(claimableKeeps.join());
}

main().catch(err => {
  console.error(err);
});
