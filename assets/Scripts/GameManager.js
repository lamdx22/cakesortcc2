// Learn cc.Class:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

let GameManager = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        cells: {
            default: [],
            type: [cc.Node],
        },
        spawnSlot: [cc.Node],
        matrixSlot: [cc.Node],
        processing: [cc.Component],
        cakeUsing: [cc.Integer],
        row: 0,
        col: 0,
        cakePrefab: cc.Prefab,

        currentSelector: cc.Node,
        isContinueCombo: false,
        isSkipCombo: false,
        isFinishProcess: false,
        isShowingPopup: false,
        isWaitingCompleteCake: false,
        isSpawnUp: false,
        isSpawnRight: false,
        camera: cc.Camera,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //GameManager.instance = this;
        if (GameManager.instance == null) {
            GameManager.instance = this;
        } else {
            this.destroy();
        }

        cc.director.getPhysics3DManager().enabled = true;
    },

    start () {
        //this._cakes = [];
        //cakeArround: [cc.Component],

        this.cakeUsing = [1, 2, 3];

        this.init(6, 4);
        this.checkAndSpawnCake();
        
    },

    update (dt) {

    },

    init: function(row, col) {
        this.row = row;
        this.col = col;
        this._cakes = new Array(row * col);
        this._cakeArround = new Array(4);
    },

    checkAndSpawnCake: function() {
        //let cake;

        for (let i = 0; i < this.spawnSlot.length; i++) {
            if (this.spawnSlot[i].childrenCount === 0) {
                let cakeNode = cc.instantiate(this.cakePrefab);
                cakeNode.parent = this.spawnSlot[i];
                cakeNode.setPosition(0, 0, 0);

                let cake = cakeNode.getComponent("CakeController");
                cake.init();

            }

        }

        this.isSpawnUp = false;
        this.isSpawnRight = false;
        
    },

    isCanSnap(cell, cake) {
        let index = this.cells.indexOf(cell);
        let cakeCheck = null;

        if (index < 0) {
            return false;
        }

        if (this._cakes[index] != null) {
            return false;
        }

        let cellY = Math.floor(index / this.col);
        let cellX = index % this.col;

        return true;
    },

    onSnapTo(cell, cake) {
        let index = this.cells.indexOf(cell);

        if (index >= 0 && this._cakes[index] == null) {
            cake.node.parent = cell;
            cake.node.position = cc.v3(0, 0, 0);
            this._cakes[index] = cake;
            this.checkCakeAround(index);
        }

        this.checkAndSpawnCake();
    },

    checkCakeAround(index) {
        let cellY = Math.floor(index/ this.col);
        let cellX = index % this.col;

        if (cellY > 0) {
            this._cakeArround[0] = this._cakes[index - this.col];
        }
        if (cellY < this.row - 1) {
            this._cakeArround[1] = this._cakes[index + this.col];
        }
        if (cellX > 0)
        {
            this._cakeArround[2] = this._cakes[index - 1];
        }
        if (cellX < this.col - 1)
        {
            this._cakeArround[3] = this._cakes[index + 1];
        }
        this._cakes[index].connectAround(this._cakeArround);

        this._cakeArround[0] = null;
        this._cakeArround[1] = null;
        this._cakeArround[2] = null;
        this._cakeArround[3] = null;
    }
});

module.exports = GameManager;
