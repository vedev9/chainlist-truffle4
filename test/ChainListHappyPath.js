var ChainList = artifacts.require("./ChainList.sol")

//test suite

//ChainList è il nome del contract che voglio testare
contract('ChainList', function(accounts){

  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName1 = "Article 1";
  var articleDesc1 = "Description for article 1";
  var articlePrice1 = 10;
  var articleName2 = "Article 2";
  var articleDesc2 = "Description for article 2";
  var articlePrice2 = 20;

  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("should be initialized with empty values", function() {
      return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        return chainListInstance.getNumberOfArticles();
      })
      .then(data => {
        assert.equal(data.toNumber(), 0, "Number of articles must be zero");
        return chainListInstance.getArticlesForSale();
      })
      .then(data => {
        assert.equal(data.length, 0, "There shouldn't be any article for sale");
      })
  });

  it("should sell a first article", function(){
    return ChainList.deployed()
    .then(instance => {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName1, articleDesc1, web3.toWei(articlePrice1,"ether"), {from: seller});
    })
    .then( receipt => {
      //check events
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "event id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be "+seller);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be "+articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event price must be "+web3.toWei(articlePrice1,"ether"));

      return chainListInstance.getNumberOfArticles();
    })
    .then(data => {
      assert.equal(data.toNumber(), 1, "There should be one article");
      return chainListInstance.getArticlesForSale();
    })
    .then(data => {
      assert.equal(data.length, 1, "There should be one article");
      assert.equal(data[0].toNumber(), 1, "Article ID must be 1");
      return chainListInstance.articles(data[0]);
    })
    .then(data => {
      assert.equal(data[0].toNumber(), 1, "Article ID must be 1");
      assert.equal(data[1], seller, "Seller must be "+seller);
      assert.equal(data[2], 0x0, "Buyer must be empty");
      assert.equal(data[3], articleName1, "Article name must be ", articleName1);
      assert.equal(data[4], articleDesc1, "Article description must be "+articleDesc1);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice1,"ether"), "Article price must be "+web3.toWei(articlePrice1,"ether"));
    });
  });

  it("should sell a second article", function(){
    return ChainList.deployed()
    .then(instance => {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName2, articleDesc2, web3.toWei(articlePrice2,"ether"), {from: seller});
    })
    .then( receipt => {
      //check events
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "event id must be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be "+seller);
      assert.equal(receipt.logs[0].args._name, articleName2, "event article name must be "+articleName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "event price must be "+web3.toWei(articlePrice2,"ether"));

      return chainListInstance.getNumberOfArticles();
    })
    .then(data => {
      assert.equal(data.toNumber(), 2, "There should be two articles");
      return chainListInstance.getArticlesForSale();
    })
    .then(data => {
      assert.equal(data.length, 2, "There should be 2 articles");
      assert.equal(data[1].toNumber(), 2, "Article ID must be 2");
      return chainListInstance.articles(data[1]);
    })
    .then(data => {
      assert.equal(data[0].toNumber(), 2, "Article ID must be 2");
      assert.equal(data[1], seller, "Seller must be "+seller);
      assert.equal(data[2], 0x0, "Buyer must be empty");
      assert.equal(data[3], articleName2, "Article name must be ", articleName2);
      assert.equal(data[4], articleDesc2, "Article description must be "+articleDesc2);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice2,"ether"), "Article price must be "+web3.toWei(articlePrice2,"ether"));
    });
  });

  it("should buy the first article", function(){
    return ChainList.deployed()
    .then(instance => {
      chainListInstance = instance;
      //record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller),"ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer),"ether").toNumber();
      return chainListInstance.buyArticle(1,{
        from: buyer,
        value: web3.toWei(articlePrice1, "ether")
      });
    })
    .then(receipt => {
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "event id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be "+seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be "+buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be "+articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event price must be "+web3.toWei(articlePrice1,"ether"));

      //record balances of seller and buyer after the buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller),"ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer),"ether").toNumber();

      //check effects of buy on balances, accounting for gas
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned "+articlePrice1+" ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have payed "+articlePrice1+" ETH");

      return chainListInstance.getArticlesForSale();
    })
    .then(data => {
      assert.equal(data.length, 1, "There should be now only one article left");
      assert.equal(data[0].toNumber(), 2, "Article 2 should be the only article left for sale");

      return chainListInstance.getNumberOfArticles();
    })
    .then(data => {
      assert.equal(data.toNumber(), 2, "There should still be 2 articles");
    })
  })
});
