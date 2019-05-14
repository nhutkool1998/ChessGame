/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/


var HelloWorldLayer = cc.Layer.extend({
    sprite: null,
    mapNode: null,
    tileMap: null,
    tileWidth: null,
    tileHeight: null,
    chessScale: null,
    ctor: function () {
        //////////////////////////////
        // 1. super init first
        this._super();
        this.mapNode = new cc.Sprite();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        //  this.tileMap  = cc.Sprite.create("res/newMappp.png");
        var mapWidth,mapHeight; 
        this.tileMap = cc.TMXTiledMap.create(res.chessMap);
        mapHeight = this.tileMap.height;
        mapWidth = this.tileMap.width; 

        cc.log(this.tileMap);
        this.tileMap.setPosition(0, 0);
        this.tileMap.setAnchorPoint(0.5, 0.5);



        var kingSprite = new cc.Sprite(res.blackKing);
        this.tileWidth = this.tileMap.getTileSize().width;
        this.tileHeight = this.tileMap.getTileSize().height;
        this.chessScale = this.tileWidth / kingSprite.getContentSize().width;
        kingSprite.setScale(this.chessScale);
        var position = this.calculatePosition(2, 1);
        kingSprite.setPosition(position);
//        kingSprite.setPosition(cc.winSize.width/2,cc.winSize.height/2);
        kingSprite.setAnchorPoint(0.5,0.5);

        this.mapNode.addChild(kingSprite,1);

        this.mapNode.addChild(this.tileMap, -1);
        this.addChild(this.mapNode);
        cc.log("mapHeight",this.tileMap.height); 
        this.mapNode.setTextureRect(cc.rect(0,0,this.tileMap.width,this.tileMap.height));
        this.mapNode.setPosition(cc.winSize.width/2+mapWidth/2,cc.winSize.height/2+mapHeight/2);
        this.mapNode.setAnchorPoint(0.5,0.5);

        return true;
    },

    calculatePosition: function (x, y) {
        var topLeftX =  -this.tileMap.width/2 + this.tileWidth/2;
        var topLeftY =  this.tileMap.height/2  - this.tileHeight/2;
        //TODO: since row first, column follows, resX and resY must be interchanged.
        var resX = topLeftX + (y-1) * this.tileWidth;
        var resY = topLeftY - (x-1) * this.tileWidth;
        cc.log("topLeftY",topLeftY);
        cc.log("resX",resX);
        cc.log("resY",resY);
        cc.log("cc.winSize.width/2",cc.winSize.width/2);
        return cc.p(resX, resY);
    },
});

var HelloWorldScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

