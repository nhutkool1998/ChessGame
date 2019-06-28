var MyChess = ccui.Button.extend({
    chessType: null,
    chessRule: null,
    player: null,
    logicChessboard: null,
    promoted: false, 
    ctor: function (chessType, player, logicChessboard) {
        var playerString;
        if (logicChessboard != null)
            this.logicChessboard = logicChessboard;
        if (player == PLAYER.BLACK)
            playerString = "black";
        if (player == PLAYER.WHITE)
            playerString = "white";
        var img = res[playerString + chessType];
        this._super();
        this.loadTextures(img, img, img);
        var playerString = "";
        this.player = player;
        // _sprite = new cc.Sprite();
        this.setPressedActionEnabled(true);

        // //cc.log("__________~~~~~~~~______img",img);

        // this.setType(chessType, player);
        this._setRule(chessType);
    },

    _setRule: function (chessType) {
        var rule = function (x, y, newX, newY, logicChessboard, turn) {
            var res1 = new willnotKillTeammate()._checkRule.bind(willnotKillTeammate, x, y, newX, newY, logicChessboard, turn)();
            var rule2 = new WesternChessRule[chessType]();
            var res2 = rule2._checkRule.bind(WesternChessRule[chessType], x, y, newX, newY, logicChessboard, turn, this)();
            return res1 && res2;
        }
        this.chessRule = rule;
    },
    setRule: function (chessRule) {
        this.chessRule = chessRule;
    },
    checkRule: function (x, y, newX, newY, logicChessboard, turn) {
        return this.chessRule(x, y, newX, newY, logicChessboard, turn);
    },
    setImage: function (img) {
        this.loadTextures(img, img, img);
    },
    setType: function (chessType) {
       var player = this.player; 
        this.chessType = chessType;
        var x = Math.floor(this.tag / 13);
        var y = this.tag % 13;
        this.logicChessboard[x][y] = {};
        this.logicChessboard[x][y][chessType] = player;
        this._setRule(chessType);
        var playerString;
        if (player == PLAYER.BLACK)
            playerString = "black";
        if (player == PLAYER.WHITE)
            playerString = "white";
        var img = res[playerString + chessType];
        //cc.log("________________img", player, playerString + chessType, img);
        // //cc.log(img);
        this.loadTextures(img, img, img, ccui.Widget.LOCAL_TEXTURE);
    }
});
showPromoteDialog = function (chess,killedChess,demoteStrategy) {
    if (chess.promoted)
        return; 
    var killedChessNull = false; 
    if (killedChess == undefined)
    {
      //  killedChess = new MyChess(CHESS_TYPE.QUEEN,(chess.player+1)%2,chess.logicChessboard); 
        //killedChess.setVisible(false); 
        //cc.director.getRunningScene().addChild(killedChess, -1);
        killedChess = []; 
        killedChess.chessType = CHESS_TYPE.QUEEN; 
    }
    var dialog = new PromoteDialog(chess,killedChess,demoteStrategy);
    cc.director.getRunningScene().addChild(dialog, 100);
    if (killedChessNull)
        killedChess.removeFromParent(true); 

    // chessNode = new MyChess("Queen",PLAYER.BLACK); 
    // chessNode.setAnchorPoint(0.5,0.5);
    // chessNode.setPosition(cc.winSize.width/2,cc.winSize.height/2); 
    // cc.director.getRunningScene().addChild(chessNode,1001); 
}

var PromoteDialog = cc.Layer.extend({
    chess: null,
    notifNode: null,
    BG_TAG: 0,
    LB_TAG: 1,
    BUTTON_TAG: 2,
    transparentBackground: null,
    chessNode: null,
    demoteStrategy:null, 
    ctor: function (chess,killedChess,demoteStrategy) {
        this._super();
        this.chess = chess;
        this.demoteStrategy = demoteStrategy; 
        this.notifNode = new cc.Node();
        isChessboardTouchable = false
        this.transparentBackground = new ccui.Button(res.green, res.green, res.green);
        this.transparentBackground.setScale(cc.winSize.width / this.transparentBackground.width, cc.winSize.height, this.transparentBackground.height);
        this.transparentBackground.setOpacity(100);
        this.transparentBackground.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        this.transparentBackground.setPosition(0, 0);
        this.transparentBackground.setAnchorPoint(0, 0);
        this.addChild(this.transparentBackground, 0);

        var bg = new cc.Sprite(res.notif);
        // bg.setScale(3); 
        this.notifNode.addChild(bg, 0, this.BG_TAG);
        bg.setPosition(0, 0.5);

        bg.setScale(2); 
        var lb = cc.LabelTTF.create('Promote to:', 'Arial', 16, 50, cc.TEXT_ALIGNMENT_CENTER);
        lb.setColor(new cc.Color(165, 42, 42));
        this.notifNode.addChild(lb, 1, this.LB_TAG);
        lb.setAnchorPoint(0.5, 0.5);

        this.notifNode.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);

        this.chessNode = new cc.Node();

        var i = 0;
        for (var c in CHESS_TYPE) {
            if (CHESS_TYPE.hasOwnProperty(c)) {
                if (CHESS_TYPE[c] != CHESS_TYPE.KING && CHESS_TYPE[c] != CHESS_TYPE.chess) {
                    if (CHESS_PRIORITY[chess.chessType] < CHESS_PRIORITY[[CHESS_TYPE[c]]] && 
                        CHESS_PRIORITY[killedChess.chessType] >= CHESS_PRIORITY[[CHESS_TYPE[c]]]) {
                        var tempChess = new MyChess(CHESS_TYPE[c], chess.player);
                        // //cc.log("______tempChess",tempChess,"c",c);
                        tempChess.setAnchorPoint(0.5, 0.5);
                        tempChess.setScale(2);
                        tempChess.setPosition(100 * i+50, 50);
                        tempChess.setPressedActionEnabled(true);
                        tempChess.addClickEventListener(this.onPromotionButtonClicked.bind(this, this.chess, CHESS_TYPE[c], tempChess));
                        i += 1;
                        this.chessNode.addChild(tempChess, 1);
                    }
                }
            }
        }
        this.chessNode.setContentSize(i*100, 100);
        this.notifNode.addChild(this.chessNode, 3);
        this.chessNode.setAnchorPoint(0.5, 0.5);
       

        lb.setPosition(0, this.chessNode.height/2);


        this.chessNode.setPosition(0, 0);
        this.addChild(this.notifNode);

        if (this.demoteStrategy) 
            this.demoteStrategy.showDescription(this,this.chess.chessType); 
    },
    onPromotionButtonClicked: function (chess, type, obj) {
       
        // var action0 = cc.ScaleTo(0.3, 1.1, 1.1);
        // var action1 = cc.ScaleTo(0.3, 0.99, 0.99);
        // var seq = cc.sequence(action0, action1);
        // if (seq)
        //     obj.runAction(seq);
        if (this.demoteStrategy)
            this.demoteStrategy.execute(type,chess.player); 
        chess.setType(type, chess.player);
        chess.promoted= true; 

        
        this.removeFromParent(true);
    },
    onExit: function () {
        isChessboardTouchable = true;
        this._super();
    }
})

var RollingDialog = cc.Node.extend({
    bg: null,
    button: null,
    ctor: function () {
        this.bg = new cc.Sprite(res.notif);
        this.button = new ccui.Button(res.dice, res.dice, res.dice);

        this.addChild(this.bg);
        this.addChild(this.button);

        this.bg.setAnchorPoint(0.5, 0.5);
        this.button.setAnchorPoint(0.5, 0.5);

        this.button.setPosition(0, this.bg.height / 2);
        this.setContentSize(this.bg.width, this.bg.height + this.button.height);

        this.button.addClickEventListener(this.rollDice);
    },
    rollDice: function () {

    }
})