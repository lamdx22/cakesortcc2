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
        }
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

        this.poolCakes = {};
        this._cakeSlotCycle = [];
        this._pieceCycle = {};
    },

    start () {

    },

    spawnCake(index) {
        if (!this._pieceCycle[index]) {
            this._pieceCycle[index] = [];
        }

        if (this._pieceCycle[index].length === 0) {
            let pieceNode = cc.instantiate(this.piecePrefabs[index]);
            //let pieceNode = cc.instantiate(this.piecePrefabs[0]);
            let piece = pieceNode.getComponent("PieceController");
            this._pieceCycle[index].push(piece);
        }

        let piece = this._pieceCycle[index][0];
        this._pieceCycle[index].splice(0, 1);
        piece.node.active = true;
        return piece;
    },

    despawnCakeSlot(cake) {
        cake.node.destroy();
        //this._cakeSlotCycle.push(cake);
    },

    despawnPiece(piece) {
        piece.node.destroy();
        //this._pieceCycle[piece.Type].push(piece);
    }
});

module.exports = CakePoolManager;
