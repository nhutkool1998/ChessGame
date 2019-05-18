
 var CHESS_TYPE = {
    KING: "KING",
    QUEEN: "QUEEN",
    KNIGHT: "KNIGHT",
    BISHOP: "BISHOP",
    PAWN: "PAWN",
    CASTLE: "CASTLE"
 };
var CHESS_STATE = {
    SELECTED: 0,
    NOT_SELECTED: 1
 };
 var SPRITE_TAG = {
    GREEN_BOX_TAG: 100
 };
 var PLAYER = {
    EMPTY:-1,
    BLACK: 0,
    WHITE: 1
 }; 

_CheckChessRules = {}; 
WesternChess = {
    _CheckChessRules: null,
    canKillTeammate: function(x,y,newX,newY,type,logicChessboard){
        if (logicChessboard[newX][newY] == PLAYER.EMPTY)
            return false; 
        var key = Object.keys(logicChessboard[newX][newY])[0]; 
        if (logicChessboard[x][y][type] == logicChessboard[newX][newY][key])
            return true;
        return false; 
    }, 
    CheckChessRules: function (x, y, newX, newY, type, logicChessboard,turn) {
        if (!_CheckChessRules.hasOwnProperty(type))
            return true; 
        if (this.canKillTeammate(x,y,newX,newY,type,logicChessboard))
            return false; 
        return _CheckChessRules[type](x, y, newX, newY, logicChessboard,turn);
    },
}

var checkBoundary = function(x,y){
    if (x < 1 || x > 8 || y < 1 || y > 8) 
        return false;
    return true
}

_CheckChessRules[CHESS_TYPE.CASTLE] = function(x, y, newX, newY, logicChessboard){
    var isHorizontal = (x - newX) == 0; 
    var isVertical = (y - newY) == 0; 
    if (!isHorizontal && !isVertical)
        return false; 
    if (isHorizontal){
        var sign = y < newY? 1 : -1; 
        for (var i = y; i > 0 && i <9 && i != newY; i + sign){
            if (logicChessboard[x][i] != PLAYER.EMPTY)
                return false; 
        }
    }
    if (isVertical){
        var sign = x < newX? 1 : -1; 
        for (var i = x; x > 0 && x <9 && x != newX; i + sign){
            if (logicChessboard[i][y] != PLAYER.EMPTY)
                return false; 
        }
    }
    return true; 
}


_CheckChessRules[CHESS_TYPE.KNIGHT] = function(x, y, newX, newY, logicChessboard){
    var deltaX = Math.abs(x-newX); 
    var deltaY = Math.abs(y-newY); 
    var isValidKnightMove = function(deltaX,deltaY){
        if (deltaX == 2 && deltaY == 1)
            return true; 
        if (deltaX == 1 && deltaY ==2)
            return true;
        return false; 
    }
    if (!checkBoundary(newX,newY))
        return false
    return isValidKnightMove(deltaX,deltaY); 
}

_CheckChessRules[CHESS_TYPE.BISHOP] = function(x, y, newX, newY, logicChessboard){
    if (!checkBoundary(newX,newY))
        return false; 
    var isCrossline = Math.abs(x - newX) == Math.abs(y - newY); 
    if (!isCrossline)
        return false;
    var signX = (newX-x)/Math.abs(x-newX); 
    var signY = (newY - y)/Math.abs(y-newY); 
    var curX,curY; 
    for (var i = 1; i <=8;++i){
        curX = x + signX*i; 
        curY = y + signY*i; 
        if (!checkBoundary(curX,curY))
            break; 
        if (curX == newX || curY == newY)
            break; 
        if (logicChessboard[i][y] != PLAYER.EMPTY)
            return false; 
    }
    return true; 
}

_CheckChessRules[CHESS_TYPE.KING] = function(x,y,newX,newY,logicChessboard){
    if (Math.abs(x-newX) > 1 || Math.abs(y-newY) >1){
        return false; 
    }
    if (!checkBoundary(newX,newY))
        return false; 
    return true; 
}

_CheckChessRules[CHESS_TYPE.QUEEN] = function(x,y,newX,newY,logicChessboard){
    return (_CheckChessRules[CHESS_TYPE.CASTLE](x,y,newX,newY,logicChessboard)
                || _CheckChessRules[CHESS_TYPE.BISHOP](x,y,newX,newY,logicChessboard))
}

_CheckChessRules[CHESS_TYPE.PAWN] = function(x,y,newX,newY,logicChessboard,turn){
    cc.log("x,y,newX,newY",x,y,newX,newY); 
    var deltaX,deltaY; 
    deltaX = Math.abs(newX -x); 
    deltaY = Math.abs(newY - y); 
    
    //if can kill 
    if (deltaX == 1 && Math.abs(deltaY) ==1){
        var oppositePlayer = (turn+1)%2
        if (logicChessboard[newX][newY][CHESS_TYPE.PAWN] == oppositePlayer)
            return true; 
    }
    //if cannot kill and the position is occupied, then return false; 
    if (logicChessboard[newX][newY] != PLAYER.EMPTY)
    {
        // cc.log(the )
        return false; 
    }

    var firstTurn = false; 
    if (turn%2 == PLAYER.WHITE && x == 7){
        firstTurn = true;
    }
    if (turn%2 == PLAYER.BLACK && x == 2){
        firstTurn = true; 
    }
    if (firstTurn){
        if (deltaY != 0)
            return false; 
        if (deltaX > 2)
            return false; 
    }
    else {
        if (deltaY > 0 || deltaX > 1)
            return false; 
    }
    return true; 
}