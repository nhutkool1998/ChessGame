var CHESS_TYPE = {
    KING: "King",
    QUEEN: "Queen",
    KNIGHT: "Knight",
    BISHOP: "Bishop",
    PAWN: "Pawn",
    CASTLE: "Castle"
};

var CHESS_PRIORITY = {
    "Queen":5,
    "Knight": 2,
    "Bishop": 3,
    "Pawn": 1,
    "Castle": 4,
    "King": 10, 
}
var CHESS_STATE = {
    SELECTED: 0,
    NOT_SELECTED: 1
};
var SPRITE_TAG = {
    GREEN_BOX_TAG: 100
};
var PLAYER = {
    EMPTY: null,
    BLACK: 0,
    WHITE: 1
};

WesternChessRule = {};
var willnotKillTeammate = function () {
    this._checkRule = function (x, y, newX, newY, logicChessboard) {
        //cc.log("will NOT kill team mate");
        if (logicChessboard[newX][newY] == PLAYER.EMPTY)
            return true;
        var key = logicChessboard[newX][newY].color;
        var type = logicChessboard[x][y].color
        if (key != type) {
            //cc.log("will NOT kill team mate")
            return true;
        }
        //cc.log("WILL kill team mate")

        return false;
    }
}

var checkBoundary = function (x, y) {
    if (x < 1 || x > 8 || y < 1 || y > 8)
        return false;
    return true
}


WesternChessRule[CHESS_TYPE.CASTLE] = function () {
    this._checkRule = function (x, y, newX, newY, logicChessboard) {
        var isHorizontal = (x - newX) == 0;
        var isVertical = (y - newY) == 0;
        if (!isHorizontal && !isVertical)
            return false;
        if (isHorizontal) {
            var sign = (newY - y) / Math.abs(newY - y);
            // y + x*sign = newY 
            // x*sign = newY -y
            for (var i = y + sign; i > 0 && i < 9 && i != newY; i += sign) {
                //cc.log("horizontal", x, i);
                if (logicChessboard[x][i] != PLAYER.EMPTY)
                    return false;
            }
        }
        if (isVertical) {
            var sign = x < newX ? 1 : -1;
            for (var i = x + sign; i > 0 && i < 9 && i != newX; i += sign) {
                //cc.log("vertical", i, y, logicChessboard[i][y]);

                if (logicChessboard[i][y] != PLAYER.EMPTY)
                    return false;
            }
        }
        return true;
    }
}


WesternChessRule[CHESS_TYPE.KNIGHT] = function () {
    this._checkRule = function (x, y, newX, newY, logicChessboard) {
        var deltaX = Math.abs(x - newX);
        var deltaY = Math.abs(y - newY);
        var isValidKnightMove = function (deltaX, deltaY) {
            if (deltaX == 2 && deltaY == 1)
                return true;
            if (deltaX == 1 && deltaY == 2)
                return true;
            return false;
        }
        if (!checkBoundary(newX, newY))
            return false
        return isValidKnightMove(deltaX, deltaY);
    }
}

WesternChessRule[CHESS_TYPE.BISHOP] = function () {
    this._checkRule = function (x, y, newX, newY, logicChessboard) {
        if (!checkBoundary(newX, newY))
            return false;
        var isCrossline = Math.abs(x - newX) == Math.abs(y - newY);
        if (!isCrossline)
            return false;
        var signX = (newX - x) / Math.abs(x - newX);
        var signY = (newY - y) / Math.abs(y - newY);
        var curX, curY;
        for (var i = 1; i <= 8; ++i) {
            curX = x + signX * i;
            curY = y + signY * i;
            if (!checkBoundary(curX, curY))
                break;
            if (curX == newX || curY == newY)
                break;
            if (logicChessboard[curX][curY] != PLAYER.EMPTY)
                return false;
        }
        return true;
    }
}

WesternChessRule[CHESS_TYPE.KING] = function () {
    this._checkRule = function (x, y, newX, newY, logicChessboard) {
        if (Math.abs(x - newX) > 1 || Math.abs(y - newY) > 1) {
            return false;
        }
        if (!checkBoundary(newX, newY))
            return false;
        return true;
    }
}

WesternChessRule[CHESS_TYPE.QUEEN] = function () {
    this._checkRule = function (x, y, newX, newY, logicChessboard) {
        return (new WesternChessRule[CHESS_TYPE.CASTLE]()._checkRule(x, y, newX, newY, logicChessboard) ||
            new WesternChessRule[CHESS_TYPE.BISHOP]()._checkRule(x, y, newX, newY, logicChessboard))
    }
};

WesternChessRule[CHESS_TYPE.PAWN] = function () {
    // this.
    this._checkRule = function (x, y, newX, newY, logicChessboard, turn, chessObject) {
        __checkRule = function (x, y, newX, newY, logicChessboard, turn, chessObject) {
            //cc.log("x,y,newX,newY", x, y, newX, newY);
            var deltaX, deltaY;
            deltaX = Math.abs(newX - x);
            deltaY = Math.abs(newY - y);
            //pawn cannot go backward 
            var player = turn % 2;
            if (player == PLAYER.WHITE) {
                //cc.log("cannot go backward - white")
                if (newX > x)
                    return false;
            }
            if (player == PLAYER.BLACK) {
                //cc.log("cannot go backward check - black")
                if (newX < x) {
                    //cc.log("cannot go backward - black")
                    return false;
                }
            }

            //if can kill, then crossline is ok¡
            // var chessTypeAtDestination = Object.keys(logicChessboard[newX][newY])[0];

            // var chessTypeAtDestination = logicChessboard[newX][newY] == null? null : logicChessboard[newX][newY].type; 
            if (deltaX == 1 && Math.abs(deltaY) == 1) {
                var oppositePlayer = (turn + 1) % 2; 
                if (logicChessboard[newX][newY].color== oppositePlayer)
                    return true;
            }
            //if cannot kill and the position is occupied, then return false; 
            if (logicChessboard[newX][newY] != PLAYER.EMPTY) {
             
                return false;
            }

            var firstTurn = false;
            if (turn % 2 == PLAYER.WHITE && x == 7) {
                firstTurn = true;
            }
            if (turn % 2 == PLAYER.BLACK && x == 2) {
                firstTurn = true;
            }
            if (firstTurn) {
                //cc.log("deltaY", deltaY, "deltaX", deltaX)
                if (deltaY != 0)
                    return false;
                if (deltaX > 2) {
                    //cc.log("deltaX > 2")
                    return false;
                }
            } else {
                if (deltaY > 0 || deltaX > 1)
                    return false;
            }
            return true;
        }
        var result = __checkRule(x, y, newX, newY, logicChessboard, turn, chessObject, chessObject);
        if (result) {
            if (newX == 1 || newX == 8 && chessObject != null)
                showPromoteDialog(chessObject);
        }
        return result;
    }
}

