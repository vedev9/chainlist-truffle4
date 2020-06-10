pragma solidity ^0.4.18;

import "./Ownable.sol";

//essendo ownable, il costruttore di Ownable verrà chiamato
contract ChainList is Ownable {

  // custom types
  struct Article {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }

  // state variables
  mapping (uint => Article) public articles; //essendo public il compiler creerà la funzione getter
  uint articleCounter;


  // events
  //indexed = sarà possibile filtrare su questo valore client-side
  event LogSellArticle(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price
  );

  event LogBuyArticle(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
  );


  //deactivate contract
  function kill() public onlyOwner {
    selfdestruct(owner); //refund the owner
  }

  // sell an article
  function sellArticle(string _name, string _description, uint256 _price) public {
    articleCounter++;

    articles[articleCounter] = Article(
      articleCounter,
      msg.sender,
      0x0,
      _name,
      _description,
      _price
    );

    LogSellArticle(articleCounter, msg.sender, _name, _price);
  }

  // fetch number of articles
  function getNumberOfArticles() public view returns (uint) {
    return articleCounter;
  }

  // fetch and return all article IDs for articles still for sale
  // essendo view non mi costa gas
  function getArticlesForSale() public view returns (uint[]) {
    // prepare output array
    uint[] memory articleIds = new uint[](articleCounter); //max dimension: articleCounter

    uint numberOfArticlesForSale = 0;
    for(uint i = 1; i <= articleCounter; i++){
      if(articles[i].buyer == 0x0) {
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }

    // copy the articleIds array into a smaller forSale array
    uint[] memory forSale = new uint[](numberOfArticlesForSale);
    for(uint j = 0; j < numberOfArticlesForSale; j++){
      forSale[j] = articleIds[j];
    }

    return forSale;
  }

  // buy article
  function buyArticle(uint _id) payable public {
    // check wheter there is an article for sale
    require(articleCounter > 0);
    // check that the article exists
    require(_id > 0 && _id <= articleCounter);
    //get article from the mapping
    Article storage article = articles[_id];
    //check article has not been sold yet
    require(article.buyer == 0x0);
    // block the seller to buy the article
    require(msg.sender != article.seller);
    //value sent must be equals the price
    require(msg.value == article.price);

    //save buyer info
    article.buyer = msg.sender;
    //the buyer pay the seller
    article.seller.transfer(msg.value);

    LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
  }
}
