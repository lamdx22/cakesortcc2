//const GameManager = require("GameManager");
const GameManager = require("GameManager");
const CakePoolManager = require("CakePoolManager");

let CakeController = cc.Class({
    extends: cc.Component,

    properties: {
        //cakePieces: [cc.Component],
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
        this._cakePieces = [],
        this.cakeUp = null,
        this.cakeRight = null,
        this.cakeDown = null;
        this.cakeLeft = null;
        this.parents = null;
        this.NOT_COMPLETE_CAKE = 0;
        this.COMPLETE_CAKE_WITH_ONLY_COLOR = 1;
        this.COMPLETE_CAKE_WITH_OTHER_COLOR = 2;
        this.UNCOMPLETE_CAKE_WITH_ONLY_COLOR = 3;
        this.UNCOMPLETE_CAKE_WITH_OTHER_COLOR = 4;
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
        this._cakePieces = new Array(this.cakeAmount);
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

                this._cakePieces[index] = piece;
            } else {
                this._cakePieces[index] = null;
            }
        }
    },

    amountType() {
        return this.getColors().length;
    },

    getColors() {
        //let list = this._cakePieces.filter(x => x != null).map(x => x.Type);
        let list = Array.from(
            new Set(
                this._cakePieces
                    .filter(x => x != null)
                    .map(x => x.Type)
            )
        );
        return list;
    },

    freeSlot() {
        return this._cakePieces.filter(x => x == null).length;
    },

    amountOfType(type) {
        return this._cakePieces.filter(x => x != null && x.Type === type).length;
    },

    isCanCompleteCake(cakes, color) {
        let cake = null;
        let totalCake = cakes.reduce((sum, x) => sum + x.amountOfType(color), 0) + this.amountOfType(color);

        if (totalCake >= 6) {
            for (let i = 0; i < cakes.length; i++) {
                if (cakes[i].amountType() === 1) {
                    cake = cakes[i];
                    return { type: this.COMPLETE_CAKE_WITH_ONLY_COLOR, cake};
                } else {
                    let isCanPullColor = false;
                    let colors = cakes[i].getColors();
                    for (let j = 0; j < colors.length; j++) {
                        if (this.amountOfType(colors[j]) > 0) {
                            cake = cakes[i];
                            isCanPullColor = true;
                            break;
                        }
                    }
                    if (isCanPullColor) {
                        return {type: this.COMPLETE_CAKE_WITH_OTHER_COLOR, cake};
                    }
                }
            }
        } else {
            for (let i = 0; i < cakes.length; i++) {
                if (cakes[i].amountType === 1) {
                    cake = cakes[i];
                    return {type: this.UNCOMPLETE_CAKE_WITH_ONLY_COLOR, cake};
                } else {
                    let isCanPullColor = false;
                    let colors = cakes[i].getColors();
                    for (let j = 0; j < colors.length; j ++) {
                        if (this.amountOfType(colors[j]) > 0) {
                            cake = cakes[i];
                            if (colors[j] !== color) {
                                isCanPullColor = true;
                                break;
                            }
                        }
                    }
                    if (isCanPullColor) {
                        return {type: this.UNCOMPLETE_CAKE_WITH_OTHER_COLOR, cake};
                    }
                }
            }
        }

        if (cakes.length > 0) {
            cake = cakes[0];
            return {type: this.NOT_COMPLETE_CAKE, cake};
        }
    },

    pushToCake(cake, color) {
        let pieces = this._cakePieces.filter(x => x && x.Type === color);
        for (let i = 0; i < pieces.length; i++) {
            cake.addPiece(pieces[i]);
            let index = this._cakePieces.indexOf(pieces[i]);
            this._cakePieces[index] = null;
        }
    },

    addPiece(piece) {
        this.dictCakeObject.get(piece.Type).push(piece);

        // Gán vào CakeGroup
        piece.node.parent = this.cakeGroup;
        piece.node.position = cc.v3(0, 0, 0);
        //pieceNode.scale = cc.v3(1, 1, 1);

        for (let i = 0; i < this._cakePieces.length; i++) {
            if (this._cakePieces[i] == null) {
                this._cakePieces[i] = piece;
                piece.node.eulerAngles = cc.v3(0, i * 60, 0);
                break;
            }
        }
        //this._cakePieces[(6 - this.freeSlot())] = piece;
    },

    //async 
    connectAround(cakeArounds) {
        this.isInCell = true;
        let pieces = this._cakePieces.filter(x => x != null);
        let colors = this.getColors();
        let indexColor = 0;
        let cakeVisible = null;
        let cakeCheckings = [];
        let cakeSameType = [];
        let colorCount = 0;
        let dem = 0;

        //await new Promise(resolve => setTimeout(resolve, 160));

        while (colors.length > 0 && indexColor < colors.length && this.freeSlot() < this.cakeAmount && !this.isFinish && dem < 100) {
            dem++;
            colors = this.getColors();
            if (colorCount !== colors.length) {
                colorCount = colors.length;
                indexColor = 0;
            }

            cakeSameType = cakeArounds
                .filter(x => x && !x.isFinish && x.freeSlot() < this.cakeAmount && x.amountOfType(colors[indexColor]) > 0 && x.amountOfType(colors[indexColor]) < this.cakeAmount)
                .sort((a, b) => b.amountOfType(colors[indexColor]) - a.amountOfType(colors[indexColor]));

            if (cakeSameType.length === 0) {
                indexColor++;
                if (indexColor >= colors.length) break;
                continue;
            }

            //await new Promise(resolve => setTimeout(resolve, 0));

            if (this.amountType() === 1) {
                cakeCheckings = cakeSameType
                    .filter(x => x && !x.isFinish && x.amountOfType(colors[indexColor]) > 0)
                    .sort((a, b) => a.amountType() - b.amountType() || b.amountOfType(colors[indexColor]) - a.amountOfType(colors[indexColor]));
                
                let complete = this.isCanCompleteCake(cakeCheckings, colors[indexColor]);
                let completeType = complete.type;
                cakeVisible = complete.cake;

                this.pushToCake(cakeVisible, colors[indexColor]);

                if (completeType == this.COMPLETE_CAKE_WITH_ONLY_COLOR) {
                    //await this.Pro
                }
            }
        }
    }

});

module.exports = CakeController;
