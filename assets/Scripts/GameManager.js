const SoundManager = require("SoundManager");
const CakePoolManager = require("CakePoolManager");
const GameManagerLamDX = require("GameManagerLamDX");

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

        //cc.director.getPhysics3DManager().enabled = true;
    },

    start () {
        //this.cakeUsing = [0, 1, 2];
        this.processing = [];
        this._currentSelector = null;
        this.isShowTutorial = true;
        this.isSpawnInBoard = false;

        // this.init(5, 4);
        // this.checkSpawnCakeInBoard(1);
        // this.checkAndSpawnCake();
        // let a = 1;
        //if (GameManagerLamDX.instance.handTut1) GameManagerLamDX.instance.handTut1.active = true;
        //if (GameManagerLamDX.instance.handTut2) GameManagerLamDX.instance.handTut2.active = false;
        this.spawnLevel2();
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

    async spawnLevel2() {
        GameManagerLamDX.instance.level = 2;
        this.init(5, 4);
        GameManagerLamDX.instance.cakeSub = [];
        this.checkSpawnCakeInBoard(2);
        this.checkAndSpawnCake();
        if (GameManagerLamDX.instance.handTut1) GameManagerLamDX.instance.handTut1.active = false;
        if (GameManagerLamDX.instance.handTut2) GameManagerLamDX.instance.handTut2.active = true;
    },

    checkAndSpawnCake: function() {
        if (GameManagerLamDX.instance.level == 1) { 
            let cake = CakePoolManager.instance.spawnCakeSlot();//cc.instantiate(this.cakePrefab);
            cake.node.parent = this.spawnSlot[1];
            cake.node.setPosition(0, 0, 0);            
            cake.init();
            cake.idSub = 1;
            GameManagerLamDX.instance.cakeSub.push(cake);
            GameManagerLamDX.instance.playRotateTable1();
        } else {
            for (let i = 0; i < this.spawnSlot.length; i++) {
                if (this.spawnSlot[i].childrenCount === 0) {
                    let cake = CakePoolManager.instance.spawnCakeSlot();//cc.instantiate(this.cakePrefab);
                    cake.node.parent = this.spawnSlot[i];
                    cake.node.setPosition(0, 0, 0);            
                    cake.init();
                    cake.idSub = i;
                    GameManagerLamDX.instance.cakeSub.push(cake);
                }

            }
            GameManagerLamDX.instance.tableSub.eulerAngles = cc.v3(-90, -84, 0);
            GameManagerLamDX.instance.playRotateTable();

            this.isSpawnUp = false;
            this.isSpawnRight = false;
        }
    },

    checkAndSpawnCakeId(id) {
        let cake = CakePoolManager.instance.spawnCakeSlot();
        let cake1 = null;
        let cake2 = null;

        if (id == 0) {
            GameManagerLamDX.instance.tableSub.eulerAngles = cc.v3(-90, -28, 0);
        } else if (id == 1) {
            GameManagerLamDX.instance.tableSub.eulerAngles = cc.v3(-90, -56, 0);
        } else {
            GameManagerLamDX.instance.tableSub.eulerAngles = cc.v3(-90, -84, 0);
        }

        if (id === 0) {
            cake1 = GameManagerLamDX.instance.cakeSub[1];
            cake1.idSub = 0;
            GameManagerLamDX.instance.setParentKeepWorldRotation(cake1.node, this.spawnSlot[0]);
            //cake1.node.parent = this.spawnSlot[0];
            cake1.node.setPosition(cc.Vec3.ZERO);

            cake2 = GameManagerLamDX.instance.cakeSub[2];
            cake2.idSub = 1;
            GameManagerLamDX.instance.setParentKeepWorldRotation(cake2.node, this.spawnSlot[1]);
            //cake2.node.parent = this.spawnSlot[1];
            cake2.node.setPosition(cc.Vec3.ZERO);

            cake.node.parent = this.spawnSlot[2];

            GameManagerLamDX.instance.cakeSub[0] = cake1;
            GameManagerLamDX.instance.cakeSub[1] = cake2;
            GameManagerLamDX.instance.cakeSub[2] = cake;

        } else if (id === 1) {
            cake1 = GameManagerLamDX.instance.cakeSub[2];
            cake1.idSub = 1;
            GameManagerLamDX.instance.setParentKeepWorldRotation(cake1.node, this.spawnSlot[0]);
            //cake1.node.parent = this.spawnSlot[0];
            cake1.node.setPosition(cc.Vec3.ZERO);

            cake.node.parent = this.spawnSlot[1];

            GameManagerLamDX.instance.cakeSub[1] = cake1;
            GameManagerLamDX.instance.cakeSub[2] = cake;

        } else if (id === 2) {
            cake.node.parent = this.spawnSlot[0];
            GameManagerLamDX.instance.cakeSub[2] = cake;
        }

        // Gọi hàm init của cake
        cake.init();

        cake.node.setPosition(cc.Vec3.ZERO);
        //cake.node.setScale(cc.v3(1.55, 1.55, 1.55));
        //cake.node.setRotationFromEuler(this.temp.x, this.temp.y, this.temp.z); // temp là Vec3

        cake.idSub = 2;

        GameManagerLamDX.instance.playRotateTable(id);

        this.isSpawnedRight = false;
        this.isSpawnedUp = false;
    },

    checkSpawnCakeInBoard(level) {
        this.isSpawnInBoard = true;
        let cake = null;
        if (level == 1) {
            for (let i = 0; i < GameManagerLamDX.instance.cells1.length; i++) {
                cake = CakePoolManager.instance.spawnCakeSlot();
                cake.node.parent = this.spawnSlot[0];
                cake.init();
                cake.node.position = cc.v3(0, 0, 0);
                this.onSnapTo(GameManagerLamDX.instance.cells1[i], cake, true, true);
            }
            //this.isShowTutorial = false;
        } else {
            for (let i = 0; i < GameManagerLamDX.instance.cells.length; i++) {
                cake = CakePoolManager.instance.spawnCakeSlot();
                cake.node.parent = this.spawnSlot[0];
                cake.init();
                cake.node.position = cc.v3(0, 0, 0);
                this.onSnapTo(GameManagerLamDX.instance.cells[i], cake, true, true);
            }
            //this.isShowTutorial = false;
        }
        this.isSpawnInBoard = false;
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

        // if ((GameManagerLamDX.instance.handTut1 && GameManagerLamDX.instance.handTut1.active)) {
        //     let handTut = GameManagerLamDX.instance.handTut1.getComponent("HandTutorial");
        //     if (cell != handTut.targetCell) {
        //         return false;
        //     }
        // }

        // if ((GameManagerLamDX.instance.handTut2 && GameManagerLamDX.instance.handTut2.active)) {
        //     let handTut = GameManagerLamDX.instance.handTut2.getComponent("HandTutorial");
        //     if (cell != handTut.targetCell) {
        //         return false;
        //     }
        // }

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

    onSnapTo(cell, cake, isSwapInMatrix = false, isFirstSpawn = false) {
        let index = this.cells.indexOf(cell);
        cc. log("scale cake before: " + cake.node.scaleX);
        if (isSwapInMatrix) {
            for (let i = 0; i < this._cakes.length; i++) {
                if (this._cakes[i] === cake) {
                    this._cakes[i] = null;
                }
            }
        }

        if (index >= 0 && this._cakes[index] == null) {
            //let worldScale = this.getWorldScale(cake.node);
            cake.node.parent = cell;
            // setTimeout(() => {
            //     this.setParentKeepWordScale(worldScale, cake.node, cell); 
            // }, 0.2);
            //this.setParentKeepWordScale(cake.node, cell); 
            cake.node.setPosition(cc.v3(0, 0, 0));
            this._cakes[index] = cake;
            cc. log("scale cake after: " + cake.node.scaleX);

            let listIndex = [];
            listIndex.push(index);

            //AssetManager.Instance.GetFxPut(cake.node.position);
            let fxPos = cell.parent.convertToWorldSpaceAR(cell.position);
            //fxPos.y = 35;
            CakePoolManager.instance.spawnFxPut(fxPos);
            SoundManager.instance.soundPutCake.play();

            //this.CheckCakeAround(listIndex);
            this.checkCakeAround(index);
            if (!isFirstSpawn && GameManagerLamDX.instance.level == 2) {
                this.checkAndSpawnCakeId(cake.idSub);
            }
        }
    },

    getWorldScale(node) {
        // let scale = cc.v3(node.scaleX, node.scaleY, node.scaleZ);
        // let p = node.parent;
        // while (p) {
        //     scale.x *= p.scaleX;
        //     scale.y *= p.scaleY;
        //     scale.z *= p.scaleZ;
        //     p = p.parent;
        // }
        // return scale;
        // _worldMatrix tồn tại trong Cocos 2.4 (ma trận 4x4)
        
        let mat = node._worldMatrix;
        if (!mat) {
            node._updateWorldMatrix(); // ép update nếu chưa có
            mat = node._worldMatrix;
        }

        // Cột X = (m00, m01, m02)
        let sx = Math.sqrt(mat.m0 * mat.m0 + mat.m1 * mat.m1 + mat.m2 * mat.m2);
        // Cột Y = (m04, m05, m06)
        let sy = Math.sqrt(mat.m4 * mat.m4 + mat.m5 * mat.m5 + mat.m6 * mat.m6);
        // Cột Z = (m08, m09, m10)
        let sz = Math.sqrt(mat.m8 * mat.m8 + mat.m9 * mat.m9 + mat.m10 * mat.m10);

        return cc.v3(sx, sy, sz);
    },

    async setParentKeepWordScale(node, newParent) {
        // Lưu world matrix trướ
        let worldScale = this.getWorldScale(node);        // scale trước khi đổi parent


        let parentWorld = this.getWorldScale(newParent);  // world scale của parent

        node.parent = newParent;                     // đổi parent

        await new Promise(resolve => setTimeout(resolve, 200));

        // tránh chia 0
        if (parentWorld.x === 0) parentWorld.x = 1;
        if (parentWorld.y === 0) parentWorld.y = 1;
        if (parentWorld.z === 0) parentWorld.z = 1;

        node.scaleX = worldScale.x / parentWorld.x;
        node.scaleY = worldScale.y / parentWorld.y;
        node.scaleZ = worldScale.z / parentWorld.z;
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
        GameManagerLamDX.instance.onCompleteCake();

        if (GameManagerLamDX.instance.level == 1 && GameManagerLamDX.instance.countComplete >= 2) {
            this.spawnLevel2();
        }

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
        return; // Circle sub version
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
    },
});

module.exports = GameManager;
