/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var isChessboardTouchable = true; 
var HelloWorldLayer = cc.Layer.extend({
   logicChessboard: null,
   mapNode: null,
   tileSize: 32,
   tileCount: 8,
   mapSize: 0,
   selectedChess: null,
   turn: 0,
   chessboardNode: null,
   chessObjects:[], 
   ctor: function () {
      //////////////////////////////
      // 1. super init first
      this._super();
      // this.logicChessboard = new LogicChessboard(); 
      this.mapSize = this.tileSize * this.tileCount;
      // ////cc.log("this.mapSize", this.mapSize);



      this.mapNode = new cc.Sprite("res/niceTileMap.png");;
      this.mapNode.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
      // ////cc.log(this.mapNode); 
      this.mapNode.setAnchorPoint(0.5, 0.5);
      this.addChild(this.mapNode);



      this.chessboardNode = new cc.Node();
      this.chessboardNode.setContentSize(256 ,256);

      this.chessboardNode.setAnchorPoint(0, 0);
      this.addChild(this.chessboardNode);
      this.chessboardNode.setPosition(cc.winSize.width / 2 - this.mapSize/2, 
         cc.winSize.height / 2-this.mapSize/2);
      this.scaleAllBy(2);

      this.initChessboard();
      this.initCodeForChessMoving();

      return true;
   },
  
   initChessboard: function () {
      this.addChess(res.whiteRook, cc.p(8, 1), CHESS_TYPE.CASTLE, PLAYER.WHITE);
      this.addChess(res.whiteRook, cc.p(8, 8), CHESS_TYPE.CASTLE, PLAYER.WHITE);

      this.addChess(res.whiteKnight, cc.p(8, 2), CHESS_TYPE.KNIGHT, PLAYER.WHITE);
      this.addChess(res.whiteKnight, cc.p(8, 7), CHESS_TYPE.KNIGHT, PLAYER.WHITE);

      this.addChess(res.whiteBishop, cc.p(8, 3), CHESS_TYPE.BISHOP, PLAYER.WHITE);
      this.addChess(res.whiteBishop, cc.p(8, 6), CHESS_TYPE.BISHOP, PLAYER.WHITE);

      this.addChess(res.whiteQueen, cc.p(8, 4), CHESS_TYPE.QUEEN, PLAYER.WHITE);
      this.addChess(res.whiteKing, cc.p(8, 5), CHESS_TYPE.KING, PLAYER.WHITE);

      //add pawns

      for (var i = 1; i <= 8; ++i) {
         this.addChess(res.whitePawn, cc.p(7, i), CHESS_TYPE.PAWN, PLAYER.WHITE);
         this.addChess(res.blackPawn, cc.p(2, i), CHESS_TYPE.PAWN, PLAYER.BLACK);
      }

      this.addChess(res.blackRook, cc.p(1, 1), CHESS_TYPE.CASTLE, PLAYER.BLACK);
      this.addChess(res.blackRook, cc.p(1, 8), CHESS_TYPE.CASTLE, PLAYER.BLACK);

      this.addChess(res.blackKnight, cc.p(1, 2), CHESS_TYPE.KNIGHT, PLAYER.BLACK);
      this.addChess(res.blackKnight, cc.p(1, 7), CHESS_TYPE.KNIGHT, PLAYER.BLACK);

      this.addChess(res.blackBishop, cc.p(1, 3), CHESS_TYPE.BISHOP, PLAYER.BLACK);
      this.addChess(res.blackBishop, cc.p(1, 6), CHESS_TYPE.BISHOP, PLAYER.BLACK);

      this.addChess(res.blackQueen, cc.p(1, 4), CHESS_TYPE.QUEEN, PLAYER.BLACK);
      this.addChess(res.blackKing, cc.p(1, 5), CHESS_TYPE.KING, PLAYER.BLACK);

      randomDemote.init(this.chessObjects,this.logicChessboard);
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
      
      var newChess = new MyChess(type,player,this.logicChessboard);
      
      newChess.chessType = type;
      newChess.stateTag = CHESS_STATE.NOT_SELECTED;
      newChess.setScale(this.tileSize / newChess.getContentSize().width);
     
      newChess.setAnchorPoint(1, 1);
      var chessPos = this.calculatePosition(position.x, position.y);
      newChess.setPosition(chessPos);
      this.mapNode.addChild(newChess, 2, this.getTagFromXY(position.x, position.y));

      var greenBox = new cc.Sprite(res.green, cc.rect(0, 0, this.tileSize, this.tileSize));

      greenBox.setOpacity(180);
      greenBox.setAnchorPoint(1, 1);
      greenBox.setPosition(chessPos);
      newChess.greenBox = greenBox;
      greenBox.setVisible(false);
      this.mapNode.addChild(greenBox, 1);

      this.chessObjects.push(newChess); 
   },
   calculatePosition: function (x, y) {
      topLeftX = 0;
      topLeftY =0;
      //TODO: since row first, column follows, resX and resY must be interchanged.
      var resX = y*this.tileSize;
      var resY = x*this.tileSize;
      return cc.p(resX, resY);
   },
   calculateScreenPosition: function (x, y) {
      resX = Math.floor((+ y) / 32) + 1;
      resY = Math.floor(( x) / 32) + 1;
      // //cc.log("screen position",resX, resY);
      return cc.p(resX, resY);
   },
   getChessAtChessboardPosition: function (x, y) {
      var chess = this.mapNode.getChildByTag(this.getTagFromXY(x, y));
      if (chess)
         return chess;
    //  //cc.log("getChessAtChessboardPosition return null", x, y)
      return null;
   },
   removeChess: function (chessKilled, chessKiller) {
      chessKilled.greenBox.removeFromParent(true);
      chessKilled.removeFromParent(true);
      if (CHESS_PRIORITY[chessKiller.chessType] < CHESS_PRIORITY[chessKilled.chessType]) {
         if (chessKiller.chessType!= CHESS_TYPE.KING && chessKilled.chessType != CHESS_TYPE.KING)
             showPromoteDialog(chessKiller,chessKilled,randomDemote);
      }
   },
   isValidMove: function (chess, x, y, newX, newY, logicChessboard, turn) {
      // var chess = this.getChessAtChessboardPosition(x,y); 
      //if the player pick his chess pieces, not his opponent's
      if (x == newX && y == newY)
         return false;
      var player = (turn % 2);
      ////cc.log("isValid move ", logicChessboard[x][y])
      if (logicChessboard[x][y][chess.chessType] != player)
         return false;
      var result = chess.checkRule(x,y,newX,newY,logicChessboard,turn); 
      return result; 
   },
   chessMove: function (x, y, newX, newY, player) {
      var chess = this.getChessAtChessboardPosition(x, y);
    //  //cc.log("chess Move chess", chess.chessType);
      var newPosition = this.calculatePosition(newX, newY);
      var chessDes = this.getChessAtChessboardPosition(newX, newY);
     // //cc.log("chessDes", chessDes);
     // //cc.log("ChessMove player", player);
      if (!this.isValidMove(chess, x, y, newX, newY, this.logicChessboard, this.turn)) {
       //  //cc.log("not valid move");
         return;
      }
      // if the destination contains a chess piece
      if (chessDes != null) {
        // //cc.log("chessDes.type", chessDes.chessType);
         this.removeChess(chessDes,chess);
      }
      this.logicChessboard[x][y] = PLAYER.EMPTY;
      this.logicChessboard[newX][newY] = {};
      this.logicChessboard[newX][newY][chess.chessType] = player;
      // //cc.log("          chessType:", chess.chessType)
      chess.setPosition(newPosition);
      chess.setTag(this.getTagFromXY(newX, newY));
      chess.greenBox.setPosition(newPosition);
      this.turn = this.turn + 1;
      // this.turn %=2; 

   },

   getBoardPositionFromTag: function (tag) {
      return getBoardPositionFromTag(tag);
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
     // //cc.log("clickPosition", clickPosition.x, clickPosition.y);
      var isValidPosition = function (position) {
         if (position.x <= 0 || position.y <= 0)
            return false;
         if (position.x > 8 || position.y > 8)
            return false;
         return true;
      };

      if (isValidPosition(clickPosition) && target.selectedChess == null) {
         target.selectedChess = target.getChessAtChessboardPosition(clickPosition.x, clickPosition.y);
         //cc.log("target.selectedChess ", target.selectedChess);
         // target.selectedChess.setScale(target.selectedChess.getScale() +0.15); 
         if (target.selectedChess != null) {
            ////cc.log("target.logicChessboard[clickPosition.x][clickPosition.y][target.selectedChess.chessType]", target.logicChessboard[clickPosition.x][clickPosition.y][target.selectedChess.chessType]);
            ////cc.log("turn", target.turn);
            var isRightTurn = (target.turn % 2) == target.logicChessboard[clickPosition.x][clickPosition.y][target.selectedChess.chessType];
            if (!isRightTurn) {
               ////cc.log("not right turn");
               target.selectedChess = null;
               return;
            }
            target.selectedChess.greenBox.setVisible(true);
            // var actionZoom = cc.scaleBy(0.1, 1.15);
            // target.selectedChess.runAction(cc.sequence(actionZoom, actionZoom.reverse()));
         }  
         return;
      }
      //   ////cc.log("onUserMoveChess, selectedChess", target.selectedChess);
      if (isValidPosition(clickPosition) && target.selectedChess != null) {
         // target.selectedChess.setScale(target.selectedChess.getScale() - 0.15); 
         var oldPos = target.getBoardPositionFromTag(target.selectedChess.getTag());
         //   ////cc.log(oldPos.x, oldPos.y, "oldPos");
         var newPos = target.calculateScreenPosition(position.x, position.y);
         //  ////cc.log("newPos", newPos.x, newPos.y, "newPos");
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
         onMouseMove: function (event) {},
         onMouseUp: this.onUserMoveChess
      }, this);
   }
});

var HelloWorldScene = cc.Scene.extend({
   onEnter: function () {
      this._super();
      var layer = new HelloWorldLayer();
      this.addChild(layer);
   }
});

getBoardPositionFromTag = function (tag) {
   return cc.p(Math.floor(tag / 13), tag % 13);
}; 