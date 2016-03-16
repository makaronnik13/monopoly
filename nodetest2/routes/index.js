var express = require('express');
var path = require('path');
var router = express.Router();
module.exports = router;

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../public','game.html'));
});

router.get('/rollDice', function(req, res) {
    var rand = Math.floor(Math.random()*6)+1;
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(""+rand);
    res.end();
    //res.sendFile(path.join('/images', req.get('img_name')));
});

router.get('/position', function(req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    games[req.param("game")].players[req.param("player")-1].position+=parseInt(req.param("dices"));
    if (games[req.param("game")].players[req.param("player")-1].position>=40){
        games[req.param("game")].players[req.param("player")-1].position-=39;
        games[req.param("game")].players[req.param("player")-1].money+=200;
    }
    res.write(""+games[req.param("game")].players[req.param("player")-1].position);
    res.end();
});

router.post('/addPlayer', function(req, res) {
    games[req.param("game")].addPlayer(req.param("playerId"));
});

router.get('/getCard', function(req, res) {
    var card = games[req.param("game")].getCard(req.param("player"), req.param("pile"));
    res.json(card);
});



function createGame(){
    var newGame = new Game();
    games.push(newGame);
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a;
}

function newPile(pileType) {
    var pile = [];
    if (pileType) {
        for (var i = 0; i < 20; i++) {
            pile.push(new Card(i));
        }
    }
    else {
        for (var i = 20; i < 40; i++) {
            pile.push(new Card(i));
        }
    }
    return shuffle(pile);
}

var Game = function() {
    this.id = gameCounter++;
    this.piles = [];
    this.piles[0] = newPile(true);
    this.piles[1] = newPile(false);
    this.cells = [];
    for (var i= 0; i<40;i++){
        this.cells.push(new Cell(i));
    }
    this.players = [];
};

Game.prototype.addPlayer = function(name) {
    this.players.push(new Player(name));
};

Game.prototype.getCard = function(player, _pile) {
    var ret = this.piles[_pile][0];
    this.piles[_pile].shift();
    console.log(this.piles[_pile]);
    if (this.piles[_pile].length == 0){
        var typeP = _pile == 0;
        this.piles[_pile] = newPile(typeP);
    }
    return ret;
};

var Player = function(name){
    this.name = name;
    this.money = 1500;
    this.position = 0;
    this.keys = 0;
};

var Card = function(id) {
    this.id = id;
    this.img = path.join('/images/cards', 'c'+(id+1)+'.png');
};

Card.prototype.effect = function(id) {
};

var Cell = function(id){
    this.id = id;
    this.housesNum = 0;
    this.owner = null;
    this.price = 0;
    this.housePrice = 0;
    this.condition = true;
};

Cell.prototype.fee = function() {
};

Cell.prototype.effect = function() {
};

Cell.prototype.setPrice = function() {
};

Cell.prototype.buyHouse = function() {
    if(this.owner!=null)
        if(this.owner.money >= this.housePrice && this.housesNum<5){
            this.owner.money-=this.housePrice;
            this.housesNum++;
        }
};

Cell.prototype.sellCell = function(newOwner) {
    if(this.owner==null && this.condition && this.housesNum==0){
        this.condition = false;
        newOwner.money+=this.price;
    }
};

Cell.prototype.buyCell = function(newOwner) {
    if (this.owner == null){
        if (newOwner.money >= this.price)
        {
            newOwner.money -= this.price;
            this.owner = newOwner;
        }
    }
    else {
        if (this.owner == newOwner && this.condition == false) {
            if (newOwner.money >= Math.floor(this.price*1.1)) {
                newOwner.money -= Math.floor(this.price*1.1);
                this.condition = true;
            }
        }
    }
};

Cell.prototype.giveCell = function(newOwner, price) {
    if (newOwner.money >=price && this.housesNum==0) {
        newOwner.money -= price;
        this.owner += price;
        this.owner = newOwner;
    }
};

Cell.prototype.sellHouse = function() {
    if(this.owner!=null)
        if(this.housesNum>0){
            this.owner.money+=this.housePrice/2;
            this.housesNum--;
        }
};


////////////
//on start//
////////////

var games = [];
var gameCounter = 0;
createGame();
