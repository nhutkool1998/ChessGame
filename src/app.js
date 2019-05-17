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

var CHESS_STATE = {
   SELECTED: 0,
   NOT_SELECTED: 1
};
var SPRITE_TAG = {
   GREEN_BOX_TAG: 100
}
var CHESS_TYPE = {
   KING: "KING",
   QUEEN: "QUEEN",
   KNIGHT: "KNIGHT",
   BISHOP: "BISHOP",
   PAWN: "PAWN",
   CASTLE: "CASTLE"
}
var PLAYER = {
   BLACK: 0,
   WHITE: 1
}
var HelloWorldLayer = cc.Layer.extend({
   sprite: null,
   mapNode: null,
   tileMap: null,
   tileWidth: null,
   tileHeight: null,
   chessScale: null,
   columnCount: 8,
   selectedChess: null,
   mapWidth: null,
   mapHeight: null,
   chessWidth: null,
   chessHeight: null,
   topLeftX: null,
   topLeftY: null,
   logicChessboard: null,
   turn: 0,
   ctor: function () {
      //////////////////////////////
      // 1. super init first
      this._super();
      // this.logicChessboard = new LogicChessboard(); 

      this.mapNode = new cc.Sprite();
      var mapWidth, mapHeight;
      this.tileMap = cc.TMXTiledMap.create(res.chessMap);
      mapHeight = this.tileMap.height;
      mapWidth = this.tileMap.width;
      this.mapWidth = mapWidth;
      this.mapHeight = mapHeight;
      this.tileMap.setPosition(0, 0);
      this.tileMap.setAnchorPoint(0.5, 0.5);

      var tempSprite = new cc.Sprite(res.blackKing);
      this.tileWidth = this.tileMap.getTileSize().width;
      this.tileHeight = this.tileMap.getTileSize().height;
      this.chessScale = this.tileWidth / tempSprite.getContentSize().width;

      // this.addChess(res.blackKing, cc.p(2, 1), "KING");
      // this.addChess(res.blackQueen, cc.p(3, 1), "QUEEN");

      this.mapNode.addChild(this.tileMap, 0);
      this.addChild(this.mapNode);
      this.mapNode.setTextureRect(cc.rect(0, 0, this.tileMap.width, this.tileMap.height));
      this.mapNode.setPosition(cc.winSize.width / 2 + mapWidth / 2, cc.winSize.height / 2 + mapHeight / 2);
      this.mapNode.setAnchorPoint(0.5, 0.5);
      // this.chessMove(2, 1, 3, 1);
      // this.scaleAllBy(2);
      this.initChessboard();
      // this.chessMove(3, 1, 8, 8);
      this.initCodeForChessMoving();



      return true;
   },
   scaleAllBy: function (scale) {
      this.mapNode.setScale(scale);
      this.chessScale = this.tileWidth / (this.tileWidth * scale);
      this.tileHeight = this.tileMap.getTileSize().height * scale;
      this.tileWidth = this.tileMap.getTileSize().width * scale;
      this.mapHeight *= scale;
      this.mapWidth *= scale;
      this.mapNode.setTextureRect(cc.rect(0, 0, this.tileMap.width * scale, this.tileMap.height * scale));
      var posX = cc.winSize.width / 2 + this.mapHeight / 2 + this.mapHeight / 2 * (scale - 1);
      var posY = cc.winSize.height / 2 + this.mapWidth / 2 + this.mapWidth / 2 * (scale - 1);
      this.mapNode.setPosition(posX, posY);
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

   },
   addChess: function (sprite, position, type, player) {
      //if the logic chess board is yet to be ialized, initialize it
      if (this.logicChessboard == null) {
         this.logicChessboard = {};
         for (var i = 1; i <= 8; ++i) {
            this.logicChessboard[i] = {};
            for (var j = 1; j <= 8; ++j) {
               this.logicChessboard[i][j] = -1;
            }
         }
      }
      this.logicChessboard[position.x][position.y] = {};
      this.logicChessboard[position.x][position.y][type] = player;

      var newChess = new cc.Sprite(sprite);
      newChess.chessType = type;
      newChess.stateTag = CHESS_STATE.NOT_SELECTED;
      // this.chessScale = this.tileWidth / newChess.getContentSize().width;
      this.chessWidth = this.chessScale * newChess.width;
      this.chessHeight = this.chessScale * newChess.height;
      newChess.setScale(this.chessScale);
      newChess.setAnchorPoint(0.5, 0.5);
      var chessPos = this.calculatePosition(position.x, position.y);
      newChess.setPosition(chessPos);
      this.mapNode.addChild(newChess, 2, this.getTagFromXY(position.x, position.y));

      // this.logicChessboard.addChess(type,position); 

      var greenBox = new cc.Sprite(res.green, cc.rect(0, 0, this.chessWidth, this.chessHeight));
      // greenBox.setTextureRect(cc.rect(0,0,32,32)); 
      // greenBox.setColor(new cc.Color(255,255,255)); 

      greenBox.setOpacity(180);
      greenBox.setPosition(chessPos);
      newChess.greenBox = greenBox;
      greenBox.setVisible(false);
      this.mapNode.addChild(greenBox, 1);
   },
   getTagFromXY: function (x, y) {
      return x * this.columnCount + y;
   },
   calculatePosition: function (x, y) {
      topLeftX = -this.mapWidth / 2 + this.tileWidth / 2;
      topLeftY = this.mapHeight / 2 - this.tileHeight / 2;
      //TODO: since row first, column follows, resX and resY must be interchanged.
      var resX = topLeftX + (y - 1) * this.tileWidth;
      var resY = topLeftY - (x - 1) * this.tileHeight;
      // cc.log("topLeftY", topLeftY);
      // cc.log("resX", resX);
      // cc.log("resY", resY);
      // cc.log("cc.winSize.width/2", cc.winSize.width / 2);
      return cc.p(resX, resY);
   },
   calculateScreenPosition: function (x, y) {
      // cc.log("calculateScreenPosition", x, y);
      //reduce x and y, so that it would fit better
      var topLeftX = -this.mapWidth / 2;
      //+ this.tileWidth / 2;
      var topLeftY = this.mapHeight / 2;
      //- this.tileHeight / 2;
      // var resX = x - topLeftX;
      // var resY = y - topLeftY;
      resX = -y + topLeftY;
      resX = Math.floor(resX / this.tileWidth) + 1;
      resY = x - topLeftX;
      resY = Math.floor(resY / this.tileHeight) + 1;
      return cc.p(resX, resY);
   },
   getChessAtChessboardPosition: function (x, y) {
      var chess = this.mapNode.getChildByTag(this.getTagFromXY(x, y));
      if (chess)
         return chess;
      return null;
   },
   removeChess: function (chess) {
      chess.greenBox.removeFromParent(true);
      chess.removeFromParent(true);
   },
   isValidMove: function (chess, x, y, newX, newY, logicChessboard, player) {
      // var chess = this.getChessAtChessboardPosition(x,y); 
      //if the player pick his chess pieces, not his opponent's
      if (x == newX && y == newY)
         return false; 
      if (logicChessboard[x][y][chess.chessType] != player)
         return false;
      return true; 
      return WesternChess.CheckChessRules(x, y, newX, newY, chess.chessType, logicChessboard);
   },
   chessMove: function (x, y, newX, newY, player) {
      var chess = this.getChessAtChessboardPosition(x, y);
      var newPosition = this.calculatePosition(newX, newY);
      var chessDes = this.getChessAtChessboardPosition(newX, newY);
      cc.log("chessDes", chessDes);
      cc.log("ChessMove player",player); 
      if (!this.isValidMove(chess, x, y, newX, newY, this.logicChessboard, player)) {
         cc.log("not valid move");
         return;
      }
      // if the destination contains a chess piece
      if (chessDes != null) {
         cc.log("chessDes.type", chessDes.chessType);
         this.removeChess(chessDes);
      }
      this.logicChessboard[x][y] = -1;
      this.logicChessboard[newX][newY] = {}; 
      this.logicChessboard[newX][newY][chess.chessType] = player;

      chess.setPosition(newPosition);
      chess.setTag(this.getTagFromXY(newX, newY));
      chess.greenBox.setPosition(newPosition);
      this.turn = this.turn +1
      this.turn %=2; 

   },

   getBoardPositionFromTag: function (tag) {
      return cc.p(Math.floor(tag / this.columnCount), tag % this.columnCount);
   },
   onUserMoveChess: function (event) {
      if (event.getButton() != cc.EventMouse.BUTTON_LEFT)
         return;
      //TARGET here is the layer itself; 
      var target = event.getCurrentTarget();
      var position = event.getLocation();
      position = target.mapNode.convertToNodeSpace(position);
      // var position = cc.p(position1.x - target.mapNode.x,position1.y-target.mapNode.y); 
      var stillInChessboard = true;
      var clickPosition = target.calculateScreenPosition(position.x, position.y);
      // cc.log("clickPosition", clickPosition.x, clickPosition.y);
      var isValidPosition = function (position) {
         if (position.x <= 0 || position.y <= 0)
            return false;
         if (position.x > 8 || position.y > 8)
            return false;
         return true;
      };

      if (isValidPosition(clickPosition) && target.selectedChess == null) {
         target.selectedChess = target.getChessAtChessboardPosition(clickPosition.x, clickPosition.y);
         cc.log("target.selectedChess ",target.selectedChess ); 
         // target.selectedChess.setScale(target.selectedChess.getScale() +0.15); 
         if (target.selectedChess != null) {
            cc.log("target.logicChessboard[clickPosition.x][clickPosition.y][target.selectedChess.chessType]",target.logicChessboard[clickPosition.x][clickPosition.y][target.selectedChess.chessType]); 
            cc.log("turn",target.turn); 
            var isRightTurn = target.turn == target.logicChessboard[clickPosition.x][clickPosition.y][target.selectedChess.chessType];
            if (!isRightTurn) {
               target.selectedChess = null;
               return;
            }
            target.selectedChess.greenBox.setVisible(true);
            var actionZoom = cc.scaleBy(1, 1.15);
            target.selectedChess.runAction(cc.sequence(actionZoom, actionZoom.reverse()));
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
         target.chessMove(oldPos.x, oldPos.y, newPos.x, newPos.y, target.turn);
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