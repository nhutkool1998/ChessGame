var roomID = 0;
var PADDING = 10;
var selfPlay = false; 

var StartGameScreen = cc.Layer.extend({
    bg: null,
    startButton: null,
    labelCode: null,
    textField: null,
    ctor: function () {
        this._super();

        roomID = Math.floor(Math.random() * 100);

        this.bg = new cc.Sprite(res.war);
        this.bg.setScale(cc.winSize.height / this.bg.height);
        this.bg.setAnchorPoint(0.5, 0.5);
        this.bg.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        this.addChild(this.bg);

        this.initRoom();

        // return;
        this.labelCode = new cc.LabelBMFont("Your room code: " + roomID + "\nOr join a room:", res.font, 200, cc.TEXT_ALIGNMENT_CENTER);
        this.labelCode.setAnchorPoint(0.5, 0.5);
        this.labelCode.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 + 3 * this.labelCode.height / 2);
        this.labelCode.setScale(3);

        this.textField = new ccui.TextField();
        this.textField.fontName = "Arial";
        this.textField.placeHolder = "Enter code here";
        this.textField.fontSize = 14;
        this.textField.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 - 3 * this.labelCode.height / 2 + PADDING / 2);
        this.textField.setTouchEnabled(true);
        this.textField.setMaxLengthEnabled(true);
        this.textField.setMaxLength(12);
        this.textField.addEventListener(this.textFieldEvent.bind(this), this);
        this.textField.setTouchSize(cc.size(300, 100));
        this.textField.setScale(3);
        // this.textField.setTextColor (new cc.Color(255,0,0)); 
        // this.setTexture(res.textbox);

        // this.labelCode.setPosition(cc.winSize.width/2,cc.winSize.height/2 - this.labelCode.height/2); 

        var buttonIMG = new cc.Scale9Sprite(res.buttonImg);
        var startText = new cc.LabelBMFont("JOIN ROOM!", res.font);
        startText.setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        startText.setAnchorPoint(0.5, 0.5);
        startText.setScale(2);
        this.startButton = new cc.ControlButton(startText, buttonIMG);
        this.startButton.addTargetWithActionForControlEvents(this, this.joinGame.bind(this), cc.CONTROL_EVENT_TOUCH_UP_INSIDE)

        this.startButton.setAnchorPoint(0.5, 0.5);
        this.startButton.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 - 3 * this.labelCode.height / 2 - 5 * PADDING);
        this.startButton.setPreferredSize(cc.size(buttonIMG.getContentSize().width, buttonIMG.getContentSize().height));
        this.addChild(this.labelCode);
        this.addChild(this.textField);
        this.addChild(this.startButton);

        this.listenForGameStart(roomID,false);
    },
    initRoom: function () {
        var database = firebase.database();
        database.ref("room/" + roomID).set(false);
    },
    joinGame: function () {
        var database = firebase.database();
        var p = {};
        database.ref("room/"+roomID).off();
        var _roomID = this.textField.getString();
        if (_roomID != roomID + ""){
            selfPlay = true;
        }
        p[_roomID] = roomID;
        database.ref("room/").set(p);
        var isWhite = true; 
        this.listenForGameStart(_roomID,isWhite);
    },
    listenForGameStart: function (_roomID,isWhite) {
        cc.log("listenForGameStart",_roomID);
        var database = firebase.database();
        database.ref("room/" + _roomID).on('value', function (snapshot) {
          //  var isWhite = snapshot.val() == roomID;
            if (snapshot.val() != false && snapshot.val() != null) {
                var scene = new cc.Scene(); 
                roomID = snapshot.val(); 
                 scene.addChild(new ChessboardGUI(isWhite));
                 database.ref("room/"+_roomID).off();
                cc.director.runScene(scene);
                
            }
        });

    },
    textFieldEvent: function (sender, type) {
        // switch (type) {
        //     case ccui.TextField.EVENT_ATTACH_WITH_IME:
        //         cc.log("Activate");
        //         this.textField.placeHolder = "";
        //         break;

        //     case ccui.TextField.EVENT_DETACH_WITH_IME:
        //         cc.log("Deactivate");

        //         break;

        //     case ccui.TextField.EVENT_INSERT_TEXT:
        //         cc.log("Insert character");
        //         cc.log(this.textField.string);

        //         break;

        //     case ccui.TextField.EVENT_DELETE_BACKWARD:
        //         cc.log("Delect character");
        //         cc.log(this.textField.string);

        //         break;
        // }
    }
});