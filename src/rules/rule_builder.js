ruleChessboard = {}; 
var RuleBuilder = cc.Layer.extend({
    logicChessboard: null,
    mapNode: null,
    tileSize: 32,
    tileCount: 8,
    mapSize: 0,
    selectedChess: null,
    turn: 0,
    chessboardNode: null,
    ctor: function () {
       //////////////////////////////
       // 1. super init first
       this._super();
       // this.logicChessboard = new LogicChessboard(); 
       this.mapSize = this.tileSize * this.tileCount;
       // cc.log("this.mapSize", this.mapSize);
       this.mapNode = new cc.Sprite("res/niceTileMap.png");;
       this.mapNode.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
       // cc.log(this.mapNode); 
       this.mapNode.setAnchorPoint(0.5, 0.5);
       this.addChild(this.mapNode);
 
       this.chessboardNode = new cc.Node();
       this.chessboardNode.setContentSize(256 ,256);
       // cc.log("this.chessboardNode.getContentSize() 1", this.chessboardNode.height);
 
       this.chessboardNode.setAnchorPoint(0, 0);
       this.addChild(this.chessboardNode);
       this.chessboardNode.setPosition(cc.winSize.width / 2 - this.mapSize/2, 
          cc.winSize.height / 2-this.mapSize/2);
       // this.chessboardNode.setPosition(0,0)
       this.scaleAllBy(2);
 
       this.initChessboard();
       this.initCodeForChessMoving();
 
       return true;
    },
   
    initChessboard: function () {
       
 
    },
    scaleAllBy(scale) {
       this.setScale(scale); 
       
    },
    
    getTagFromXY: function (x, y) {
       return x * 13 + y;
    },
    addChess: function (sprite, position, type, player) {
       //if the logic chess board is yet to be ialized, initialize it
       if (this.logicChessboard == null) {
          this.logicChessboard = {};
          for (var i = 1; i <= 8; ++i) {
             this.logicChessboard[i] = {};
             for (var j = 1; j <= 8; ++j) {
                this.logicChessboard[i][j] = PLAYER.EMPTY;
             }
          }
       }
       this.logicChessboard[position.x][position.y] = {};
       this.logicChessboard[position.x][position.y][type] = player;
 
       if (player == PLAYER.BLACK)
             playerString = "black";
         if (player == PLAYER.WHITE)
             playerString = "white";
       var img = "res/green.png";
       // cc.log(img);  
       // this.loadTextures(img,img,img); 
       var newChess = new MyChess(type,player,this.logicChessboard);
       // var newChess = new ccui.Button(img,img,img,"");
       // var newChess = new cc.Sprite(sprite); 
       // newChess.setContentSize(50,50); 
       // cc.log(newChess); 
       newChess.chessType = type;
       newChess.stateTag = CHESS_STATE.NOT_SELECTED;
       newChess.setScale(this.tileSize / newChess.getContentSize().width);
       // this.chessScale = this.tileSize / newChess.getContentSize().width;
       //  this.chessWidth = this.chessScale * newChess.width;
       // this.chessHeight = this.chessScale * newChess.height;
       // newChess.setScale(this.chessScale);
       newChess.setAnchorPoint(1, 1);
       var chessPos = this.calculatePosition(position.x, position.y);
       // cc.log(chessPos.x,chessPos.y,"chessPos")
       newChess.setPosition(chessPos);
       this.mapNode.addChild(newChess, 2, this.getTagFromXY(position.x, position.y));
 
       // this.logicChessboard.addChess(type,position); 
 
       var greenBox = new cc.Sprite(res.green, cc.rect(0, 0, this.tileSize, this.tileSize));
       // greenBox.setTextureRect(cc.rect(0,0,32,32)); 
       // greenBox.setColor(new cc.Color(255,255,255)); 
 
       greenBox.setOpacity(180);
       greenBox.setAnchorPoint(1, 1);
       greenBox.setPosition(chessPos);
       newChess.greenBox = greenBox;
       greenBox.setVisible(false);
       this.mapNode.addChild(greenBox, 1);
    },
    calculatePosition: function (x, y) {
       topLeftX = 0;
       topLeftY =0;
       //TODO: since row first, column follows, resX and resY must be interchanged.
       var resX = y*this.tileSize;
       var resY = x*this.tileSize
       // cc.log("topLeftY", topLeftY);
       // cc.log("resX", resX);
       // cc.log("resY", resY);
       // cc.log("cc.winSize.width/2", cc.winSize.width / 2);
       return cc.p(resX, resY);
    },
    calculateScreenPosition: function (x, y) {
       // cc.log("calculateScreenPosition", x, y);
       //reduce x and y, so that it would fit better
       // var topLeftX = this.mapSize/2;
       // //+ this.tileSize / 2;
       // var topLeftY = this.mapSize/2;
       // //- this.tileSize / 2;
       // var resX = x - topLeftX;
       // var resY = y - topLeftY;
       // resX = y + topLeftY;
       // resX = Math.floor(resX / this.tileSize) + 1;
       // resY = x - topLeftX;
       // resY = Math.floor(resY / this.tileSize) + 1;
       // this.tileSize = 32;
       // -this.mapSize/2 
       resX = Math.floor((+ y) / 32) + 1;
       resY = Math.floor(( x) / 32) + 1;
       // cc.log("screen position",resX, resY);
       return cc.p(resX, resY);
    },
    getChessAtChessboardPosition: function (x, y) {
       var chess = this.mapNode.getChildByTag(this.getTagFromXY(x, y));
       if (chess)
          return chess;
       cc.log("getChessAtChessboardPosition return null", x, y)
       return null;
    },
    removeChess: function (chess) {
       chess.greenBox.removeFromParent(true);
       chess.removeFromParent(true);

       if (chess.chessType == CHESS_TYPE.KING){
          
       }
    },
    isValidMove: function (chess, x, y, newX, newY, logicChessboard, turn) {
       // var chess = this.getChessAtChessboardPosition(x,y); 
       //if the player pick his chess pieces, not his opponent's
       if (x == newX && y == newY)
          return false;
       var player = (turn % 2);
       cc.log("isValid move ", logicChessboard[x][y])
       if (logicChessboard[x][y][chess.chessType] != player)
          return false;
       var result = chess.checkRule(x,y,newX,newY,logicChessboard,turn); 
       return result; 
    },
    chessMove: function (x, y, newX, newY, player) {
       var chess = this.getChessAtChessboardPosition(x, y);
       cc.log("chess Move chess", chess.chessType);
       var newPosition = this.calculatePosition(newX, newY);
       var chessDes = this.getChessAtChessboardPosition(newX, newY);
       cc.log("chessDes", chessDes);
       cc.log("ChessMove player", player);
       if (!this.isValidMove(chess, x, y, newX, newY, this.logicChessboard, this.turn)) {
          cc.log("not valid move");
          return;
       }
       // if the destination contains a chess piece
       if (chessDes != null) {
          cc.log("chessDes.type", chessDes.chessType);
          this.removeChess(chessDes);
       }
       this.logicChessboard[x][y] = PLAYER.EMPTY;
       this.logicChessboard[newX][newY] = {};
       this.logicChessboard[newX][newY][chess.chessType] = player;
       // cc.log("          chessType:", chess.chessType)
       chess.setPosition(newPosition);
       chess.setTag(this.getTagFromXY(newX, newY));
       chess.greenBox.setPosition(newPosition);
       this.turn = this.turn + 1;
       // this.turn %=2; 
 
    },
 
    getBoardPositionFromTag: function (tag) {
       return cc.p(Math.floor(tag / 13), tag % 13);
    },
    onUserMoveChess: function (event) {
       if (event.getButton() != cc.EventMouse.BUTTON_LEFT)
          return;
       if (!isChessboardTouchable)
          return; 
       //TARGET here is the layer itself; 
       var target = event.getCurrentTarget();
       var position = event.getLocation();
       position = target.chessboardNode.convertToNodeSpace(position);
       // var position = cc.p(position1.x - target.mapNode.x,position1.y-target.mapNode.y); 
       var stillInChessboard = true;
       var clickPosition = target.calculateScreenPosition(position.x, position.y);
       cc.log("clickPosition", clickPosition.x, clickPosition.y);
       var isValidPosition = function (position) {
          if (position.x <= 0 || position.y <= 0)
             return false;
          if (position.x > 8 || position.y > 8)
             return false;
          return true;
       };
 
       if (isValidPosition(clickPosition) && target.selectedChess == null) {
          target.selectedChess = target.getChessAtChessboardPosition(clickPosition.x, clickPosition.y);
          cc.log("target.selectedChess ", target.selectedChess);
          // target.selectedChess.setScale(target.selectedChess.getScale() +0.15); 
          if (target.selectedChess != null) {
             cc.log("target.logicChessboard[clickPosition.x][clickPosition.y][target.selectedChess.chessType]", target.logicChessboard[clickPosition.x][clickPosition.y][target.selectedChess.chessType]);
             cc.log("turn", target.turn);
             var isRightTurn = (target.turn % 2) == target.logicChessboard[clickPosition.x][clickPosition.y][target.selectedChess.chessType];
             if (!isRightTurn) {
                cc.log("not right turn");
                target.selectedChess = null;
                return;
             }
             target.selectedChess.greenBox.setVisible(true);
             // var actionZoom = cc.scaleBy(0.1, 1.15);
             // target.selectedChess.runAction(cc.sequence(actionZoom, actionZoom.reverse()));
          }  
          return;
       }
       //   cc.log("onUserMoveChess, selectedChess", target.selectedChess);
       if (isValidPosition(clickPosition) && target.selectedChess != null) {
          // target.selectedChess.setScale(target.selectedChess.getScale() - 0.15); 
          var oldPos = target.getBoardPositionFromTag(target.selectedChess.getTag());
          //   cc.log(oldPos.x, oldPos.y, "oldPos");
          var newPos = target.calculateScreenPosition(position.x, position.y);
          //  cc.log("newPos", newPos.x, newPos.y, "newPos");
          var currentPlayer = target.turn % 2;
          target.chessMove(oldPos.x, oldPos.y, newPos.x, newPos.y, currentPlayer);
          // target.turn = (target.turn + 1) % 2;
 
          target.selectedChess.greenBox.setVisible(false);
          target.selectedChess = null;
       }
       //var layerContainingChess = target.getParent().getParent(); 
       // target.chessMove(
    },
    initCodeForChessMoving: function (self) {
       self = this;
       cc.eventManager.addListener({
          event: cc.EventListener.MOUSE,
          onMouseDown: function (event) {
             if (event.getButton() != cc.EventMouse.BUTTON_LEFT)
                return;
             var target = event.getCurrentTarget();
             // target.setScale(1.15);
          },
          onMouseMove: function (event) {
            if (event.getButton() != cc.EventMouse.BUTTON_LEFT)
                return;
             var target = event.getCurrentTarget();
              
          },
          onMouseUp: this.onUserMoveChess
       }, this);
    }
 });
 