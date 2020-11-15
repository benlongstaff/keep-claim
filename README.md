#Keep Claim Check
This script checks to see if there are Keeps that an operator was apart of that can receive rewards.

## Install
`npm install`

create .env file with infura credentials.

```
INFURA_API=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

## Run
`node main.js 0xYOUROPERATORADDRESS`

## Etherscan
To notify the Keeps to receive rewards you can do them individually with receiveReward or as a group with receiveRewards
https://etherscan.io/address/0xc5aC5A8892230E0A3e1c473881A2de7353fFcA88#writeContract

Then to withdraw the rewards to your beneficiary address use withdrawRewards on the same contract.
