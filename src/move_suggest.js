var MoveRecom = {}; 

MoveRecom.getPossibleMove= function(x,y,chessType,logicChessboard){
    delta = MoveRecom.getDeltas[type]();  
    var turn = ChessboardGUIInstance.turn; 
    var result = []; 
    for (var i = 0; i <delta.length;++i){
        var newX = x+ delta[i].x; 
        var newY = y + delta[i].y; 
        var res1 = new willnotKillTeammate()._checkRule.bind(willnotKillTeammate, x, y, newX, newY, logicChessboard, turn)();
        var rule2 = new WesternChessRule[chessType]();
        var res2 = rule2._checkRule.bind(WesternChessRule[chessType], x, y, newX, newY, logicChessboard, turn)();
        if (res1 && res2) {
            result.push(cc.p(newX,newY));
        }

    }
}
MoveRecom.getDeltas[CHESS_TYPE.PAWN] = function(){
    var dx = [1,2,-1,-2];
    var res = [];  
    for (var i = 0; i < dx.length;++i){
        var temp = {}; 
        temp.x = dx[i]; 
        temp.y = 0; 
        res.push(temp); 
    }
    return res; 
}

MoveRecom.getDeltas[CHESS_TYPE.KING] = function(){
    var dx = [1,-1,0];
    var dy = [1,-1,0]; 
    var res = [];  
    for (var i = 0; i < dx.length;++i){
        for (var j = 0; j < dy.length;++j){
            if (dx != 0 && dy != 0)
            {
            var temp = {}; 
            temp.x = dx[i]; 
            temp.y = dy[i]; 
            res.push(temp); 
            }
        }
       
    }
    return res; 
} 

MoveRecom.getDeltas[CHESS_TYPE.CASTLE] = function(){
    var dx = [1,2,3,4,5,6,7,8];
    var dx = [1,2,3,4,5,6,7,8];
    var res = [];  
    for (var i = 0; i < dx.length;++i){
        var temp = {}; 
        temp.x = dx[i]; 
        temp.y = 0; 
        res.push(temp); 
    }

    for (var i = 0; i < dy.length;++i){
        var temp = {}; 
        temp.y = dy[i]; 
        temp.x = 0; 
        res.push(temp); 
    }

    for (var i = 0; i < dx.length;++i){
        var temp = {}; 
        temp.x = -dx[i]; 
        temp.y = 0; 
        res.push(temp); 
    }

    for (var i = 0; i < dy.length;++i){
        var temp = {}; 
        temp.y = -dy[i]; 
        temp.x = 0; 
        res.push(temp); 
    }
    return res; 
}

MoveRecom.getDeltas[CHESS_TYPE.BISHOP] = function(){
    var dx = [1,2,3,4,5,6,7,8];
    var res = [];  
    for (var i = 0; i < dx.length;++i){
        var temp = {}; 
        temp.x = dx[i]; 
        temp.y = dx[i]; 
        res.push(temp); 
    }

    for (var i = 0; i < dx.length;++i){
        var temp = {}; 
        temp.x = -dx[i]; 
        temp.y = dx[i]; 
        res.push(temp); 
    }

    for (var i = 0; i < dx.length;++i){
        var temp = {}; 
        temp.x = dx[i]; 
        temp.y = -dx[i]; 
        res.push(temp); 
    }

    for (var i = 0; i < dx.length;++i){
        var temp = {}; 
        temp.x = -dx[i]; 
        temp.y = -dx[i]; 
        res.push(temp); 
    }

    return res; 
}

MoveRecom[CHESS_TYPE.QUEEN] = function(){
    var res1 = MoveRecom[CHESS_TYPE.CASTLE]; 
    var res2 = MoveRecom[CHESS_TYPE.BISHOP]; 
    return (res1.concat(res2)); 
}