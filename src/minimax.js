// reference :
// https://www.freecodecamp.org/news/simple-chess-ai-step-by-step-1d55a9266977/

//var move = {
//    color: ,
//    from: ,
//    to: ,
//    flags: ,
//    type:
//};

var GameLogic = {};
GameLogic.setBoard = function (board) { // lấy bàn cờ 8x8, ô trống bằng null, ô có cờ: {type: , color: }
    this.board = {};
    for (var i = 1; i <= 8; ++i) {
        this.board[i] = {}
        for (var j = 1; j <= 8; ++j) {
            this.board[i][j] = null;
        }
    }
    var putChess = function (point, type, color) {
        GameLogic[point.x][point.y] = {};
        GameLogic.board[point.x][point.y].type = type;
        GameLogic.board[point.x][point.y].color = color;
    }
    putChess(cc.p(8, 1), CHESS_TYPE.CASTLE, PLAYER.WHITE);
    putChess(cc.p(8, 8), CHESS_TYPE.CASTLE, PLAYER.WHITE);

    putChess(cc.p(8, 2), CHESS_TYPE.KNIGHT, PLAYER.WHITE);
    putChess(cc.p(8, 7), CHESS_TYPE.KNIGHT, PLAYER.WHITE);

    putChess(cc.p(8, 3), CHESS_TYPE.BISHOP, PLAYER.WHITE);
    putChess(cc.p(8, 6), CHESS_TYPE.BISHOP, PLAYER.WHITE);

    putChess(cc.p(8, 4), CHESS_TYPE.QUEEN, PLAYER.WHITE);
    putChess(cc.p(8, 5), CHESS_TYPE.KING, PLAYER.WHITE);

    //add pawns

    for (var i = 1; i <= 8; ++i) {
        putChess(cc.p(7, i), CHESS_TYPE.PAWN, PLAYER.WHITE);
        putChess(cc.p(2, i), CHESS_TYPE.PAWN, PLAYER.BLACK);
    }

    putChess(cc.p(1, 1), CHESS_TYPE.CASTLE, PLAYER.BLACK);
    putChess(cc.p(1, 8), CHESS_TYPE.CASTLE, PLAYER.BLACK);

    putChess(cc.p(1, 2), CHESS_TYPE.KNIGHT, PLAYER.BLACK);
    putChess(cc.p(1, 7), CHESS_TYPE.KNIGHT, PLAYER.BLACK);

    putChess(cc.p(1, 3), CHESS_TYPE.BISHOP, PLAYER.BLACK);
    putChess(cc.p(1, 6), CHESS_TYPE.BISHOP, PLAYER.BLACK);

    putChess(cc.p(1, 4), CHESS_TYPE.QUEEN, PLAYER.BLACK);
    putChess(cc.p(1, 5), CHESS_TYPE.KING, PLAYER.BLACK);
};
GameLogic.userMove = function (x, y, newX, newY) {
    //TODO: user perform move from (x,y) to (newX,newY)
    this.board[newX][newY].type = this.board[x][y].type;
    this.board[newX][newY].color = this.board[x][y].color;
    this.board[x][y] = null;
};
//for promote or demote
GameLogic.setType = function (x, y, newType) {
    this.board[x][y].type = newType;
}; 

GameLogic.getPossibleMoves = function () { // trả về 1 array các bước đi có thể đi được của tất cả các quân cờ đang nằm trên bàn cờ với format giống var move ở trên.
    var moves = []; 
    for (var i = 1; i <=8;++i){
        for (var j = 1; j <=8;++j){
            var chess = ChessboardGUIInstance.getChessAtChessboardPosition(i,j); 
            if (chess != null)  
                moves.push(MoveRecom[chess.chessType]()); 
        }
    }
    return null;
};
GameLogic.tryMove = function (move) { // move giả trên logic của bàn cờ
    return null;
};
GameLogic.undo = function () { // undo bước move giả vừa rồi
    return null;
};
GameLogic.getBoard = function () {
    return this.board;
};
GameLogic.evaluate = function () {
    var ans = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            ans += this.getValue(this.board[i][j], i, j);
        }
    }
    return ans;
};
GameLogic.getValue = function (aChess, x, y) {
    if (aChess == null) {
        return 0;
    }

};


var minimax = function (depth, gameLogic, getMax) {
    var possibleMoves = gameLogic.getPossibleMoves();
    var bestMoveVal = -9999;
    var bestMove;
    for (var i = 0; i < possibleMoves.length; i++) {
        var move = possibleMoves[i];
        gameLogic.tryMove(move); //
        var value = minimaxAB(depth - 1, gameLogic, -10000, 10000, !getMax); // init alpha = -10^4, beta = 10^4
        gameLogic.undo();
        if (value > bestMoveVal) {
            bestMoveVal = value;
            bestMove = move;
        }
    }
    return bestMove;
};
// alpha beta pruning
var minimaxAB = function (depth, gameLogic, alpha, beta, getMax) {
    if (depth === 0) {
        return -gameLogic.evaluate();
    }
    var possibleMoves = gameLogic.getPossibleMoves();
    if (getMax == true) { // max
        var bestMoveVal = -9999;
        for (var i = 0; i < possibleMoves.length; i++) {
            gameLogic.tryMove(possibleMoves[i]);
            bestMoveVal = Math.max(bestMoveVal, minimaxAB(depth - 1, gameLogic, alpha, beta, !getMax)); // min
            gameLogic.undo();
            alpha = Math.max(alpha, bestMoveVal);
            if (beta <= alpha) {
                return bestMoveVal;
            }
        }
        return bestMoveVal;
    } else { // min
        var bestMoveVal = 9999;
        for (var i = 0; i < possibleMoves.length; i++) {
            gameLogic.tryMove(possibleMoves[i]);
            bestMoveVal = Math.min(bestMoveVal, minimaxAB(depth - 1, gameLogic, alpha, beta, !getMax)); // max
            gameLogic.undo();
            beta = Math.min(beta, bestMoveVal);
            if (beta <= alpha) {
                return bestMoveVal;
            }
        }
        return bestMoveVal;
    }
};
var reverseH = function (heuristic) {
    return heuristic.slice().reverse();
};
var eval = {
    pawn: [],
    knight: [],
    bishop: [],
    rook: [],
    queen: [],
    king: []
};
eval.pawn.push([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [1, 1, 2, 3, 3, 2, 1, 1],
    [.5, .5, 1, 2.5, 2.5, 1, .5, .5],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [.5, -.5, -1, 0, 0, -1, -.5, .5],
    [.5, 1, 1, -2, -2, 1, 1, .5],
    [0, 0, 0, 0, 0, 0, 0, 0]
]), eval.pawn.push(reverseH(eval.pawn[0])), eval.knight.push([
    [-5, -4, -3, -3, -3, -3, -4, -5],
    [-4, -2, 0, 0, 0, 0, -2, -4],
    [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
    [-3, .5, 1.5, 2, 2, 1.5, .5, -3],
    [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
    [-3, .5, 1, 1.5, 1.5, 1, .5, -3],
    [-4, -2, 0, .5, .5, 0, -2, -4],
    [-5, -4, -3, -3, -3, -3, -4, -5]
]), eval.knight.push(eval.knight[0]), eval.bishop.push([
    [-2, -1, -1, -1, -1, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, .5, 1, 1, .5, 0, -1],
    [-1, .5, .5, 1, 1, .5, .5, -1],
    [-1, 0, 1, 1, 1, 1, 0, -1],
    [-1, 1, 1, 1, 1, 1, 1, -1],
    [-1, .5, 0, 0, 0, 0, .5, -1],
    [-2, -1, -1, -1, -1, -1, -1, -2]
]), eval.bishop.push(reverseH(eval.bishop[0])), eval.rook.push([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [.5, 1, 1, 1, 1, 1, 1, .5],
    [-.5, 0, 0, 0, 0, 0, 0, -.5],
    [-.5, 0, 0, 0, 0, 0, 0, -.5],
    [-.5, 0, 0, 0, 0, 0, 0, -.5],
    [-.5, 0, 0, 0, 0, 0, 0, -.5],
    [-.5, 0, 0, 0, 0, 0, 0, -.5],
    [0, 0, 0, .5, .5, 0, 0, 0]
]), eval.rook.push(reverseH(eval.rook[0])), eval.queen.push([
    [-2, -1, -1, -.5, -.5, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, .5, .5, .5, .5, 0, -1],
    [-.5, 0, .5, .5, .5, .5, 0, -.5],
    [0, 0, .5, .5, .5, .5, 0, -.5],
    [-1, .5, .5, .5, .5, .5, 0, -1],
    [-1, 0, .5, 0, 0, 0, 0, -1],
    [-2, -1, -1, -.5, -.5, -1, -1, -2]
]), eval.queen.push(eval.queen[0]), eval.king.push([
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-2, -3, -3, -4, -4, -3, -3, -2],
    [-1, -2, -2, -2, -2, -2, -2, -1],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 3, 1, 0, 0, 1, 3, 2]
]), eval.king.push(reverseH(eval.king[0]));