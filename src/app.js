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
var isDialogOn = false;
var ChessboardGUIInstance = null;
var ChessboardGUI = cc.Layer.extend({
   logicChessboard: null,
   mapNode: null,
   tileSize: 32,
   tileCount: 8,
   mapSize: 0,
   selectedChess: null,
   turn: 0,
   chessboardNode: null,
   chessObjects: [],
   revertButton: null,
   playerSide: null,
   yourTurnLabel: null,
   greenBoxPool: [],
   numGreenBoxUse: 0, 
   ctor: function (isWhitePlayer) {
      //////////////////////////////
      // 1. super init first
      this._super();
      ChessboardGUIInstance = this;
      this.mapSize = this.tileSize * this.tileCount;

      // this.yourTurnLabel = new cc.LabelBMFont("YOUR TURN!", res.font);
      // this.yourTurnLabel.setColor(new cc.Color(0, 0, 255));
      // this.yourTurnLabel.setAnchorPoint(0.5, 0.5);
      // this.yourTurnLabel.setScale(1);
      this.yourTurnLabel = new cc.Sprite(res.your_turn);
      this.yourTurnLabel.setScale(this.mapSize / this.yourTurnLabel.width);
      var lbHeight = this.mapSize / this.yourTurnLabel.width * this.yourTurnLabel.height;
      this.addChild(this.yourTurnLabel, 100);
      if (isWhitePlayer == true) {
         this.turn = 0;
         this.playerSide = PLAYER.WHITE;
         this.yourTurnLabel.setVisible(false);
         this.yourTurnLabel.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 + this.mapSize / 2 +
            lbHeight / 2);

      } else {
         this.turn = 0;
         this.playerSide = PLAYER.BLACK;
         this.yourTurnLabel.setVisible(true);
         this.yourTurnLabel.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 - this.mapSize / 2 -
            lbHeight / 2);
      }

      this.mapNode = new cc.Sprite("res/niceTileMap.png");;
      this.mapNode.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
      this.mapNode.setAnchorPoint(0.5, 0.5);
      this.addChild(this.mapNode);


      this.chessboardNode = new cc.Node();
      this.chessboardNode.setContentSize(256, 256);

      this.chessboardNode.setAnchorPoint(0, 0);
      this.addChild(this.chessboardNode);
      this.chessboardNode.setPosition(cc.winSize.width / 2 - this.mapSize / 2,
         cc.winSize.height / 2 - this.mapSize / 2);
      this.scaleAllBy(2);


      this.addRevertButton();
      this.addSurrenderButton();

      this.initChessboard();
      this.initCodeForChessMoving();


      this.listenForChessMoveFromServer();
      this.listenForRevertRequest();
      this.listenForTypeChange();
      this.listenForGameResult();
      this.removeFromParent(true);
      return true;
   },
   listenForGameResult: function () {
      firebase.database().ref("room/" + roomID + "/gameResult").on('value', function (snapshot) {
         if (snapshot != null) {
            var value = snapshot.val();
            cc.log("GAME RESULT::::::", value);
            if (value != null) {
               if (value.playerWin == ChessboardGUIInstance.playerSide) {
                  showWinDialog();
               } else {
                  showLoseDialog();
               }
            }
         }
      });
   },
   addRevertButton: function () {
      var lb = new cc.LabelBMFont("Revert", res.font);
      var bg = new cc.Scale9Sprite(res.buttonImg);
      lb.setScale(0.5);

      this.revertButton = new cc.ControlButton(lb, bg);
      // this.revertButton.setPreferredSize(bg.getContentSize());

      var width = bg.getContentSize().width;
      var height = bg.getContentSize().height;
      this.revertButton.setPosition(cc.winSize.width / 2 + this.mapSize / 2 + bg.getContentSize().width / 2, cc.winSize.height / 2);
      this.revertButton.setPreferredSize(cc.size(3 * width / 4, 3 * height / 4));

      lb.setAnchorPoint(0.5, 0.5);
      // lb.setLocalZOrder(10); 
      this.addChild(this.revertButton);

      // this.revertButton.addTarget
      this.revertButton.addTargetWithActionForControlEvents(this, this.sendRevertRequest.bind(this), cc.CONTROL_EVENT_TOUCH_UP_INSIDE)

   },

   addSurrenderButton: function () {
      var lb = new cc.LabelBMFont("Surrender", res.font);
      var bg = new cc.Scale9Sprite(res.buttonImg);
      lb.setScale(0.5);

      this.surrenderButton = new cc.ControlButton(lb, bg);
      // this.revertButton.setPreferredSize(bg.getContentSize());

      var width = bg.getContentSize().width;
      var height = bg.getContentSize().height;
      this.surrenderButton.setPosition(cc.winSize.width / 2 + this.mapSize / 2 + bg.getContentSize().width / 2, cc.winSize.height / 2 -
         lb.height);
      this.surrenderButton.setPreferredSize(cc.size(3 * width / 4, 3 * height / 4));

      lb.setAnchorPoint(0.5, 0.5);
      // lb.setLocalZOrder(10); 
      this.addChild(this.surrenderButton);

      // this.revertButton.addTarget
      this.surrenderButton.addTargetWithActionForControlEvents(this, this.sendResult.bind(this, (this.playerSide + 1) % 2), cc.CONTROL_EVENT_TOUCH_UP_INSIDE)

   },

   sendRevertRequest: function () {

      if (this.turn == 0)
         return;
      if (selfPlay) {

         return;
      }
      var database = firebase.database();

      var req = {};

      req["turn"] = this.turn - 1;

      req["player"] = this.playerSide;

      req["processed"] = false;

      database.ref("room/" + roomID + "/revertReq/").set(req);
   },
   sendChangeType: function (chess) {
      if (selfPlay) {
         return;
      }
      var database = firebase.database();
      var req = {};
      var pos = getBoardPositionFromTag(chess.tag);
      req.x = pos.x;
      req.y = pos.y;
      req.chessType = chess.chessType;
      req.player = this.playerSide;
      database.ref("room/" + roomID + "/setTypeReq").push().set(req);
   },
   listenForTypeChange: function () {
      var database = firebase.database();
      database.ref("room/" + roomID + "/setTypeReq").on('child_added', function (snapshot) {
         if (snapshot != null) {
            var value = snapshot.val();
            if (value != null && value.player != ChessboardGUIInstance.playerSide) {
               var chess = ChessboardGUIInstance.getChessAtChessboardPosition(value.x, value.y);
               ChessboardGUIInstance.changeType(chess, value.chessType);
            }
         }
      })
   },
   changeType: function (chess, chessType) {
      var x = Math.floor(chess.tag / 13);
      var y = chess.tag % 13;
      GameLogic.setType(x, y, chessType);
      chess.setType(chessType, chess.player);
      chess.promoted = true;
   },
   listenForRevertRequest: function () {
      var database = firebase.database();
      database.ref("room/" + roomID + "/revertReq").on('value', function (snapshot) {
         if (snapshot != null && snapshot.val() != null) {
            var value = snapshot.val();
            ChessboardGUIInstance.processRevertRequest(value.turn, value.player, value.processed);
         }
      });
   },
   processRevertRequest: function (turn, player, processed) {
      if (processed == false && player != this.playerSide) {
         this.showRevertRequestDialog(turn, player, processed);
      } else if (processed == (this.playerSide + 1) % 2) {
         this.performRevert(turn, player, "Done");
      } else if (processed == "Not accepted") {
         this.onRevertDeclined();
      }

   },
   performRevert: function (turn, player, processed) {
      var database = firebase.database();
      isChessboardTouchable = false;
      database.ref("room/" + roomID + "/" + turn).once('value').then(function (snapshot) {
         if (snapshot != null) {
            var value = snapshot.val();
            if (value != null) {
               ChessboardGUIInstance.turn = turn;
               ChessboardGUIInstance.onReceiveChessMove(value.turn, value.newX, value.newY, value.x, value.y);
               ChessboardGUIInstance.turn = turn;
               if (value.chessKilledType != "null") {
                  ChessboardGUIInstance.addChess("whateverType", value.newX, value.newY, value.chessKilledType, (value.turn + 1) % 2);
               }
               //ChessboardGUIInstance.turn = turn -1; 
               if (processed == "Done") {
                  database.ref("room/" + roomID + "/revertReq").set(null);
               } else database.ref("room/" + roomID + "/revertReq/processed").set(processed);
               isChessboardTouchable = true;
            }
         }
      });
   },
   showRevertRequestDialog: function (turn, player, processed) {
      this.dialog = new RevertRequestDialog(this.onAcceptToRevert.bind(this, turn, player, processed),
         this.onPlayerDeclineToRevert.bind(this, turn, player, processed));
      isDialogOn = true;
      this.addChild(this.dialog, 1000);
   },
   onAcceptToRevert: function (turn, player, processed) {
      // var database = firebase.database();
      // var req = {};
      // req["turn"] = turn;
      // req["player"] = player;
      // req["processed"] = this.player;
      // database.ref("room/" + roomID + "/revertReq/").set(req);
      cc.log("performRevert");
      this.performRevert(turn, player, this.playerSide);
      this.dialog.removeFromParent(true);

   },
   onPlayerDeclineToRevert: function (turn, player) {
      var database = firebase.database();
      var req = {};
      req["turn"] = turn;
      req["player"] = player;
      req["processed"] = "Not Accepted";
      database.ref("room/" + roomID + "/revertReq/").set(req);
      this.dialog.removeFromParent(true);
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

      randomDemote.init(this.chessObjects, this.logicChessboard);
      GameLogic.setBoard();
   },
   scaleAllBy: function (scale) {
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
      this.logicChessboard[position.x][position.y].type = type;
      this.logicChessboard[position.x][position.y].color = player;


      if (player == PLAYER.BLACK)
         playerString = "black";
      if (player == PLAYER.WHITE)
         playerString = "white";
      var img = "res/green.png";

      var newChess = new MyChess(type, player, this.logicChessboard);

      newChess.chessType = type;
      newChess.stateTag = CHESS_STATE.NOT_SELECTED;
      newChess.setScale(this.tileSize / newChess.getContentSize().width);

      newChess.setAnchorPoint(1, 1);
      var chessPos = this.calculatePosition(position.x, position.y);
      newChess.setPosition(chessPos);
      this.mapNode.addChild(newChess, 2, this.getTagFromXY(position.x, position.y));

      // var greenBox = new cc.Sprite(res.green, cc.rect(0, 0, this.tileSize, this.tileSize));
      var greenBox = new cc.Scale9Sprite(res.green); 
      greenBox.setPreferredSize(cc.size(this.tileSize,this.tileSize));
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
      topLeftY = 0;
      //TODO: since row first, column follows, resX and resY must be interchanged.
      var resX = y * this.tileSize;
      var resY = x * this.tileSize;
      return cc.p(resX, resY);
   },
   calculateScreenPosition: function (x, y) {
      resX = Math.floor((+y) / 32) + 1;
      resY = Math.floor((x) / 32) + 1;
      return cc.p(resX, resY);
   },
   getChessAtChessboardPosition: function (x, y) {
      var chess = this.mapNode.getChildByTag(this.getTagFromXY(x, y));
      if (chess)
         return chess;
      return null;
   },
   removeChess: function (chessKilled, chessKiller) {
      // chessKilled.greenBox.setVisible(false);
      // chessKilled.setVisible(false);
      if (CHESS_PRIORITY[chessKiller.chessType] < CHESS_PRIORITY[chessKilled.chessType]) {
         if (chessKiller.chessType != CHESS_TYPE.KING && chessKilled.chessType != CHESS_TYPE.KING)
            showPromoteDialog(chessKiller, chessKilled, randomDemote);
      } else if (chessKilled.chessType == CHESS_TYPE.KING) {
         {
            this.sendResult((chessKilled.player + 1) % 2);
         }
      }
      chessKilled.removeFromParent(true);

   },
   sendResult: function (player) {
      if (selfPlay) {
         if (player != this.playerSide) {
            showLoseDialog();
         } else showWinDialog();
         return;
      }
      var req = {};
      req.playerWin = player;
      firebase.database().ref("room/" + roomID + "/gameResult").set(req);
   },
   isValidMove: function (chess, x, y, newX, newY, logicChessboard, turn) {
      //if the player pick his chess pieces, not his opponent' 
      if (x == newX && y == newY)
         return false;
      var player = (turn % 2);
      if (logicChessboard[x][y].color != player)
         return false;
      var result = chess.checkRule(x, y, newX, newY, logicChessboard, turn);
      return result;
   },
   chessMove: function (x, y, newX, newY, player) {
      var chess = this.getChessAtChessboardPosition(x, y);
      var newPosition = this.calculatePosition(newX, newY);
      var chessDes = this.getChessAtChessboardPosition(newX, newY);


      if (!this.isValidMove(chess, x, y, newX, newY, this.logicChessboard, this.turn)) {
         return;
      }

      var chessType = chessDes ? chessDes.chessType : "null";
      this.sendMoveRequest(this.turn, x, y, newX, newY, chessType);
   },
   sendMoveRequest: function (turn, x, y, newX, newY, chessKilled) {
      if (selfPlay) {
         this.onReceiveChessMove(turn, x, y, newX, newY, chessKilled);
         return;
      }
      var database = firebase.database();
      var req = {};
      req["turn"] = turn;
      req["x"] = x;
      req["y"] = y;
      req["newX"] = newX;
      req["newY"] = newY;
      req["chessKilledType"] = chessKilled;
      database.ref("room/" + roomID + "/" + (turn)).set(req);


      this.listenForChessMoveFromServer();
   },
   onReceiveChessMove: function (turn, x, y, newX, newY, chessKilled) {
      cc.log("client turn: ", this.turn, "server:", turn, x, y, newX, newY);
      firebase.database().ref("room/" + roomID + "/" + turn).off();

      if (this.turn == turn) {
         var player = this.turn % 2;
         var chess = this.getChessAtChessboardPosition(x, y);
         var newPosition = this.calculatePosition(newX, newY);
         var chessDes = this.getChessAtChessboardPosition(newX, newY);
         GameLogic.userMove(x, y, newX, newY);
         if (chess == null)
            return;
         if (chessDes != null) {
            chessDes.setTag(-chessDes.tag);
            this.removeChess(chessDes, chess);
         }
         this.logicChessboard[x][y] = PLAYER.EMPTY;
         this.logicChessboard[newX][newY] = {};
         this.logicChessboard[newX][newY].color = player;
         this.logicChessboard[newX][newY].type = chess.chessType
         chess.setPosition(newPosition);
         chess.setTag(this.getTagFromXY(newX, newY));
         chess.greenBox.setPosition(newPosition);
         this.turn = this.turn + 1;
         this.listenForChessMoveFromServer();
         isDialogOn = false;
         // this.turn %=2; 
      }
   },
   listenForChessMoveFromServer: function () {
      // cc.log("listenForChessMoveFromServer", this.turn);

      if (this.turn % 2 == this.playerSide) {
         this.yourTurnLabel.setVisible(true)
      } else {
         this.yourTurnLabel.setVisible(false);
      }

      var database = firebase.database();
      if (roomID == null)
         return;
      database.ref("room/" + roomID + "/" + this.turn).on('value', function (snapshot) {
         // cc.log("Receive from room",roomID,ChessboardGUIInstance.turn   ); 
         if (snapshot != null) {
            var req = snapshot.val();
            if (req != null) {
               ChessboardGUIInstance.onReceiveChessMove(req.turn, req.x, req.y, req.newX, req.newY);
            }
         }
      });
   },

   getBoardPositionFromTag: function (tag) {
      return getBoardPositionFromTag(tag);
   },

   onUserMoveChess: function (event) {
      if (event.getButton() != cc.EventMouse.BUTTON_LEFT)
         return false;

      if (!isChessboardTouchable) {
         // cc.log("Not touchable")
         return false;
      }


      //TARGET here is the layer itself; 
      var target = event.getCurrentTarget();
      var position = event.getLocation();




      // cc.log("On user move chess");
      position = target.chessboardNode.convertToNodeSpace(position);
      var stillInChessboard = true;
      var clickPosition = target.calculateScreenPosition(position.x, position.y);
      var isValidPosition = function (position) {
         if (position.x <= 0 || position.y <= 0)
            return false;
         if (position.x > 8 || position.y > 8)
            return false;
         return true;
      };
      if (!isValidPosition(clickPosition)) {
         return;
      }
      if (target.turn % 2 != target.playerSide && position.x && !selfPlay) {
         target.showNotYourTurnDialog();
         return false;
      }

      if (target.selectedChess == null) {
         target.selectedChess = target.getChessAtChessboardPosition(clickPosition.x, clickPosition.y);
         if (target.selectedChess != null) {
            var isRightTurn = (target.turn % 2) == target.logicChessboard[clickPosition.x][clickPosition.y].color;
            if (!isRightTurn) {
               target.selectedChess = null;
               target.hidePossibleMove.bind(target)();
               // cc.log("NOT RIGHT TURN, Bastard")
               return false;
            }
            target.selectedChess.greenBox.setVisible(true);
            target.showPossibleMove.bind(target,clickPosition)();

         }
         // cc.log("Selected ....")
         return false;
      }
      if (target.selectedChess != null) {
         var oldPos = target.getBoardPositionFromTag(target.selectedChess.getTag());
         var newPos = target.calculateScreenPosition(position.x, position.y);
         var currentPlayer = target.turn % 2;
         target.chessMove(oldPos.x, oldPos.y, newPos.x, newPos.y, currentPlayer);
         target.selectedChess.greenBox.setVisible(false);
         target.hidePossibleMove.bind(target)();
         target.selectedChess = null;
      }
      return true;
   },
   showPossibleMove: function (position) {
      var chess = this.selectedChess;
      var possibleMoves = MoveRecom.getPossibleMove(position.x, position.y, chess.chessType, this.logicChessboard);
      this.numGreenBoxUse = 0;
      for (var i = 0; i < possibleMoves.length; ++i) {
         var chessPos = this.calculatePosition(possibleMoves[i].x, possibleMoves[i].y);
         var greenBox = this.getGreenBox();
         greenBox.setPosition(chessPos);
         greenBox.setVisible(true);
      }
   },
   hidePossibleMove: function (position) {
      for (var i = 0; i < this.greenBoxPool.length; ++i) {
         this.greenBoxPool[i].setVisible(false);
      };
      this.numGreenBoxUse = 0;
   },
   getGreenBox: function () {
      this.numGreenBoxUse += 1;
      if (this.numGreenBoxUse >= this.greenBoxPool.length) {
         var greenBox = new cc.Scale9Sprite(res.green);
         greenBox.setPreferredSize(cc.size(this.tileSize,this.tileSize));
         greenBox.setOpacity(180);
         greenBox.setAnchorPoint(1, 1);
         // greenBox.setPosition(chessPos);
         greenBox.setVisible(false);
         this.mapNode.addChild(greenBox, 1);
         this.greenBoxPool.push(greenBox);
      }
      return (this.greenBoxPool[this.numGreenBoxUse - 1]);
   },
   initCodeForChessMoving: function (self) {
      self = this;
      cc.eventManager.addListener({
         event: cc.EventListener.MOUSE,
         onMouseDown: function (event) {
            if (event.getButton() != cc.EventMouse.BUTTON_LEFT)
               return;
            var target = event.getCurrentTarget();
            target.yourTurnLabel.setVisible(false);
            // target.setScale(1.15);
         },
         onMouseMove: function (event) {},
         onMouseUp: this.onUserMoveChess
      }, this);
   },
   showNotYourTurnDialog: function () {
      if (!isDialogOn) {
         var dialog = new NotYourTurnDialog();
         this.addChild(dialog, 1000);
      }
   }
});

var HelloWorldScene = cc.Scene.extend({
   onEnter: function () {
      this._super();
      var layer = new StartGameScreen();
      this.addChild(layer);
   }
});

getBoardPositionFromTag = function (tag) {
   return cc.p(Math.floor(tag / 13), tag % 13);
};

var GameScreen = cc.Scene.extend({
   ctor: function (isWhitePlayer) {
      this.isWhitePlayer = isWhitePlayer;
   },
   onEnter: function () {
      this._super();
      var layer = new ChessboardGUI(this.isWhitePlayer);
      this.addChild(layer);
   }
})