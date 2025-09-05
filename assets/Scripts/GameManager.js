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
        this.processing = [];

        this.init(5, 4);
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

    connectCake(cake1, cake2) {
        let pos1 = cake1.node.position;
        let pos2 = cake2.node.position;

        let direction = cc.v3(pos2.x - pos1.x, pos2.y - pos1.y, pos2.z - pos1.z);

        // Convert sang 2D (X,Z) để tính hướng
        let angle = Math.atan2(direction.z, direction.x) * (180 / Math.PI);

        // Quy ước góc gần trục nào thì snap về trục đó
        // Right (0°), Up (90°), Left (180°/-180°), Down (-90°)
        if (Math.abs(angle - 90) < 1e-2) {
            cake1.connectEdge(0); // Up
        }
        else if (Math.abs(angle) < 1e-2) {
            cake1.connectEdge(1); // Right
        }
        else if (Math.abs(Math.abs(angle) - 180) < 1e-2) {
            cake1.connectEdge(2); // Left
        }
        else if (Math.abs(angle + 90) < 1e-2) {
            cake1.connectEdge(3); // Down
        }
    },

    // onSnapTo(cell, cake) {
    //     let index = this.cells.indexOf(cell);

    //     if (index >= 0 && this._cakes[index] == null) {
    //         cake.node.parent = cell;
    //         cake.node.position = cc.v3(0, 0, 0);
    //         this._cakes[index] = cake;
    //         this.checkCakeAround(index);
    //     }

    //     this.checkAndSpawnCake();
    // },

    onSnapTo(cell, cake, isSwapInMatrix = false) {
        let index = this.cells.indexOf(cell);

        if (isSwapInMatrix) {
            for (let i = 0; i < this._cakes.length; i++) {
                if (this._cakes[i] === cake) {
                    this._cakes[i] = null;
                }
            }
        }

        if (index >= 0 && this._cakes[index] == null) {
            cake.node.parent = cell;
            cake.node.setPosition(cc.v3(0, 0, 0));
            this._cakes[index] = cake;

            let listIndex = [];
            listIndex.push(index);

            //AssetManager.Instance.GetFxPut(cake.node.position);
            //SoundManager.Instance.SoundPutCake.play();

            // // Snap sang phải
            // if (cake.Right != null) {
            //     let temp = cake.Right;
            //     cake.FreeCake();

            //     this._cakes[index + 1] = temp;
            //     temp.node.parent = this._cells[index + 1];
            //     temp.node.setPosition(cc.v3(0, 0, 0));

            //     listIndex.push(index + 1);
            //     this._isSkipCombo = true;

            //     temp.Bounce();
            //     AssetManager.Instance.GetFxPut(temp.node.position);
            // }

            // // Snap lên trên
            // if (cake.Up != null) {
            //     let temp = cake.Up;
            //     cake.FreeCake();

            //     this._cakes[index - this._col] = temp;
            //     temp.node.parent = this._cells[index - this._col];
            //     temp.node.setPosition(cc.v3(0, 0, 0));

            //     listIndex.push(index - this._col);
            //     this._isSkipCombo = true;

            //     temp.Bounce();
            //     AssetManager.Instance.GetFxPut(temp.node.position);
            // }

            //this.CheckCakeAround(listIndex);
            this.checkCakeAround(index);
        }
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
        this._cakes[index].connectAround(this._cakeArround.slice());

        this.processing.push(this._cakes[index]);
        this._cakeArround[0] = null;
        this._cakeArround[1] = null;
        this._cakeArround[2] = null;
        this._cakeArround[3] = null;
    },

    setFinishProcess(isFinish) {
        this.isFinishProcess = isFinish;
    },

    waitingCompleteCake() {
        this.isWaitingCompleteCake = true;
    },

    onDestroyCake(cake) {
        for (let i = 0; i < this._cakes.length; i++) {
            if (this._cakes[i] == cake) {
                this._cakes[i] = null;
                break;
            }
        }
    },

    onCompleteCake(cake, index) {
        //SoundManager.Instance.SoundCompleteCake.play();
        //AssetManager.Instance.GetFxComplete(cake.node.position);

        this._isContinueCombo = true;
        //Data.combo++;

        //let extraByCombo = (Data.combo === 1 ? 0 : Data.combo) * 0.1;
        //let indexCakeInUsing = Math.max(0, Data.CakeUsing.indexOf(index));

        // let scoreIncrease = this.cakeBaseCP[indexCakeInUsing] + Math.round(this.cakeBaseCP[indexCakeInUsing] * extraByCombo);
        // let coinIncrease = Data.combo;

        // if (Data.turboTime > 0) {
        //     scoreIncrease *= 2;
        //     coinIncrease *= 2;
        // }

        //MainUI.Instance.IncreaseScore(scoreIncrease);

        //let expIncrease = 20 + Math.floor(20 * extraByCombo);
        //// this._topUI.GetExp(expIncrease);

        // if (Data.combo >= 2) {
        //     MainUI.Instance.ShowComboText(Data.combo, cake.node.position);
        // }
    },

    endProcessCake(cake) {
        const index = this.processing.indexOf(cake);
        if (index >= 0) {
            this.processing.splice(index, 1);
        }

        let isAllEmpty = this.spawnSlot.every(slot => slot.children.length === 0);
        if (isAllEmpty && this.processing.length === 0) {
            this.checkAndSpawnCake();
        }
    },
});

module.exports = GameManager;
