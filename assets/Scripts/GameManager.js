// Learn cc.Class:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const SoundManager = require("SoundManager");
const CakePoolManager = require("CakePoolManager");

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
        selectors: [cc.Node],
        row: 0,
        col: 0,
        cakePrefab: cc.Prefab,

        isContinueCombo: false,
        isSkipCombo: false,
        isFinishProcess: false,
        isShowingPopup: false,
        isWaitingCompleteCake: false,
        isSpawnUp: false,
        isSpawnRight: false,
        camera: cc.Camera,
    },

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
        //this.cakeUsing = [0, 1, 2];
        this.processing = [];
        this._currentSelector = null;

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

        for (let i = 0; i < this._cakes.length; i++) {
            this._cakes[i] = null;
        }
    },

    checkAndSpawnCake: function() {
        for (let i = 0; i < this.spawnSlot.length; i++) {
            if (this.spawnSlot[i].childrenCount === 0) {
                // let cakeNode = CakePoolManager.instance.spawnCakeSlot();//cc.instantiate(this.cakePrefab);
                // cakeNode.parent = this.spawnSlot[i];
                // cakeNode.setPosition(0, 0, 0);

                // let cake = cakeNode.getComponent("CakeController");
                // cake.init();
                let cake = CakePoolManager.instance.spawnCakeSlot();//cc.instantiate(this.cakePrefab);
                cake.node.parent = this.spawnSlot[i];
                cake.node.setPosition(0, 0, 0);            
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
        let pos1 = cake1.node.convertToWorldSpaceAR(cc.v3(0, 0, 0));
        let pos2 = cake2.node.convertToWorldSpaceAR(cc.v3(0, 0, 0));

        let direction = cc.v3(pos2.x - pos1.x, pos2.y - pos1.y, pos2.z - pos1.z);

        // Convert sang 2D (X,Z) để tính hướng
        let angle = Math.atan2(direction.z, direction.x) * (180 / Math.PI);

        // Quy ước góc gần trục nào thì snap về trục đó
        // Right (0°), Up (-90°), Left (180°/-180°), Down (90°)
        if (Math.abs(angle + 90) < 1e-2) {
            cake1.connectEdge(0); // Up
        }
        else if (Math.abs(angle) < 1e-2) {
            cake1.connectEdge(1); // Right
        }
        else if (Math.abs(Math.abs(angle) - 180) < 1e-2) {
            cake1.connectEdge(2); // Left
        }
        else if (Math.abs(angle - 90) < 1e-2) {
            cake1.connectEdge(3); // Down
        }
    },

    isCanSnapTo(cell, cake) {
        let index = this.cells.indexOf(cell);

        if (this._cakes[index] != null) {
            return false;
        }
        return true;
    },

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
            let fxPos = cell.parent.convertToWorldSpaceAR(cell.position);
            //fxPos.y = 35;
            CakePoolManager.instance.spawnFxPut(fxPos);
            SoundManager.instance.soundPutCake.play();

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
        SoundManager.instance.soundCompleteCake.play();
        //AssetManager.Instance.GetFxComplete(cake.node.position);
        let fxPos = cake.node.parent.convertToWorldSpaceAR(cake.node.position); 
        CakePoolManager.instance.spawnFxComplete(fxPos);

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

    checkLose() {
        if (this._cakes.filter(x => x == null).length == 0) {
            cc.log("Lose!!!!!!!!");
        }
    },

    showSelector(slot, cake) {
        let indexInCell = this.cells.indexOf(slot);
        let selector = this.selectors[indexInCell];

        if ((this._currentSelector != null && this._currentSelector != selector) || this.currentSelector == null) {
            this.offSelector();
            _currentSelector = selector;
            selector.active = true;
        }
    },

    offSelector() {
        for (let i = 0; i < this.selectors.length; i++) {
            this.selectors[i].active = false;
        }
        this._currentSelector = null;
    }
});

module.exports = GameManager;
