_CheckChessRules = {}; 
WestenChess = {
    _CheckChessRules: null,
    CheckChessRules: function (x, y, newX, newY, type, logicChessboard) {
        if (!_CheckChessRules.hasOwnProperty(type))
            return true; 
        return _CheckChessRules[type](x, y, newX, newY, logicChessboard);
    },
    
}

_CheckChessRules[CHESS_TYPE.CASTLE] = function(x, y, newX, newY, logicChessboard){
    var isHorizontal = (x - newX) == 0; 
    var isVertical = (y - newY) == 0; 
    if (!isHorizontal && !isVertical)
        return false; 
    if (isHorizontal){
        var sign = y < newY? 1 : -1; 
        for (var i = y; i > 0 && i <9 && i != newY; i + sign){
            if (logicChessboard[x][i] != -1)
                return false; 
        }
    }
    if (isVertical){
        var sign = x < newX? 1 : -1; 
        for (var i = x; x > 0 && x <9 && x != newX; i + sign){
            if (logicChessboard[i][y] != 0)
                return false; 
        }
    }
    return true; 
}