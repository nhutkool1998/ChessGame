var DemoteStrategy = cc.Class.extend({
    description: null,
    ctor: function (chessObjects, logicChessboard) {
        this.init(chessObjects, logicChessboard)
    },
    execute: function (type,player) {

    },
    showDescription: function (promoteDialog,type) {
        var lb = cc.LabelTTF.create(this.description, 'Arial', 16, 100, cc.TEXT_ALIGNMENT_CENTER);
        
      
        lb.setAnchorPoint(0.5,0.5); 
        lb.setPosition(0,-80);
        
        lb.setColor(new cc.Color(165, 42, 42));
        promoteDialog.notifNode.addChild(lb, 1);
        lb.setAnchorPoint(0.5, 0.5);
    },
    init: function (chessObjects, logicChessboard) {
        this.chessObjects = chessObjects;
        this.logicChessboard = logicChessboard;
    },
    _demote: function(chessObject){
        chessObject.setType(CHESS_TYPE.PAWN); 
        ChessboardGUIInstance.sendChangeType(chessObject);
    }
});

var RandomDemote = DemoteStrategy.extend({
    showDescription: function(promoteDialog,type){
        this.description = "A random chess of chosen kind will be demoted\nPawn cannot be demoted.A chess can promoted ONCE only"; 
        this._super(promoteDialog,type); 
    },
    execute: function(type,player){
        for (var i = 0; i < this.chessObjects.length;++i){
            var position = getBoardPositionFromTag(this.chessObjects[i].tag); 
            if (this.chessObjects[i].chessType == type 
                && this.logicChessboard[position.x][position.y][type] == player)
            {
                this._demote(this.chessObjects[i]); 
                break; 
            }
        }
    }
}); 

var randomDemote = new RandomDemote(); 