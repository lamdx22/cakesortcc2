// Learn cc.Class:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const CakeController = require("CakeController");

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        // bulletSprite: cc.SpriteFrame,
        // gun: cc.Node,
        // score: {
        //     default: 0,
        //     displayName: "Score (player)",
        //     tooltip: "The score of player",
        // }
        cells: {
            default: [],
            type: [cc.Node],
        },
        spawnSlot: [cc.Node],
        matrixSlot: [cc.Node],
        cakes: [cc.Component],
        processing: [cc.Component],
        cakeUsing: [cc.Integer],
        row: 0,
        col: 0,
        cakeArround: [cc.Component],
        cakePrefab: cc.Prefab,

        currentSelector: cc.Node,
        isContinueCombo: false,
        isSkipCombo: false,
        isFinishProcess: false,
        isShowingPopup: false,
        isWaitingCompleteCake: false,
        isSpawnUp: false,
        isSpawnRight: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.cakeUsing = [1, 2, 3, 4];
    },

    start () {
        
        this.init(6, 4);
        this.checkAndSpawnCake();
    },

    update (dt) {

    },

    init: function(row, col) {
        this.row = row;
        this.col = col;
        this.cakes = new Array(row * col);
        this.cakeArround = new Array(4);
    },

    checkAndSpawnCake: function() {
        let cake;

        for (let i = 0; i < this.spawnSlot.length; i++) {
            if (this.spawnSlot[i].childrenCount === 0) {
                cake = cc.instantiate(this.cakePrefab);
                cake.parent = this.spawnSlot[i];
            }

            cake.setPosition(0, 0, 0);
        }

        this.isSpawnUp = false;
        this.isSpawnRight = false;
        
    },
});
