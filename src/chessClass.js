var MyChess = cc.Sprite.extend({
    chessType: null,
    chessRule: null,
    ctor: function (chessType, player) {
        var playerString; 
        if (player == PLAYER.BLACK)
            playerString = "black";
        if (player == PLAYER.WHITE)
            playerString = "white";
        var img = res[playerString + chessType];
        this._super(img);
        var playerString = "";

        // _sprite = new cc.Sprite();
        // this.setType(chessType, player);
        this._setRule(chessType);
    },

    _setRule: function (chessType) {
        var rule = function (x, y, newX, newY, logicChessboard, turn) {
            var res1 = willnotKillTeammate._checkRule.bind(willnotKillTeammate, x,y,newX,newY,logicChessboard,turn)();
            var rule2 = new WesternChessRule[chessType](); 
            var res2 = rule2._checkRule.bind(WesternChessRule[chessType], x,y,newX,newY,logicChessboard,turn)();
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
        if (player == PLAYER.BLACK)
            playerString = "black";
        if (player == PLAYER.WHITE)
            playerString = "white";
        var img = res[playerString + chessType];
        cc.log(img);
        this.setTexture(img);
    }
})