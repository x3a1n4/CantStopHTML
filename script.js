var c = document.getElementsByTagName("canvas")[0];
var ctx = c.getContext("2d");

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Board{
  static offsetX = 10;
  static offsetY = 10;

  constructor(){
    this.squares = [];
    
    for(var i = 2; i <= 12; i++ ){
      var numSquares = -2*Math.abs(7-i) + 13;
      for(var j = 0; j < numSquares; j++){
        this.squares.push(new Square(i, j));
      }
    }
  }
  
  draw(){
    for(var i = 0; i < this.squares.length; i++){
      this.squares[i].draw();
    }
  }

  getSquare(number, index){
    for(var i = 0; i < this.squares.length; i++){
      if(this.squares[i].number == number && this.squares[i].index == index){
        return this.squares[i]
      }
    }
    return null;
  }
    
}

class Square{
  static size = 50;
  static padding = 5;
  static fontSize = 30;
  
  centerX;
  centerY;
  
  constructor(number, index){
    this.number = number;
    this.index = index;
    this.getPosition();
  }
  
  getPosition(){
    [this.x, this.y] = Square.squareToPixel(this.number, this.index);
    
    this.centerX = this.x + Square.size/2;
    this.centerY = this.y + Square.size/2;
  }

  static squareToPixel(number, index){
    var x = (number - 2) * (Square.size + Square.padding) + Board.offsetX;
    var y = (index + Math.abs(7-number)) * (Square.size + Square.padding) + Board.offsetY;

    return [x, y];
  }
  
  draw(){
    ctx.strokeStyle = '#777777';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.rect(this.x, 
             this.y, 
             Square.size, 
             Square.size);
    ctx.stroke();
    
    ctx.textAlign = "center";
    ctx.font = Square.fontSize + "px Arial";
    ctx.fillText(this.number, 
                 this.x + Square.size/2, 
                 this.y + (0.75*Square.size));
  }
}

tokens = [];
class Token{
  static playerColours = ["#FF000077", "#00FF0077", "#0000FF77"];
  static diameter = 40;

  number = undefined;
  index = undefined;

  startindex = this.index;
  startnumber = this.number;
  
  constructor(player){
    this.player = player;
    this.tokenIndex = tokens.length;
    //700 is hardcoded, shouldn't be
    this.x = Token.diameter * this.tokenIndex + 650 + Token.diameter/2;
    this.y = 300;

    this.startx = this.x;
    this.starty = this.y;
    
    tokens.push(this);
  }
  
  //sure let's leave this here
  overlappingPoint(x, y){
    return (Token.diameter/2)^2 > (this.x-x)^2 + (this.y-y)^2;
  }
  
  updatePos(){
    if(this.number > 0){
      var tokenSquare = board.getSquare(this.number, this.index);
      [this.x, this.y] = [tokenSquare.centerX, tokenSquare.centerY];
    }
  }

  draw(){
    this.updatePos();

    ctx.beginPath();
    ctx.arc(this.x, this.y, Token.diameter/2, 0, 2 * Math.PI, false);
    ctx.fillStyle = Token.playerColours[this.player];
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  }
}

class Die{
  static size = 50;
  static fontsize = 30;
  static padding = 5;
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.number = 6;
  }
  
  roll(){
    this.number = getRandomInt(1, 6);
  }
  
  draw(){
    ctx.strokeStyle = '#5577FF';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.rect(this.x, 
             this.y, 
             Die.size, 
             Die.size);
    ctx.stroke();
    
    ctx.fillStyle = '#000000';
    ctx.textAlign = "center";
    ctx.font = Die.fontSize + "px Arial";
    ctx.fillText(this.number, 
                 this.x + Die.size/2, 
                 this.y + (0.75*Die.size));
  }
}

class Button{
  static fontsize = 20;
  static playercolours = ["#FF7777", "#77FF77", "#7777FF"];
  
  fillcolour = "#CCCCCC";
  enabled = true;
  
  constructor(x, y, width, height, text = ""){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
  }
  
  setFill(index){
    if(index < Button.playercolours.length && index >= 0){
      this.fillcolour = Button.playercolours[index];
    }else{
      this.fillcolour = "#CCCCCC";
    }
    
  }
  
  isOverlapping(x, y){
    return(
      x > this.x && 
      x < this.x+this.width && 
      y < this.y+this.height && 
      y > this.y
      );
  }
  
  draw(){
    ctx.strokeStyle = '#777777';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.rect(this.x, 
             this.y, 
             this.width, 
             this.height);
    ctx.stroke();
    
    ctx.fillStyle = this.fillcolour;
    ctx.fill();
    
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.font = Button.fontsize + "px Arial";
    ctx.fillText(this.text, 
                 this.x + this.width/2, 
                 this.y + (0.75*this.height));
  }
}

class DieButton extends Button{
  number1;
  number2;
  
  constructor(x, y, width, height, text = ""){
    super(x, y, width, height, text = "");
  }
  
  setNumbers(n1, n2){
    this.number1 = n1;
    this.number2 = n2;
    this.text = n1 + " and " + n2;
  }
}

//Object.setPrototypeOf(DieButton.prototype, Button);

class DieBoard{
  static buttonwidth = 100;
  static buttonheight = 30;
  static buttonpadding = 5;
  
  rollability = true;
  playerturn = 0;

  canplay = true;
  
  constructor(offsetX, offsetY){
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    
    this.dice = [];
    for(var i = 0; i < 4; i++){
      this.dice.push(new Die(offsetX + i*(Die.size + Die.padding), 
                            offsetY));
    }
    
    this.buttons = [];
    for(var i = 0; i < 3; i++){
      this.buttons.push(new DieButton(
        offsetX + i*(DieBoard.buttonwidth + DieBoard.buttonpadding), 
        offsetY + Die.size + DieBoard.buttonpadding,
        DieBoard.buttonwidth,
        DieBoard.buttonheight));
    }
    
    this.rollbutton = new Button(
      offsetX,
      offsetY + Die.size + 2*DieBoard.buttonpadding + DieBoard.buttonheight,
      DieBoard.buttonwidth,
      DieBoard.buttonheight,
      "Roll Dice"
    );
    
    this.endturnbutton = new Button(
      offsetX,
      offsetY + Die.size + 3*DieBoard.buttonpadding + 2*DieBoard.buttonheight,
      DieBoard.buttonwidth,
      DieBoard.buttonheight,
      "End Turn"
    );
    
    this.buttons.push(this.rollbutton);
    this.buttons.push(this.endturnbutton);
    
    this.rollbutton.setFill(this.playerturn);
    this.endturnbutton.setFill(this.playerturn);
  }
  
  onClick(e){
    for(var i = 0; i<this.buttons.length; i++){
      if(this.buttons[i].isOverlapping(e.clientX, e.clientY)){
        var clickedButton = this.buttons[i];
        if(clickedButton.enabled){
          if(clickedButton == this.rollbutton){
            this.roll()
            this.rollability = false;
          }
          else if(clickedButton == this.endturnbutton){
            //doesn't work
            console.log(this.canplay);
            if(this.canplay){
              this.getplayertokens().forEach(e => {
                e.startnumber = e.number;
                e.startindex = e.index;
              })
            }else{
              this.getplayertokens().forEach(e => {
                e.number = e.startnumber;
                e.index = e.startindex;

                if(e.index == undefined){
                  e.x = e.startx;
                  e.y = e.starty;
                }
              })
            }

            this.rollability = true;
            this.rollbutton.enabled = true;
            this.playerturn++;

          }
          else{
            this.movetokens(clickedButton.number1, clickedButton.number2);
            this.rollability = true;

            this.buttons.forEach(e => {
              if(e instanceof DieButton){
                e.enabled = false;
              }else{
                e.enabled = true;
              }
            });
          }
        }
      }
    }
  }

  getplayertokens(){
    var startpoint = this.playerturn * 3;
    var endpoint = (this.playerturn+1) * 3;

    var playerTokens = tokens.slice(startpoint,endpoint);

    //console.log(playerTokens);
    return playerTokens;
  }

  canmovetokens(n1, n2){
    var startpoint = this.playerturn * 3;
    var endpoint = (this.playerturn+1) * 3;

    var playable = false;

    var playerTokens = tokens.slice(startpoint,endpoint);
    playerTokens.forEach(e => {
      playable += [undefined, n1, n2].includes(e.number);
    });

    
    return playable;
  }

  movetokens(n1, n2) {
    var numbers = [n1, n2];

    var startpoint = this.playerturn * 3
    var endpoint = (this.playerturn+1) * 3

    //move up tokens that can
    for(var i = startpoint; i < endpoint; i++){
      var moveamount = [n1, n2].filter(number => number == tokens[i].number).length;
      if(moveamount){
        //should remove this element from list, so that when you move a token forward one not on the board doesn't go in the same row
        //don't actually do this, it will be fixed by deciding where the token can go
        tokens[i].index += moveamount;
      }
    }

    //move up unplayed tokens
    //you need to be able to pick where to move token if only one is left
    for(var i = startpoint; i < endpoint; i++){
      if(!(tokens[i].number > 0)){
        tokens[i].number = numbers.pop(0);
        tokens[i].index = 0;
      }
    }
  }
  
  roll(){
    for(var j = 0; j<this.dice.length; j++){
      this.dice[j].roll();
    }
    
    this.buttons[0].setNumbers(this.dice[0].number + this.dice[1].number, this.dice[2].number + this.dice[3].number);
    
    this.buttons[1].setNumbers(this.dice[0].number + this.dice[2].number, this.dice[1].number + this.dice[3].number);

    this.buttons[2].setNumbers(this.dice[0].number + this.dice[3].number, this.dice[1].number + this.dice[2].number);
    
    this.endturnbutton.enabled = false;
    this.rollbutton.enabled = false;
  }
  
  updateButtons(){
    var diceButtons = [this.buttons[0], this.buttons[1], this.buttons[2]];

    this.canplay = false;

    diceButtons.forEach(e => {
      if(this.canmovetokens(e.number1, e.number2) && !this.rollability){
        this.canplay = true;
        e.enabled = true;
      }else{
        e.enabled = false;
      }
    });
    
    if(!this.canplay){
      this.endturnbutton.enabled = true;
    }


    this.buttons.forEach(e => e.setFill(e.enabled ? this.playerturn : -1));
  }
    
  update(){
    if(this.playerturn >= 3){
      this.playerturn = 0;
    }
  }
  
  draw(){
    this.update();
    
    for(var i = 0; i < this.dice.length; i++){
      this.dice[i].draw();
    }
    
    this.updateButtons();
    for(var i = 0; i < this.buttons.length; i++){
      this.buttons[i].draw();
    }
  }
  
}


//create board
var board = new Board();

//create tokens
const playerNumber = 3;
const tokenNumber = 3;
for(var i = 0; i < playerNumber; i++){
  for(var j = 0; j < tokenNumber; j++){
    new Token(i);
  }
}

//create dieboard
var dieboard = new DieBoard(650, 100);

function onClick(event){
  dieboard.onClick(event);
}

document.addEventListener("click", onClick);

//draw board
function draw(){
  ctx.clearRect(0, 0, c.width, c.height);
  
  board.draw()
  
  for(var i=0; i<tokens.length; i++){
    tokens[i].draw();
  }
  
  dieboard.draw();
}

interval = window.setInterval(draw, 50);