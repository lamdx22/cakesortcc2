const SoundManager = require("SoundManager");
const CakePoolManager = require("CakePoolManager");

cc.macro.ENABLE_WEBGL_ANTIALIAS = true;         // Bật khử răng cưa

const TableData = cc.Class({
    name: "TableData",    // tên hiện trong Editor
    properties: {
        row: {
            default: 0,
            type: cc.Integer
        },
        col: {
            default: 0,
            type: cc.Integer
        },
        tableScaleX: {
            default: 100,
            type: cc.Integer
        },
        tableScaleY: {
            default: 90,
            type: cc.Integer
        }
    }
});

const GameManager = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        spawnSlot: [cc.Node],
        tableDatas: [TableData],
        isFinishProcess: false,
        isWaitingCompleteCake: false,
        cellsIndex1: [cc.Integer],
        cellsIndex2: [cc.Integer],
        handTut1: cc.Node,
        handTut2: cc.Node,
        maxComplete: 20,
        maxPut: 4,
        bgD: cc.Node,
        bgN: cc.Node,
        cam: cc.Camera,
        mainUINode: cc.Node,
        fxWin: cc.Node,
        tableSub: cc.Node,
        subStatic: [cc.Node],
        subTableRotateDur: 1.5,
        useTextFX: true,
        maxScore: 70,
        isUsingPopUp: true,
        isUsingCakeProgress: true,
        isLimitPut: false,
        level: {
            default: 1,
            type: cc.Integer
        },
        // test: {
        //     default: null,
        //     type: cc.Component,
        // }
        table: cc.Node,
        tableRows: cc.Node,
        cellPrefab: cc.Prefab,
        spaceX: 0.1,
        spaceY: 0.1,
    },

    onLoad () {
        //GameManager.instance = this;
        if (GameManager.instance == null) {
            GameManager.instance = this;
        } else {
            this.destroy();
        }

        if (this.mainUINode) this.mainUI = this.mainUINode.getComponent("MainUI");
        this.countPut = 0;
        this.countComplete = 0;
        this.countSpawnCake = 0;
        this.isGameEnd = false;
        this.isCanMove = true;
        this.isFirstHand2 = false;
        this.isShowTutorial = false;
        this.cakeSub = [];
        this.cakeTutorial = 0;
        this.cells = [];
        this.selectors = [];
        this.row = 5;
        this.col = 4;

        // FrameSize
        let frameSize = cc.view.getFrameSize();
        this.width = frameSize.width;
        this.height = frameSize.height;
        this.onResize();
        //cc.log(this.test);

        // this.tableRows.children.forEach(row => {
        //     row.children.forEach(cell => {
        //         this.cells.push(cell);
        //         this.selectors.push(cell.children[1]);
        //     })
        // });
        // cc.log(this.cells);
    },

    start () {
        this.processing = [];
        this._currentSelector = null;
        this.isShowTutorial = true;
        this.isSpawnInBoard = false;
        this.isFirstLevel = true;

        this.spawnLevel();
    },

    update (dt) {

    },

    init: function(row, col, tableScaleX, tableScaleY) {
        this.row = row;
        this.col = col;
        this._cakes = new Array(row * col);
        this._cakeArround = new Array(4);
        this.cells = [];
        this.selectors = [];

        for (let i = 0; i < this._cakes.length; i++) {
            this._cakes[i] = null;
        }

        this.table.setScale(cc.v3(tableScaleX, tableScaleY, this.table.scaleZ));
        this.tableRows.setScale(cc.v3(100/tableScaleX, 100/tableScaleY, 1));

        this.tableRows.removeAllChildren(true);
        for (let i = 0; i < this.row; i++) {
            let newRow = new cc.Node("Row" + i);
            let posY = (this.row - 1) * this.spaceY/2 - i * this.spaceY;
            newRow.parent = this.tableRows;
            newRow.is3DNode = true;
            newRow.eulerAngles = cc.v3(90, 0, 0);
            newRow.setPosition(0, posY, 0);

            for (let j = 0; j < this.col; j++) {
                let cell = cc.instantiate(this.cellPrefab);
                cell.name = "" + (i*this.col + j);
                cell.parent = newRow;

                let posX =  j * this.spaceX - (this.col - 1) * this.spaceX/2;
                cell.setPosition(posX, 0, 0);
                this.cells.push(cell);
                this.selectors.push(cell.children[1]);
            }
        }
    },

    //async 
    spawnLevel() {
        let tableScaleX = 100;
        let tableScaleY = 90;
        if (this.tableDatas.length > 0) {
            cc.log(this.tableDatas);
            let index = 0;
            if (this.level <= this.tableDatas.length) {
                index = this.level - 1;
            } else {
                index = this.tableDatas.length - 1;
            }
            this.row = this.tableDatas[index].row;
            this.col = this.tableDatas[index].col;
            tableScaleX = this.tableDatas[index].tableScaleX;
            tableScaleY = this.tableDatas[index].tableScaleY;
        } else {
            this.row = 5;
            this.col = 4;
        }
        this.init(this.row, this.col, tableScaleX, tableScaleY);
        this.isShowTutorial = true;
        this.cakeSub = [];
        this.countSpawnCake = 0;
        this.cakeTutorial = 0;

        if (!this.isFirstLevel && this.level == 2) {
            //await new Promise(resolve => setTimeout(resolve, 800));
        }

        this.showTutorial();
        this.checkSpawnCakeInBoard(this.level);
        this.checkAndSpawnCake();
        if (this.isFirstLevel) {
            this.isFirstLevel = false;
        }
    },

    checkAndSpawnCake: function() {
        if (this.level == 1) { 
            let cake = CakePoolManager.instance.spawnCakeSlot();//cc.instantiate(this.cakePrefab);
            cake.node.parent = this.spawnSlot[1];
            cake.node.setPosition(0, 0, 0);            
            cake.init();
            cake.idSub = 1;
            this.cakeSub.push(cake);
            this.playRotateTable1();
        } else {
            for (let i = 0; i < this.spawnSlot.length; i++) {
                if (this.spawnSlot[i].childrenCount === 0) {
                    let cake = CakePoolManager.instance.spawnCakeSlot();//cc.instantiate(this.cakePrefab);
                    cake.node.parent = this.spawnSlot[i];
                    cake.node.setPosition(0, 0, 0);            
                    cake.init();
                    cake.idSub = i;
                    this.cakeSub.push(cake);
                }

            }
            this.tableSub.eulerAngles = cc.v3(-90, -84, 0);
            this.playRotateTable();

            this.isSpawnUp = false;
            this.isSpawnRight = false;
        }
    },

    checkAndSpawnCakeId(id) {
        let cake = CakePoolManager.instance.spawnCakeSlot();
        let cake1 = null;
        let cake2 = null;

        if (id == 0) {
           this.tableSub.eulerAngles = cc.v3(-90, -28, 0);
        } else if (id == 1) {
            this.tableSub.eulerAngles = cc.v3(-90, -56, 0);
        } else {
            this.tableSub.eulerAngles = cc.v3(-90, -84, 0);
        }

        if (id === 0) {
            cake1 = this.cakeSub[1];
            cake1.idSub = 0;
            this.setParentKeepWorldRotation(cake1.node, this.spawnSlot[0]);
            //cake1.node.parent = this.spawnSlot[0];
            cake1.node.setPosition(cc.Vec3.ZERO);

            cake2 = this.cakeSub[2];
            cake2.idSub = 1;
            this.setParentKeepWorldRotation(cake2.node, this.spawnSlot[1]);
            //cake2.node.parent = this.spawnSlot[1];
            cake2.node.setPosition(cc.Vec3.ZERO);

            cake.node.parent = this.spawnSlot[2];

            this.cakeSub[0] = cake1;
            this.cakeSub[1] = cake2;
            this.cakeSub[2] = cake;

        } else if (id === 1) {
            cake1 = this.cakeSub[2];
            cake1.idSub = 1;
            this.setParentKeepWorldRotation(cake1.node, this.spawnSlot[0]);
            //cake1.node.parent = this.spawnSlot[0];
            cake1.node.setPosition(cc.Vec3.ZERO);

            cake.node.parent = this.spawnSlot[1];

            this.cakeSub[1] = cake1;
            this.cakeSub[2] = cake;

        } else if (id === 2) {
            cake.node.parent = this.spawnSlot[0];
            this.cakeSub[2] = cake;
        }

        // Gọi hàm init của cake
        cake.init();

        cake.node.setPosition(cc.Vec3.ZERO);
        //cake.node.setScale(cc.v3(1.55, 1.55, 1.55));
        //cake.node.setRotationFromEuler(this.temp.x, this.temp.y, this.temp.z); // temp là Vec3

        cake.idSub = 2;

        this.playRotateTable(id);

        this.isSpawnedRight = false;
        this.isSpawnedUp = false;
    },

    checkSpawnCakeInBoard(level) {
        this.isSpawnInBoard = true;
        let cake = null;
        if (level == 1) {
            for (let i = 0; i < this.cellsIndex1.length; i++) {
                cake = CakePoolManager.instance.spawnCakeSlot();
                cake.node.parent = this.spawnSlot[0];
                cake.init();
                cake.node.position = cc.v3(0, 0, 0);
                this.onSnapTo(this.cells[this.cellsIndex1[i]], cake, true, true);
            }
            //this.isShowTutorial = false;
        } else if (level == 2) {
            for (let i = 0; i < this.cellsIndex2.length; i++) {
                cake = CakePoolManager.instance.spawnCakeSlot();
                cake.node.parent = this.spawnSlot[0];
                cake.init();
                cake.node.position = cc.v3(0, 0, 0);
                this.onSnapTo(this.cells[this.cellsIndex2[i]], cake, true, true);
            }
            //this.isShowTutorial = false;
        }
        this.isSpawnInBoard = false;
    },

    onResize () {
        let ratio = this.width / this.height;

        if (this.width < this.height) {
            this.bgD.active = true;
            this.bgN.active = false;

            if (ratio > 0.52) {
                this.cam.fov = 24;
            } else if (ratio >= 0.5) {
                this.cam.fov = 26;
            } else if (ratio > 0.48) {
                this.cam.fov = 27;
            } else if (ratio > 0.46) {
                this.cam.fov = 29;
            } else if (ratio > 0.42) {
                this.cam.fov = 32;
            } else {
                this.cam.fov = 33;
            }
        } else {
            this.bgD.active = false;
            this.bgN.active = true;
            this.cam.fov = 22;
        }
    },

    lateUpdate (dt) {
        let frameSize = cc.view.getFrameSize();
        if (this.width !== frameSize.width || this.height !== frameSize.height) {
            this.width = frameSize.width;
            this.height = frameSize.height;
            this.onResize();
        }

        //if (!this.isCanMove) cc.log(this.tableSub.eulerAngles);
    },

    activeWin() {
        if (this.fxWin == null) return;

        this.fxWin.active = true;

        let particles = this.fxWin.getComponentsInChildren(cc.ParticleSystem3D);
        for (let ps of particles) {
            ps.play();   // phát lại từ đầu
        }

        this.scheduleOnce(() => {
            this.despawnFx(fx);
        }, 0.8);
    },

    deactiveWin() {
        if (this.fxWin == null) return;

        this.fxWin.active = false;
        let particles = this.fxWin.getComponentsInChildren(cc.ParticleSystem3D);
        for (let ps of particles) {
            ps.stop();   // đảm bảo dừng hẳn
        }
    },

    addCoin (coin) {},

    onPutCake() {
        this.countPut++;
        if (this.isShowTutorial) this.hideTutorial();
        if (this.isLimitPut && this.countPut >= this.maxPut) {
            this.endGame();
        }
    },

    playRotateTable(id = -1) {

        this.isCanMove = false;

        let targetRotation = null;
        if (id === 0 || id === 1 || id === 2) {
            targetRotation = cc.v3(0, 28, 0);
        } else {
            targetRotation = cc.v3(0, 84, 0);
        }

        if (targetRotation) {
            cc.tween(this.tableSub)
                .by(this.subTableRotateDur, { eulerAngles: targetRotation })
                .call(() => {
                    for (let i = 0; i < this.cakeSub.length; i++) {
                        this.setParentKeepWorldRotation(this.cakeSub[i].node, this.subStatic[i])
                        //this.cakeSub[i].node.parent = this.subStatic[i];
                    }
                    this.isCanMove = true;
                })
                .start();
        }
    },

    playRotateTable1(id = -1) {
        this.tableSub.eulerAngles = cc.v3(-90, -84, 0);

        this.isCanMove = false;

        cc.log(this.tableSub.eulerAngles);
        cc.tween(this.tableSub)
            .by(this.subTableRotateDur, { eulerAngles: cc.v3(0, 84, 0) })
            .call(() => {
                //this.cakeSub[0].node.parent = this.subStatic[1];
                this.setParentKeepWorldRotation(this.cakeSub[0].node, this.subStatic[1])
                this.isCanMove = true;
                cc.log(this.tableSub.eulerAngles);
            })
            .start();
    },

    showTutorial() {
        this.hideTutorial();
        if (this.level == 1 && this.handTut1 != null) {
            this.isShowTutorial = true;
            let hand = this.handTut1.getComponent("HandTutorial");
            if (hand) {
                hand.show();
            }
        } else if (this.level == 2 && this.handTut2 != null) {
            this.isShowTutorial = true;
            let hand = this.handTut2.getComponent("HandTutorial");
            if (hand) {
                hand.show();
            }
        }
    },

    hideTutorial() {
        this.isShowTutorial = false;
        if (this.handTut1 != null && this.handTut1.active) {
            let hand = this.handTut1.getComponent("HandTutorial");
            if (hand) {
                hand.hide();
            }
        } else if (this.handTut2 != null && this.handTut2.active) {
            let hand = this.handTut2.getComponent("HandTutorial");
            if (hand) {
                hand.hide();
            }
        }
    },

    setParentKeepWorldRotation(node, newParent) {
        let oldRot = cc.quat();
        node.getRotation(oldRot);
        let worldMat = cc.mat4();
        //cc.log(worldMat)
        node.getWorldMatrix(worldMat);

        node.setParent(newParent);

        let parentWorldMat = cc.mat4();
        newParent.getWorldMatrix(parentWorldMat);
        let invParentMat = cc.mat4();
        cc.Mat4.invert(invParentMat, parentWorldMat);

        let localMat = cc.mat4();
        cc.Mat4.multiply(localMat, invParentMat, worldMat);

        let pos = cc.v3();
        let rot = cc.quat();
        let scale = cc.v3();
        cc.Mat4.getTranslation(pos, localMat);
        cc.Mat4.getRotation(rot, localMat);
        //cc.Mat4.getScale(scale, localMat);

        //node.setPosition(pos);
        node. setRotation(rot);
        //node.setScale(scale);
    },

    getWorldRotation(node) {
        let mat = cc.mat4();
        node.getWorldMatrix(mat);
        let q = cc.quat();
        mat.getRotation(q);
        return q;
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

        if ((this.handTut1 && this.handTut1.active)) {
            let handTut = this.handTut1.getComponent("HandTutorial");
            if (cell != handTut.targetCell) {
                return false;
            }
        }

        let cellY = Math.floor(index / this.col);
        let cellX = index % this.col;

        return true;
    },

    connectCake(cake1, cake2) {
        let pos1 = cake1.node.convertToWorldSpaceAR(cc.v3(0, 0, 0));
        let pos2 = cake2.node.convertToWorldSpaceAR(cc.v3(0, 0, 0));

        let direction = cc.v3(pos2.x - pos1.x, pos2.y - pos1.y, pos2.z - pos1.z);

        // Convert sang 2D (X,Z) 
        let angle = Math.atan2(direction.z, direction.x) * (180 / Math.PI);

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
        //cc. log("scale cake before: " + cake.node.scaleX);
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

            let fxPos = cell.parent.convertToWorldSpaceAR(cell.position);
            CakePoolManager.instance.spawnFxPut(fxPos);
            SoundManager.instance.soundPutCake.play();

            //this.CheckCakeAround(listIndex);
            this.checkCakeAround(index);
            if (!isFirstSpawn && this.level == 2) {
                this.checkAndSpawnCakeId(cake.idSub);
            }
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
        let fxPos = cake.node.parent.convertToWorldSpaceAR(cake.node.position); 
        CakePoolManager.instance.spawnFxComplete(fxPos);

        this.countComplete++;
        if (this.countComplete >= this.maxComplete) {
            this.endGame();
        }

        if (this.level == 1 && this.countComplete >= 2 && !this.isGameEnd) {
            this.level++;
            this.spawnLevel();
        }

        //this._isContinueCombo = true;

        let scoreIncrease = 10;
        if (this.mainUI) this.mainUI.addScore(scoreIncrease);
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
        let isLose = true;
        for (let i = 0; i < this._cakes.length; i++) {
            let cake = this._cakes[i];
            if (cake == null) {
                isLose = false
                break;
                //return false;
            } else {
                if (cake.freeSlot() == cake.cakeAmount) {
                    isLose = false;
                    break;
                } else if (cake.isFinish) {
                    isLose = false;
                    break;
                }
            }
        }

        if (isLose) {
            cc.log("Lose!!!!!!!!");
            this.endGame();
            this.mainUI.showPopUpLose();
        }

        if (this._cakes.filter(x => x == null).length == 0) {
            let t =0;
            t++;
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

    endGame() {
        this.isGameEnd = true;
        cc.log("Game End");
    },

    goToStore() {
        cc.log("Go To Store");
    },
});

module.exports = GameManager;
