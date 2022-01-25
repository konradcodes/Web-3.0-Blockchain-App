// https://eth-ropsten.alchemyapi.io/v2/MjtSkALn6x6AeRIntbRSUjekjJ_B21Sv

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/MjtSkALn6x6AeRIntbRSUjekjJ_B21Sv',
      accounts: [
        '9e67170c79a76516908dd78963ac32c61192f8e573f83160c8fc3b561de01064',
      ],
    },
  },
};
