//const CakeController = require("CakeController");
//const PieceController = require("PieceController");
//const GameplayManager = require("GameplayManager");


let CakePoolManager = cc.Class({
    extends: cc.Component,

    properties: {
        cakeSlotPrefab: cc.Prefab,
        piecePrefabs: {
            default: [],
            type: [cc.Prefab]
        },
        fxPutPrefab: cc.Prefab,
        fxCompletePrefab: cc.Prefab,
    },

    statics: {
        instance: null,
    },

    onLoad () {
        if (CakePoolManager.instance == null) {
            CakePoolManager.instance = this;
        } else {
            this.destroy();
        }

        this._cakeSlotCycle = [];
        this._pieceCycle = {};
        this._putFxCycle = [];
        this._completeFxCycle = [];
    },

    start () {
        let fx = this.spawnFxPut(cc.v3(-10000, -10000, 0));
        //fx.active = false;
        //this.despawnFx(fx);
    },

    spawnPiece(index) {
        if (!this._pieceCycle[index]) {
            this._pieceCycle[index] = [];
        }

        if (this._pieceCycle[index].length === 0) {
            let pieceNode = cc.instantiate(this.piecePrefabs[index]);
            //let pieceNode = cc.instantiate(this.piecePrefabs[0]);
            let piece = pieceNode.getComponent("PieceController");
            this._pieceCycle[index].push(piece);
        }

        let piece = this._pieceCycle[index].pop();
        //this._pieceCycle[index].splice(0, 1);
        piece.node.active = true;
        return piece;
    },

    despawnPiece(piece) {
        //piece.node.destroy();
        piece.node.active = false;
        this._pieceCycle[piece.Type].push(piece);
    },

    spawnCakeSlot() {
        if (this._cakeSlotCycle.length === 0) {
            let cakeNode = cc.instantiate(this.cakeSlotPrefab);
            let cake = cakeNode.getComponent("CakeController");
            this._cakeSlotCycle.push(cake);
        }
        let result = this._cakeSlotCycle.pop();
        result.node.active = true;
        return result;
    },

    despawnCakeSlot(cake) {
        cake.node.active = false;
        //cake = null;
        this._cakeSlotCycle.push(cake);
    },

    spawnFxPut(pos) {
        if (this._putFxCycle.length < 1) {
            this._putFxCycle.push(cc.instantiate(this.fxPutPrefab));
        }

        let fx = this._putFxCycle.pop();
        fx.active = true;
        //let pieceNode = cc.instantiate(this.piecePrefabs[0]);
        fx.parent = cc.director.getScene();
        fx.position = pos;

        let particles = fx.getComponentsInChildren(cc.ParticleSystem3D);
        for (let ps of particles) {
            //ps.stop();   // đảm bảo dừng hẳn
            ps.play();   // phát lại từ đầu
        }

        this.scheduleOnce(() => {
            this.despawnFx(fx);
        }, 0.5);
        return fx;
    },

    despawnFx(fx) {
        if (fx && fx.isValid) {
            fx.active = false;
            this._putFxCycle.push(fx);
            let particles = fx.getComponentsInChildren(cc.ParticleSystem3D);
            for (let ps of particles) {
                ps.stop();   // đảm bảo dừng hẳn
                //ps.play();   // phát lại từ đầu
            }
        }
    },

    spawnFxComplete(pos) {
        if (this._completeFxCycle.length < 1) {
            this._completeFxCycle.push(cc.instantiate(this.fxCompletePrefab));
        }

        let fx = this._completeFxCycle.pop();
        fx.active = true;
        //let pieceNode = cc.instantiate(this.piecePrefabs[0]);
        fx.parent = cc.director.getScene();
        fx.position = pos;

        let particles = fx.getComponentsInChildren(cc.ParticleSystem3D);
        for (let ps of particles) {
            //ps.stop();   // đảm bảo dừng hẳn
            ps.play();   // phát lại từ đầu
        }

        this.scheduleOnce(() => {
            this.despawnFxComplete(fx);
        }, 0.5);
        return fx;
    },

    despawnFxComplete(fx) {
        if (fx && fx.isValid) {
            fx.active = false;
            this._completeFxCycle.push(fx);
            let particles = fx.getComponentsInChildren(cc.ParticleSystem3D);
            for (let ps of particles) {
                ps.stop();   // đảm bảo dừng hẳn
                //ps.play();   // phát lại từ đầu
            }
        }
    }
});

module.exports = CakePoolManager;
