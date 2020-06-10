module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          ganache: {
               host: "localhost",
               port: 7545,
               network_id: "*" // Match any network id
          },
          chainskills: {
               host: "localhost",
               port: 8545,
               network_id: "4224",
               gas: 4700000, //gas limit per bug in truffle con private networks
               //from: '0xbfec0def2e2cb35b5b78d3ed1df92fa4b2c14657' //account per il deploy. se lo ometto verrà usato il coinbase account che è già unlockato di default grazie alle pass fornite in startnode.cmd
          },
          rinkeby: {
               host: "localhost",
               port: 8545,
               network_id: 4, //official rinkeby testnet
               gas: 4700000, //gas limit per bug in truffle con private networks
          }
     }
};
