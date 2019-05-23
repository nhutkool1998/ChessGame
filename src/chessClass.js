var MyChess = ccui.Button.extend({
    chessType: null,
    chessRule: null,
    player:null,
    logicChessboard:null,
    ctor: function (chessType, player,logicChessboard) {
        var playerString; 
        if (logicChessboard != null) 
            this.logicChessboard = logicChessboard;
        if (player == PLAYER.BLACK)
            playerString = "black";
        if (player == PLAYER.WHITE)
            playerString = "white";
        var img = res[playerString + chessType];
        this._super();
        this.loadTextures(img,img,img); 
        var playerString = "";
        this.player = player; 
        // _sprite = new cc.Sprite();
        this.setPressedActionEnabled(true); 

        cc.log("__________~~~~~~~~______img",img);

        // this.setType(chessType, player);
        this._setRule(chessType);
    },

    _setRule: function (chessType) {
        var rule = function (x, y, newX, newY, logicChessboard, turn) {
            var res1 = new willnotKillTeammate()._checkRule.bind(willnotKillTeammate, x,y,newX,newY,logicChessboard,turn)();
            var rule2 = new WesternChessRule[chessType](); 
            var res2 = rule2._checkRule.bind(WesternChessRule[chessType], x,y,newX,newY,logicChessboard,turn,this)();
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
    setType: function (chessType, player) {
        this.chessType = chessType;
        var x = Math.floor(this.tag/13); 
        var y = this.tag%13; 
        this.logicChessboard[x][y] = {}; 
        this.logicChessboard[x][y][chessType] = player; 
        this._setRule(chessType);
        var playerString; 
        if (player == PLAYER.BLACK)
            playerString = "black";
        if (player == PLAYER.WHITE)
            playerString = "white";
        var img = res[playerString + chessType];
        cc.log("________________img",img);
        // cc.log(img);
        this.loadTextures(img,img,img);
    }
}); 
showPromoteDialog = function(pawn){
    var dialog = new PromoteDialog(pawn); 
    cc.director.getRunningScene().addChild(dialog,100); 
    // chessNode = new MyChess("Queen",PLAYER.BLACK); 
    // chessNode.setAnchorPoint(0.5,0.5);
    // chessNode.setPosition(cc.winSize.width/2,cc.winSize.height/2); 
    // cc.director.getRunningScene().addChild(chessNode,1001); 
}

var PromoteDialog = cc.Layer.extend({
    pawn:null, 
    notifNode: null, 
    BG_TAG:0,
    LB_TAG:1, 
    BUTTON_TAG:2, 
    transparentBackground:null, 
    chessNode:null, 
    ctor: function(pawn){
        this._super(); 
        this.pawn = pawn; 
        this.notifNode = new cc.Node(); 
        isChessboardTouchable = false
        this.transparentBackground = new ccui.Button(res.green,res.green,res.green); 
        this.transparentBackground.setScale(cc.winSize.width/this.transparentBackground.width,cc.winSize.height,this.transparentBackground.height);
        this.transparentBackground.setOpacity(100);
        this.transparentBackground.setPosition(cc.winSize.width/2,cc.winSize.height/2); 
        this.transparentBackground.setPosition(0,0);
        this.transparentBackground.setAnchorPoint(0,0); 
        this.addChild(this.transparentBackground,0);

        var bg = new cc.Sprite(res.notif); 
        // bg.setScale(3); 
        this.notifNode.addChild(bg,0,this.BG_TAG); 
        bg.setPosition(0,0); 
        var lb =  cc.LabelTTF.create('Promote to:',  'Arial', 16, bg.getContentSize(), cc.TEXT_ALIGNMENT_CENTER);
        lb.setPosition(0,30); 
        lb.setColor(new cc.Color(165,42,42)); 
        this.notifNode.addChild(lb,1,this.LB_TAG); 
        lb.setAnchorPoint(0.5,0.5); 

        this.notifNode.setPosition(cc.winSize.width/2,cc.winSize.height/2); 

        this.chessNode = new cc.Node(); 

        var i = 0; 
        for (var c in CHESS_TYPE){
            if (CHESS_TYPE.hasOwnProperty(c)){
                if (CHESS_TYPE[c] != CHESS_TYPE.KING &&  CHESS_TYPE[c] != CHESS_TYPE.PAWN){
                    var tempChess = new MyChess(CHESS_TYPE[c],pawn.player); 
                    // cc.log("______tempChess",tempChess,"c",c);
                    tempChess.setAnchorPoint(0,0);
                    tempChess.setScale(2); 
                    tempChess.setPosition(100*i,0); 
                    tempChess.setPressedActionEnabled(true); 
                    tempChess.addClickEventListener(this.onPromotionButtonClicked.bind(this,this.pawn,CHESS_TYPE[c],tempChess));
                    i+=1; 
                    this.chessNode.addChild(tempChess,1); 
                }
            }
        }
        this.chessNode.setContentSize(400,100); 
        this.notifNode.addChild(this.chessNode,3); 
        this.chessNode.setAnchorPoint(0.5,0.5);
        // this.chessNode.setPosition(cc.winSize.width/2,cc.winSize.height/2); 
        // cc.director.getRunningScene().addChild(this.chessNode,1001); 
        this.chessNode.setPosition(0,0); 
        this.addChild(this.notifNode); 
    },
    onPromotionButtonClicked: function(pawn,type,obj){
        // var p = pawn.getPosition(); 
        // var parent = pawn.getParent();
        // var newChess = new MyChess(type,pawn.player); 
        // pawn.removeFromParent(true); 
        // newChess.setPosition(p); 
        // parent.addChild(newChess,1); 
        var action0 = cc.ScaleTo(0.3, 1.1, 1.1);
        var action1 = cc.ScaleTo(0.3, 0.99, 0.99);
        var seq = cc.Sequence(action0,action1); 
        if (seq) 
            obj.runAction(seq);
        pawn.setType(type,pawn.player);
        this.removeFromParent(true); 
    },
    onExit: function(){
        isChessboardTouchable = true;
        this._super(); 
    }
})