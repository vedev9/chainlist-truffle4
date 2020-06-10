var ChainList = artifacts.require("./ChainList.sol")

contract('ChainList', function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "Article 1";
  var articleDesc = "Description for article 1";
  var articlePrice = 10;

  // no article for sale yet
  it("should throw an exepction if you try to buy article when there is no one", () => {
    return ChainList.deployed()
    .then(instance => {
      chainListInstance = instance;
      return chainListInstance.buyArticle(1,{
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    })
    .then(assert.fail)
    .catch(err => {
      assert(true);
    })
    .then(() => {
      return chainListInstance.getNumberOfArticles();
    })
    .then(data => {
      assert.equal(data.toNumber(), 0, "Number of articles must be zero");
    })
  });

  // buy article does not exist
  it("should throw an exepction if you try to buy article that does not exist", () => {
    return ChainList.deployed()
    .then(instance => {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDesc, web3.toWei(articlePrice,"ether"), {from: seller});
    })
    .then( (receipt) => {
      return chainListInstance.buyArticle(2,{
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    })
    .then(assert.fail)
    .catch(err => {
      assert(true);
    })
    .then(() => {
      return chainListInstance.articles(1);
    })
    .then(data => {
      assert.equal(data[0].toNumber(), 1, "Article ID must be 1");
      assert.equal(data[1], seller, "Seller must be "+seller);
      assert.equal(data[2], 0x0, "Buyer must be empty");
      assert.equal(data[3], articleName, "Article name must be ", articleName);
      assert.equal(data[4], articleDesc, "Article description must be "+articleDesc);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice,"ether"), "Article price must be "+web3.toWei(articlePrice,"ether"));
    })
  });

  //buying article you are selling
  it("should throw an exepction if you try to buy article you're selling", () => {
    return ChainList.deployed()
    .then(instance => {
      chainListInstance = instance;
      return chainListInstance.buyArticle(1,{
        from: seller,
        value: web3.toWei(articlePrice, "ether")
      });
    })
    .then(assert.fail)
    .catch(err => {
      assert(true);
    })
    .then(() => {
      return chainListInstance.articles(1);
    })
    .then(data => {
      assert.equal(data[0].toNumber(), 1, "Article ID must be 1");
      assert.equal(data[1], seller, "Seller must be "+seller);
      assert.equal(data[2], 0x0, "Buyer must be empty");
      assert.equal(data[3], articleName, "Article name must be ", articleName);
      assert.equal(data[4], articleDesc, "Article description must be "+articleDesc);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice,"ether"), "Article price must be "+web3.toWei(articlePrice,"ether"));
    })
  })

  //buying article wrong value
  it("should throw an exepction if you try to buy article with value different from prize", () => {
    return ChainList.deployed()
    .then(instance => {
      chainListInstance = instance;
      return chainListInstance.buyArticle(1,{
        from: buyer,
        value: web3.toWei(articlePrice+1, "ether")
      });
    })
    .then(assert.fail)
    .catch(err => {
      assert(true);
    })
    .then(() => {
      return chainListInstance.articles(1);
    })
    .then(data => {
      assert.equal(data[0].toNumber(), 1, "Article ID must be 1");
      assert.equal(data[1], seller, "Seller must be "+seller);
      assert.equal(data[2], 0x0, "Buyer must be empty");
      assert.equal(data[3], articleName, "Article name must be ", articleName);
      assert.equal(data[4], articleDesc, "Article description must be "+articleDesc);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice,"ether"), "Article price must be "+web3.toWei(articlePrice,"ether"));
    })
  })

  //buying article already sold
  it("should throw an exepction if you try to buy article already sold", () => {
    return ChainList.deployed()
    .then(instance => {
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    })
    .then(() => {
      return chainListInstance.buyArticle(1,{
        from: web3.eth.accounts[0],
        value: web3.toWei(articlePrice, "ether")
      });
    })
    .then(assert.fail)
    .catch(err => {
      assert(true);
    })
    .then(() => {
      return chainListInstance.articles(1);
    })
    .then(data => {
      assert.equal(data[0].toNumber(), 1, "Article ID must be 1");
      assert.equal(data[1], seller, "Seller must be "+seller);
      assert.equal(data[2], buyer, "Buyer must be "+buyer);
      assert.equal(data[3], articleName, "Article name must be ", articleName);
      assert.equal(data[4], articleDesc, "Article description must be "+articleDesc);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice,"ether"), "Article price must be "+web3.toWei(articlePrice,"ether"));
    })
  })
});
