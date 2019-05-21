var MyChess = cc.Sprite.extend({
    chessType: null,
    chessRule: null,
    ctor: function (chessType, player) {
        this._super(); 
        var playerString = "";

        // _sprite = new cc.Sprite();
        this.setType(chessType, player);
        this._setRule(chessType); 
    },
    
    _setRule: function(chessType){
        var rule = willnotKillTeammate(WesternChessRule[chessType]);
        this.chessRule = rule; 
    }, 
    setRule: function (chessRule) {
        this.chessRule = chessRule;
    },
    checkRule: function (x, y, newX, newY, logicChessboard, turn) {
        this.chessRule(x, y, newX, newY, logicChessboard, turn);
    },
    setType: function (chessType,player) {
        this.chessType = chessType;
        if (player == PLAYER.BLACK)
            playerString = "black";
        if (player == PLAYER.WHITE)
            playerString = "white";
        this.setTexture(res[playerString+chessType]); 
    }
})