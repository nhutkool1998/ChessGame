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
var DEFAULT_DEPTH = 3;

var PLAYER = PLAYER || {
    EMPTY: null,
    BLACK: 0,
    WHITE: 1
};
GameLogic.setBoard = function (board) { // lấy bàn cờ 8x8, ô trống bằng null, ô có cờ: {type: , color: }
    GameLogic.board = {};
    for (var i = 1; i <= 8; ++i) {
        GameLogic.board[i] = {}
        for (var j = 1; j <= 8; ++j) {
            GameLogic.board[i][j] = null;
        }
    }
    var putChess = function (point, type, color) {
        GameLogic.board[point.x][point.y] = {};
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
    // cc.log(GameLogic.board[x][y],x,y,newX,newY); 
    // GameLogic.board[newX] = 
    GameLogic.board[newX][newY] = {};

    GameLogic.board[newX][newY].type = GameLogic.board[x][y].type;
    GameLogic.board[newX][newY].color = GameLogic.board[x][y].color;
    GameLogic.board[x][y] = null;
};
//for promote or demote
GameLogic.setType = function (x, y, newType) {
    GameLogic.board[x][y].type = newType;
};

GameLogic.getPossibleMoves = function () { // trả về 1 array các bước đi có thể đi được của tất cả các quân cờ đang nằm trên bàn cờ với format giống var move ở trên.
    var moves = [];
    for (var i = 1; i <= 8; ++i) {
        for (var j = 1; j <= 8; ++j) {
            // var chess = ChessboardGUIInstance.getChessAtChessboardPosition(i, j);
            var chess = GameLogic.board[i][j];
            if (chess != null) {
                // moves.push(MoveRecom[chess.chessType](i,j,GameLogic.board)); 
                var desArray = MoveRecom.getPossibleMove(i, j, chess.type, GameLogic.board);
                for (var t = 0; t < desArray.length; ++t) {
                    var move = {};
                    move.from = cc.p(i, j);
                    move.to = desArray[t];
                    move.color = chess.color;
                    move.type = chess.type;

                    moves.push(move);
                }
            }
        }
    }
    return moves;
};
GameLogic.tryMove = function (move) { // move giả trên logic của bàn cờ
    // GameLogic.preMoveBoard = GameLogic.board.splice(0);
    var savedMove = {};
    if (GameLogic.board[move.to.x][move.to.y] != null) {
        savedMove.board = {}
        savedMove.board.type = GameLogic.board[move.to.x][move.to.y].type;
        savedMove.board.color = GameLogic.board[move.to.x][move.to.y].color;
    } else
        savedMove.board = null;
    savedMove.move = move;
    GameLogic.userMove(move.from.x, move.from.y, move.to.x, move.to.y);
    return savedMove;
};
GameLogic.undo = function (savedMove,move) { // undo bước move giả vừa rồi
    // GameLogic.board = GameLogic.preMoveBoard.splice(0);
    // GameLogic.savedMove = GameLogic.board[move.to.x][move.to.y];
    // var move = GameLogic.savedMove.move;
    GameLogic.board[move.to.x][move.to.y] = savedMove.board;

    if (savedMove.board != null) {
        GameLogic.board[move.to.x][move.to.y] = {};
        GameLogic.board[move.to.x][move.to.y].type = savedMove.board.type;
        GameLogic.board[move.to.x][move.to.y].color = savedMove.board.color;
    } else
        GameLogic.board[move.to.x][move.to.y] = null;

    GameLogic.board[move.from.x][move.from.y] = {};
    GameLogic.board[move.from.x][move.from.y].type = move.type;
    GameLogic.board[move.from.x][move.from.y].color = move.color;
    // cc.log("undo move: ",move); 

};
GameLogic.getBoard = function () {
    return GameLogic.board;
};
GameLogic.evaluate = function () {
    var ans = 0;
    for (var i = 1; i <= 8; i++) {
        for (var j = 1; j <= 8; j++) {
            ans += this.getValue(GameLogic.board[i][j], i - 1, j - 1);
        }
    }
    return ans;
};
// GameLogic.getValue = function (aChess, x, y) {
GameLogic.getValue = function (piece, x, y) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece, isBlack, x, y) {
        if (piece.type === CHESS_TYPE.PAWN) {
            return 10 + (isBlack ? evalArray.pawn[PLAYER.BLACK][y][x] : evalArray.pawn[PLAYER.WHITE][y][x]);
        } else if (piece.type === CHESS_TYPE.CASTLE) {
            return 50 + (isBlack ? evalArray.rook[PLAYER.BLACK][y][x] : evalArray.rook[PLAYER.WHITE][y][x]);
        } else if (piece.type === CHESS_TYPE.KNIGHT) {
            return 30 + evalArray.knight[PLAYER.BLACK][y][x];
        } else if (piece.type === CHESS_TYPE.BISHOP) {
            return 30 + (isBlack ? evalArray.bishop[PLAYER.BLACK][y][x] : evalArray.bishop[PLAYER.WHITE][y][x]);
        } else if (piece.type === CHESS_TYPE.QUEEN) {
            return 90 + evalArray.queen[PLAYER.BLACK][y][x];
        } else if (piece.type === CHESS_TYPE.KING) {
            return 900 + (isBlack ? evalArray.king[PLAYER.BLACK][y][x] : evalArray.king[PLAYER.WHITE][y][x]);
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece, piece.color === PLAYER.BLACK, x, y);
    return piece.color === PLAYER.WHITE ? absoluteValue : -absoluteValue;
};
// };


var minimax = function (depth, gameLogic, getMax) {
    var possibleMoves = gameLogic.getPossibleMoves();
    var bestMoveVal = -9999;
    var bestMove;
    for (var i = 0; i < possibleMoves.length; i++) {
        var move = possibleMoves[i];
        var savedMove = gameLogic.tryMove(move); //
        var value = minimaxAB(depth - 1, gameLogic, -10000, 10000, !getMax); // init alpha = -10^4, beta = 10^4
        gameLogic.undo(savedMove,move);
        if (value > bestMoveVal) {
            bestMoveVal = value;
            bestMove = move;
        }
    }
    return bestMove;
};
// alpha beta pruning
var minimaxAB = function (depth, gameLogic, alpha, beta, getMax) {
    // cc.log("minimaxAB");
    if (depth === 0) {
        return -gameLogic.evaluate();
    }
    var possibleMoves = gameLogic.getPossibleMoves();
    if (getMax == true) { // max
        var bestMoveVal = -9999;
        for (var i = 0; i < possibleMoves.length; i++) {
            var savedMove = gameLogic.tryMove(possibleMoves[i]);
            bestMoveVal = Math.max(bestMoveVal, minimaxAB(depth - 1, gameLogic, alpha, beta, !getMax)); // min
            gameLogic.undo(savedMove,possibleMoves[i]);
            alpha = Math.max(alpha, bestMoveVal);
            if (beta <= alpha) {
                return bestMoveVal;
            }
        }
        return bestMoveVal;
    } else { // min
        var bestMoveVal = 9999;
        for (var i = 0; i < possibleMoves.length; i++) {
            var savedMove = gameLogic.tryMove(possibleMoves[i]);
            bestMoveVal = Math.min(bestMoveVal, minimaxAB(depth - 1, gameLogic, alpha, beta, !getMax)); // max
            gameLogic.undo(savedMove,possibleMoves[i]);
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
var evalArray = {
    pawn: [],
    knight: [],
    bishop: [],
    rook: [],
    queen: [],
    king: []
};
evalArray.pawn.push([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [1, 1, 2, 3, 3, 2, 1, 1],
    [.5, .5, 1, 2.5, 2.5, 1, .5, .5],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [.5, -.5, -1, 0, 0, -1, -.5, .5],
    [.5, 1, 1, -2, -2, 1, 1, .5],
    [0, 0, 0, 0, 0, 0, 0, 0]
]);
evalArray.pawn.unshift(reverseH(evalArray.pawn[0]));
evalArray.knight.push([
    [-5, -4, -3, -3, -3, -3, -4, -5],
    [-4, -2, 0, 0, 0, 0, -2, -4],
    [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
    [-3, .5, 1.5, 2, 2, 1.5, .5, -3],
    [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
    [-3, .5, 1, 1.5, 1.5, 1, .5, -3],
    [-4, -2, 0, .5, .5, 0, -2, -4],
    [-5, -4, -3, -3, -3, -3, -4, -5]
]);
evalArray.knight.unshift(evalArray.knight[0]);
evalArray.bishop.push([
    [-2, -1, -1, -1, -1, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, .5, 1, 1, .5, 0, -1],
    [-1, .5, .5, 1, 1, .5, .5, -1],
    [-1, 0, 1, 1, 1, 1, 0, -1],
    [-1, 1, 1, 1, 1, 1, 1, -1],
    [-1, .5, 0, 0, 0, 0, .5, -1],
    [-2, -1, -1, -1, -1, -1, -1, -2]
]);
evalArray.bishop.unshift(reverseH(evalArray.bishop[0]));
evalArray.rook.push([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [.5, 1, 1, 1, 1, 1, 1, .5],
    [-.5, 0, 0, 0, 0, 0, 0, -.5],
    [-.5, 0, 0, 0, 0, 0, 0, -.5],
    [-.5, 0, 0, 0, 0, 0, 0, -.5],
    [-.5, 0, 0, 0, 0, 0, 0, -.5],
    [-.5, 0, 0, 0, 0, 0, 0, -.5],
    [0, 0, 0, .5, .5, 0, 0, 0]
]);
evalArray.rook.unshift(reverseH(evalArray.rook[0]));
evalArray.queen.push([
    [-2, -1, -1, -.5, -.5, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, .5, .5, .5, .5, 0, -1],
    [-.5, 0, .5, .5, .5, .5, 0, -.5],
    [0, 0, .5, .5, .5, .5, 0, -.5],
    [-1, .5, .5, .5, .5, .5, 0, -1],
    [-1, 0, .5, 0, 0, 0, 0, -1],
    [-2, -1, -1, -.5, -.5, -1, -1, -2]
]);
evalArray.queen.unshift(evalArray.queen[0]);
evalArray.king.push([
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-2, -3, -3, -4, -4, -3, -3, -2],
    [-1, -2, -2, -2, -2, -2, -2, -1],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 3, 1, 0, 0, 1, 3, 2]
]);
evalArray.king.unshift(reverseH(evalArray.king[0]));