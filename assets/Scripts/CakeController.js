//const GameManager = require("GameManager");
const GameManager = require("GameManager");
const CakePoolManager = require("CakePoolManager");

let CakeController = cc.Class({
    extends: cc.Component,

    properties: {
        cakePieces: [cc.Component],
        cakeGroup: cc.Node,
        upEdge: cc.Node,
        rightEdge: cc.Node,
        leftEdge: cc.Node,
        downEdge: cc.Node,
        cakePiecePrefab: cc.Prefab,
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.isInCell = false;
        
        this.lastMovingPiece = null;
        this.cakeArounds = [],
        this.cakeUp = null,
        this.cakeRight = null,
        this.cakeDown = null;
        this.cakeLeft = null;
        this.parents = null;
    },

    start () {

    },

    update (dt) {

    },

    numberColorRandom(maxPiece) {
        let random = Math.floor(Math.random() * 100) // 0 - 99

        if (random <= 10) {
            return Math.min(maxPiece, 1);
        } else if (random > 10 && random <= 50) {
            return Math.min(maxPiece, 2);
        } else if (random > 50 && random <= 70) {
            return Math.min(maxPiece, 3);
        } else {
            return Math.min(maxPiece, 4);
        }
    },

    randomCakeIndex() {
        let max = 2;
        //let score = GameplayManager.instance.Data.score;
        let cakeUsing = GameManager.instance.cakeUsing;
        // if (score >= 50) {
        //     max = 3;
        // }
        // if (score >= 100) {
        //     max = 4;
        // }
        // if (score >= 150) {
        //     max = cakeUsing.length;
        // }
        max = cakeUsing.length;

        max = Math.min(max, cakeUsing.length - 1);

        let cakeIndex = Math.floor(Math.random() * max); 
        return GameManager.instance.cakeUsing[cakeIndex];
    },

    init () {
        this.isFinish = false;
        this.cakeAmount = 6;
        this.dictCakeObject = new Map();
        this.cakePieces = new Array(this.cakeAmount);
        this.isInCell = false;
        this.lastMovingPiece = null;

        let typeCakes = [];

        let numberPiece = Math.floor(Math.random() * (5 - 1)) + 1 // Random range 1 - 5
        let numberColor = this.numberColorRandom(numberPiece);

        let colors = [];
        for (let i = 0; i < numberColor; i++) {
            colors.push(this.randomCakeIndex());
        }

        for (let i = 0; i < numberPiece; i++) {
            let typeCake = colors[Math.floor(Math.random() * colors.length)];
            typeCakes.push(typeCake);
        }

        typeCakes.sort((a,b) => a - b);

        let startIndex = Math.floor(Math.random() * 6);
        let index = 0;

        for (let i = 0; i < this.cakeAmount; i++) {
            index = i + startIndex;
            if (index >= this.cakeAmount) {
                index -= this.cakeAmount;
            }

            if (i < typeCakes.length) {
                let type = typeCakes[i];
                //let pieceNode = cc.instantiate(this.cakePiecePrefab);
                //let piece = pieceNode.getComponent("PieceController");
                let cakePool = CakePoolManager.instance;
                let piece = CakePoolManager.instance.spawnCake(type);
                let pieceNode = piece.node;
                piece.Type = type;

                // Dictionary
                if (!this.dictCakeObject.has(type)) {
                    this.dictCakeObject.set(type, []);
                }

                this.dictCakeObject.get(type).push(piece);

                // Gán vào CakeGroup
                pieceNode.parent = this.cakeGroup;
                pieceNode.eulerAngles = cc.v3(0, index * 60, 0);
                pieceNode.position = cc.v3(0, 0, 0);
                //pieceNode.scale = cc.v3(1, 1, 1);

                this.cakePieces[index] = piece;
            } else {
                this.cakePieces[index] = null;
            }
        }
    },

});

module.exports = CakeController;
