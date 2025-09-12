const GameManager = require("GameManager");
const CakePoolManager = require("CakePoolManager");
const SoundManager = require("SoundManager");
const GameConstant = require("GameConstant");
const GameManagerLamDX = require("GameManagerLamDX");

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
        // this.NOT_COMPLETE_CAKE = 0;
        // this.COMPLETE_CAKE_WITH_ONLY_COLOR = 1;
        // this.COMPLETE_CAKE_WITH_OTHER_COLOR = 2;
        // this.UNCOMPLETE_CAKE_WITH_ONLY_COLOR = 3;
        // this.UNCOMPLETE_CAKE_WITH_OTHER_COLOR = 4;
        this.oriScale = this.node.scale;
        this.idSub = 0;
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

        max = Math.min(max, cakeUsing.length);

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
        this.anglePerPiece = 360 / this.cakeAmount;

        let typeCakes = [];

        let numberPiece = Math.floor(Math.random() * (5 - 1)) + 1 // Random range 1 - 5
        let numberColor = this.numberColorRandom(numberPiece);

        let colors = [];
        for (let i = 0; i < numberColor; i++) {
            colors.push(this.randomCakeIndex());
        }

        if (GameManager.instance.isShowTutorial) {
            if (GameManager.instance.isSpawnInBoard) {
                typeCakes = this.generateCakeInBoardList();
            }
            else {
                typeCakes = this.generateTutorListAndSize();
            }
        } else {
            for (let i = 0; i < numberPiece; i++) {
                let typeCake = colors[Math.floor(Math.random() * colors.length)];
                typeCakes.push(typeCake);
            }
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
                let piece = CakePoolManager.instance.spawnPiece(type);
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

    generateCakeInBoardList() {
        if (GameManagerLamDX.instance.level === 1) {
            let size = 4;
            let newList = [];
            for (let i = 0; i <size; i++) {
                newList.push(GameManagerLamDX.instance.cakeTutorial);
            }
            GameManagerLamDX.instance.cakeTutorial++;

            return newList;
        } else {
            let size = 4;
            let newList = [];
            for (let i = 0; i <size; i++) {
                newList.push(GameManagerLamDX.instance.cakeTutorial);
            }
            GameManagerLamDX.instance.cakeTutorial++;

            return newList;
        }
    },

    generateTutorListAndSize() {
        if (GameManagerLamDX.instance.level === 1) {
            let size = 4;
            let newList = [];
            newList.push(0);
            newList.push(0);
            newList.push(1);
            newList.push(1);

            return newList;
        } else {
            let size = 6;
            let newList = [];
            newList.push(0);
            newList.push(0);
            newList.push(1);
            newList.push(1);
            newList.push(2);
            newList.push(2);

            return newList;
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
        if (this._cakePieces == null) {
            let i = 0;
            i++;
        }
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
                    return { type: GameConstant.COMPLETE_CAKE_WITH_ONLY_COLOR, cake};
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
                        return {type: GameConstant.COMPLETE_CAKE_WITH_OTHER_COLOR, cake};
                    }
                }
            }
        } else {
            for (let i = 0; i < cakes.length; i++) {
                if (cakes[i].amountType === 1) {
                    cake = cakes[i];
                    return {type: GameConstant.UNCOMPLETE_CAKE_WITH_ONLY_COLOR, cake};
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
                        return {type: GameConstant.UNCOMPLETE_CAKE_WITH_OTHER_COLOR, cake};
                    }
                }
            }
        }

        if (cakes.length > 0) {
            cake = cakes[0];
        }
        return {type: GameConstant.NOT_COMPLETE_CAKE, cake};
    },

    getAngle(angle, oldAngle) {
        if (angle < 0) {
            angle += 360;
        }
        if (oldAngle < 0) {
            oldAngle += 360;
        }

        if (angle> oldAngle && angle - oldAngle > 180) {
            angle -= 360;
        }
        //cc.log("ang" + angle);
        return angle;
    },

    IEStartMoveSFX(delay) {
        this.scheduleOnce(() => {
            SoundManager.instance.soundMoveCake.play();
        }, delay);
    },

    moveCake(eulerAngle, piece, delay) {
        if (!piece.node.active) return;

        let index = this._cakePieces.indexOf(piece);
        eulerAngle = cc.v3(0, index * 60, 0);

        let oldPos = piece.node.position;
        let oldEuler = piece.node.eulerAngles;

        cc.tween(piece.node)
            .delay(delay)
            .to(0.25, { 
                position: cc.v3(0, 0, 0),
                eulerAngles: eulerAngle
            })
            .call(() => {
                if (piece === this._lastMovingPiece) {
                    this.OnCheckCompleteMove();
                }
            })
            .delay(0.5)
            .start();

        // if (!piece.node.active) return;

        // let index = this._cakePieces.indexOf(piece);
        // eulerAngle = cc.v3(0, index * this.anglePerPiece, 0);

        // piece.node.position = cc.v3(0, 0, 0);
        // piece.node.eulerAngles = eulerAngle;

        // if (piece === this.lastMovingPiece) {
        //     this.onCheckCompleteMove();
        // }
    },

    async IECompleteCake(type = -1) {
        if (type >= 0) {
            GameManager.instance.waitingCompleteCake();
        }

        cc.log(this.uuid);
        GameManager.instance.onDestroyCake(this);

        let elapsedTime = 0.2;
        while (elapsedTime > 0) {
            // giảm thời gian theo deltaTime
            elapsedTime -= cc.director.getDeltaTime();

            // scale object (giả sử node = this.node)
            let t = 1 - (elapsedTime / 0.2);
            let scaleValue = 1 + 0.2 * t;
            //this.node.setScale(scaleValue, scaleValue, scaleValue);

            // chờ 1 frame
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        this.onCompleteCake(type);
        //GameplayManager.Instance.CheckPopupStack();
    },

    onCheckCompleteMove() {
        if (amountOfType(this.lastMovingPiece.Type) >= this.cakeAmount) {
            this.onCompleteCake(this.lastMovingPiece.Type);
        }
        this.lastMovingPiece = null;
    },

    onCompleteCake(type = -1) {
        this.clearCake();
        if (this._cakePieces[0] != null && type != -1) {
            GameManager.instance.onCompleteCake(this, type);

            for (let i = 0; i < this._cakePieces.length; i++) {
                this._cakePieces[i] = null;
            }
        }
        CakePoolManager.instance.despawnCakeSlot(this);
    },

    checkFreeCake() {
        if (this.freeSlot() === this.cakeAmount || 
            (this._cakePieces[0] != null && this.amountOfType(this._cakePieces[0].Type) >= this.cakeAmount)) {
            
            GameManager.instance.setFinishProcess(false);

            // gọi coroutine IECompleteCake
            this.IECompleteCake(this._cakePieces[0] != null ? this._cakePieces[0].Type : -1);

            return true;
        }
        return false;
    },

    clearCake() {
        let go;
        let up = this.up;
        let right = this.right;

        this.freeCake();

        // if (up) {
        //     up.ClearCake();
        //     CakePoolManager.Instance.DespawnCakeSlot(up);
        // }

        // if (right) {
        //     right.ClearCake();
        //     CakePoolManager.Instance.DespawnCakeSlot(right);
        // }

        while (this.cakeGroup.childrenCount > 0) {
            go = this.cakeGroup.children[0];
            CakePoolManager.instance.despawnPiece(go.getComponent("PieceController"));
            go.parent = null;
        }
    },

    freeCake() {
        // if (this._up != null) {
        //     this._up.node.parent = null;
        //     this._up.SetParent(null);
        //     this._up = null;
        // }
        // if (this._right != null) {
        //     this._right.node.parent = null;
        //     this._right.SetParent(null);
        //     this._right = null;
        // }
        this.upEdge.active = false;
        this.rightEdge.active = false;
        this.downEdge.active = false;
        this.leftEdge.active = false;
    },
    
    async processPull(cakes, color, holdSlot = 0) {
        while (this.freeSlot() > 0 && this.freeSlot() > holdSlot && cakes.length > 0) {
            GameManager.instance.connectCake(this, cakes[0]);
            await this.pushCake(color, cakes[0], true, holdSlot);
            cakes = cakes.filter(x => x.amountOfType(color) > 0);
            this.offEdge();
        }
    },

    async pushCake(color, cake, isPushAll = true, holdSlot = 0, isMainCake = false) {
        let pieces = cake.popCake3(color, this.freeSlot() - holdSlot, isPushAll? 0 : 1);
        let number = pieces.length;

        if (number > 0) {
            let pieceSwap = [];
            let eulers = [];
            let oldEulers = [];
            let localPos = [];
            let freeIndex = -1;
            let startIndex = -1;
            let startIndex2 = -1;
            let lastPiece = null;
            let isIgnoreSwap = false;

            for (let i = 0; i < this.cakeAmount; i++) {
                if (this._cakePieces[i] != null) {
                    lastPiece = this._cakePieces[i];
                    break;
                }
            }

            for (let i = this.cakeAmount - 1; i >= 0; i--) {
                if (this._cakePieces[i] != null && this._cakePieces[i].Type === color) {
                    startIndex = i + 1;
                    if (startIndex >= this.cakeAmount) {
                        startIndex -= this.cakeAmount;
                    }
                
                    if (this._cakePieces[startIndex] == null) {
                        for (let j = 0; j < this.cakeAmount && number > 0; j++) {
                            freeIndex = startIndex + j;
                            if (freeIndex >= this.cakeAmount) freeIndex -= this.cakeAmount;

                            if (this._cakePieces[freeIndex] == null) {
                                this._cakePieces[freeIndex] = pieces[number - 1];
                                this.dictCakeObject.get(color).push(pieces[number - 1]);
                                //pieces[number - 1].node.parent = this.cakeGroup;
                                this.setParentKeepWorldPos(pieces[number - 1].node, this.cakeGroup);
                                
                                eulers.push(cc.v3(0, this.getAngle(freeIndex * this.anglePerPiece, pieces[number -1].node.eulerAngles.y), 0));
                                oldEulers.push(pieces[number - 1].node.eulerAngles.clone());
                                localPos.push(pieces[number - 1].node.position.clone());

                                number--;
                                if (number === 0) {
                                    startIndex2 = freeIndex + 1;
                                    if (startIndex2 >= this.cakeAmount) {
                                        startIndex2 -= this.cakeAmount;
                                    }
                                }
                            }
                        }
                    } else if (this._cakePieces[startIndex].Type !== color) {
                        for (let j = 0; j < this.cakeAmount; j++) {
                            freeIndex = startIndex + j;
                            if (freeIndex >= this.cakeAmount) freeIndex -= this.cakeAmount;

                            if (this._cakePieces[freeIndex] == null) {
                                isIgnoreSwap = true;
                            } else if (!isIgnoreSwap && this._cakePieces[freeIndex].Type !== color) {
                                pieceSwap.push(this._cakePieces[freeIndex]);
                            }

                            if (number > 0) {
                                this._cakePieces[freeIndex] = pieces[number -1];
                                this.dictCakeObject.get(color).push(pieces[number - 1]);
                                //pieces[number - 1].node.parent = this.cakeGroup;
                                this.setParentKeepWorldPos(pieces[number - 1].node, this.cakeGroup);

                                eulers.push(cc.v3(0, this.getAngle(freeIndex * this.anglePerPiece, pieces[number - 1].node.eulerAngles.y), 0));
                                oldEulers.push(pieces[number - 1].node.eulerAngles.clone());
                                localPos.push(pieces[number - 1].node.position.clone());

                                number--;
                                if (number ===  0) {
                                    startIndex2 = freeIndex + 1;
                                    if (startIndex2 >= this.cakeAmount) startIndex2 -= this.cakeAmount;
                                }
                            }
                        }
                    }
                }
            }
        

            for (let j = 0; j < pieceSwap.length; j++) {
                freeIndex = startIndex2 + j;
                if (freeIndex >= this.cakeAmount) freeIndex -= this.cakeAmount;
                this._cakePieces[freeIndex] = pieceSwap[j];
                this.moveCake(cc.v3(0, freeIndex * this.anglePerPiece, 0), this._cakePieces[freeIndex], j * 0.1);
            }

            // animation thời gian
            let totalTime = pieces.length * 0.5;
            let elapsedTime = -(totalTime - (pieces.length - 1) * 0.25);
            let elapsedExactTime = -totalTime;

            if (this.amountOfType(this._cakePieces.find(x => x != null).Type === this.cakeAmount)) {
                this.isFinish = true;
            }

            // for (let i = 0; i < pieces.length; i++) {
            //     pieces[i].node.stopAllActions();
            // }

            let isStartMove = false;
            let numberCakeMoveLast = pieces.length - 1;
            await new Promise(resolve => setTimeout(resolve, 1));

            let dem = -elapsedTime/cc.director.getDeltaTime();

            for (let i = 0; i < dem; i++) {
                //await new Promise(resolve => setTimeout(resolve, 0)); // chờ 1 frame
                // await new Promise(resolve => {
                //     cc.director.once(cc.Director.EVENT_AFTER_UPDATE, resolve);
                // });
            }

            while (elapsedTime < 0) {
                elapsedTime += cc.director.getDeltaTime();
                elapsedExactTime += cc.director.getDeltaTime();

                //await new Promise(resolve => setTimeout(resolve, 400)); // chờ 1 frame
                //await this.delaySec(0);
                await new Promise(resolve => {
                    cc.director.once(cc.Director.EVENT_AFTER_UPDATE, resolve);
                });

                for (let i = 0; i < pieces.length; i++) {
                    if (!isStartMove) {
                        this.IEStartMoveSFX(i * 0.25);
                        //GameManager.instance.scheduleOnce(() => {
                            //GameManager.instance.playMoveSFX();
                        //}, i * 0.25);
                    }

                    let value = Math.min(((totalTime + elapsedExactTime) - i * 0.25)/ 0.5, 1);
                    value = Math.max(0, value);

                    let pos = cc.v3();
                    cc.Vec3.lerp(pos, localPos[i], cc.v3(0, 0, 0), value);
                    let eul = oldEulers[i];
                    cc.Vec3.lerp(eul, oldEulers[i], eulers[i], value);
                    pieces[numberCakeMoveLast - i].node.position = pos;// cc.v3().lerp(localPos[i], cc.v3(0, 0, 0), value);
                    pieces[numberCakeMoveLast - i].node.eulerAngles = eul;// = cc.v3().lerp(oldEulers[i], eulers[i], value);
                }
                isStartMove = true;
            }

            for (let i = 0; i < pieces.length; i++) {
                pieces[numberCakeMoveLast - i].node.position = cc.v3(0, 0, 0);
                pieces[numberCakeMoveLast - i].node.eulerAngles = eulers[i];
            }

            if (cake.checkFreeCake()) { //&& isMainCake
                this.offEdge();
            }
            this.checkFreeCake();
        }
    },

    setParentKeepWorldPos(node, newParent) {
        if (!newParent) return;

        let worldPos = node.convertToWorldSpaceAR(cc.v3(0, 0, 0));

        node.parent = newParent;

        node.position = newParent.convertToNodeSpaceAR(worldPos);
    },

    offEdge() {
        this.upEdge.active = false;
        this.rightEdge.active = false;
        this.leftEdge.active = false;
        this.downEdge.active = false;
    },

    // pushToCake(cake, color) {
    //     let pieces = this._cakePieces.filter(x => x && x.Type === color);
    //     for (let i = 0; i < pieces.length; i++) {
    //         cake.addPiece(pieces[i]);
    //         let index = this._cakePieces.indexOf(pieces[i]);
    //         this._cakePieces[index] = null;
    //     }
    // },

    // addPiece(piece) {
    //     this.dictCakeObject.get(piece.Type).push(piece);

    //     // Gán vào CakeGroup
    //     piece.node.parent = this.cakeGroup;
    //     piece.node.position = cc.v3(0, 0, 0);
    //     //pieceNode.scale = cc.v3(1, 1, 1);

    //     for (let i = 0; i < this._cakePieces.length; i++) {
    //         if (this._cakePieces[i] == null) {
    //             this._cakePieces[i] = piece;
    //             piece.node.eulerAngles = cc.v3(0, i * 60, 0);
    //             break;
    //         }
    //     }
    //     //this._cakePieces[(6 - this.freeSlot())] = piece;
    // },

    connectEdge(direction) {
        switch (direction) {
            case 0:
                this.upEdge.active = true;
                break;
            case 1:
                this.rightEdge.active = true;
                break;
            case 2:
                this.leftEdge.active = true;
                break;
            case 3:
                this.downEdge.active = true;
                break;
        }
    },

    async connectAround(cakeArounds) {
        this.isInCell = true;
        let pieces = this._cakePieces.filter(x => x != null);
        let colors = this.getColors();
        let indexColor = 0;
        let cakeVisible = null;
        let cakeCheckings = [];
        let cakeSameType = [];
        let colorCount = 0;
        let dem = 0;
        //let cakeArounds = cakeAroundsOri;

        await new Promise(resolve => setTimeout(resolve, 160));
        //this.connectArround1(cakeArounds, colors, indexColor, cakeVisible, cakeCheckings, cakeSameType, colorCount)

        while (this.node.active && colors.length > 0 && indexColor < colors.length && this.freeSlot() < this.cakeAmount && !this.isFinish && dem < 10000) {
            dem++;
            let t = this.freeSlot();
            colors = this.getColors();
            if (colorCount !== colors.length) {
                colorCount = colors.length;
                indexColor = 0;
            }

            cakeSameType = cakeArounds
                .filter(x => x && x.node.active && !x.isFinish && x.freeSlot() < this.cakeAmount && x.amountOfType(colors[indexColor]) > 0 && x.amountOfType(colors[indexColor]) < this.cakeAmount)
                .sort((a, b) => b.amountOfType(colors[indexColor]) - a.amountOfType(colors[indexColor]));

            let check = 1;
            if (cakeSameType.length === 0) {
                indexColor++;
                if (indexColor >= colors.length) {
                    let c = 1;
                    break;
                }
                continue;
            }

            await new Promise(resolve => setTimeout(resolve, 0));

            if (this.amountType() === 1) {
                cakeCheckings = cakeSameType
                    .filter(x => x && cc.isValid(x) && !x.isFinish && x.amountOfType(colors[indexColor]) > 0)
                    .sort((a, b) => a.amountType() - b.amountType() || b.amountOfType(colors[indexColor]) - a.amountOfType(colors[indexColor]));
                
                let complete = this.isCanCompleteCake(cakeCheckings, colors[indexColor]);
                let completeType = complete.type;
                cakeVisible = complete.cake;

                //this.pushToCake(cakeVisible, colors[indexColor]);

                if (completeType == GameConstant.COMPLETE_CAKE_WITH_ONLY_COLOR) {
                    await this.processPull(cakeCheckings.filter(x => x !== cakeVisible), colors[indexColor], 1);

                    cakeCheckings = cakeCheckings.filter(x => cc.isValid(x) && x !== cakeVisible && x.amountOfType(colors[indexColor]) > 0);

                    if (cakeCheckings.length > 0) {
                        if (this.amountOfType(colors[indexColor]) === 1) {
                            let isPushed = false;
                            let colorPush = this.getColors().filter(c => c !== colors[indexColor]);
                            for (let i = 0; i < colorPush.length; i++) {
                                let cakeCheckPush = cakeArounds.find(x => x.amountOfType(colorPush[i]) > 0 && x.freeSlot() > 0 && x !== cakeVisible);
                                if (cakeCheckPush) {
                                    await cakeCheckPush.pushCake(colorPush[i], this, false);
                                    isPushed = true;
                                    break;
                                }
                            }
                            if (!isPushed) {
                                await cakeVisible.pushCake(colors[indexColor], this);
                            }
                        } else {
                            GameManager.instance.connectCake(this, cakeVisible);
                            await cakeVisible.pushCake(colors[indexColor], this, false);
                            this.offEdge();
                        }
                    } else {
                        GameManager.instance.connectCake(this, cakeVisible);
                        await cakeVisible.pushCake(colors[indexColor], this, true);
                        this.offEdge();
                    }
                } else {
                    for (let i = 0; i < cakeSameType.length; i++) {
                        GameManager.instance.connectCake(this, cakeSameType[i]);
                        await this.pushCake(colors[0], cakeSameType[i], true, 0, true);
                        this.offEdge();
                        if (this.isFinish) break;
                    }
                }
            } else {
                cakeCheckings = cakeSameType
                    .filter(x => x && cc.isValid(x) && !x.isFinish && x.amountOfType(colors[indexColor]) > 0)
                    .sort((a, b) => {
                        if (a.amountType() !== b.amountType()) return a.amountType() - b.amountType();
                        return b.amountOfType(colors[indexColor]) - a.amountOfType(colors[indexColor]);
                    });

                let complete = this.isCanCompleteCake(cakeCheckings, colors[indexColor], c => cakeVisible = c);
                let completeType = complete.type;
                cakeVisible = complete.cake;

                switch (completeType) {
                    case GameConstant.UNCOMPLETE_CAKE_WITH_ONLY_COLOR:
                    case GameConstant.COMPLETE_CAKE_WITH_ONLY_COLOR:
                        await this.processPull(cakeCheckings.filter(x => x !== cakeVisible), colors[indexColor]);
                        cakeCheckings = cakeCheckings.filter(x => cc.isValid(x) && x !== cakeVisible && x.amountOfType(colors[indexColor]) > 0);

                        GameManager.instance.connectCake(this, cakeVisible);
                        if (cakeCheckings.length > 0) {
                            await cakeVisible.pushCake(colors[indexColor], this, false);
                        } else {
                            await cakeVisible.pushCake(colors[indexColor], this, true);
                        }
                        this.offEdge();
                        indexColor--;
                        break;

                    case GameConstant.UNCOMPLETE_CAKE_WITH_OTHER_COLOR:
                    case GameConstant.COMPLETE_CAKE_WITH_OTHER_COLOR:
                        let cakeColorPull = cakeVisible.getColors().find(x => x !== colors[indexColor]);
                        if (colors.includes(cakeColorPull)) {
                            if (this.freeSlot() > 0) {
                                if (cakeVisible.freeSlot() > 0) {
                                    await this.processPull(cakeCheckings.filter(x => x !== cakeVisible), colors[indexColor]);
                                    //await cakeVisible.processPull(cakeCheckings.filter(x => x !== cakeVisible), colors[indexColor]);
                                }
                                GameManager.instance.connectCake(this, cakeVisible);
                                await this.pushCake(cakeColorPull, cakeVisible, true, 0, true);
                                this.offEdge();
                                indexColor--;
                            } else if (cakeVisible.freeSlot() > 0) {
                                GameManager.instance.connectCake(cakeVisible, this);
                                await cakeVisible.pushCake(cakeColorPull, this, true, 0, true);
                                cakeVisible.offEdge();
                                indexColor--;
                            }
                        } else {
                            if (cakeVisible && cakeVisible.freeSlot() > 0) {
                                cakeCheckings = cakeCheckings.filter( x => cc.isValid(x) && x.amountOfType(colors[indexColor]) > 0 && x !== cakeVisible);
                                if (cakeCheckings.length > 0) {
                                    await this.processPull(cakeCheckings.filter(x => x !== cakeVisible), colors[indexColor]);
                                    await cakeVisible.pushCake(colors[indexColor], this, false);
                                } else {
                                    GameManager.instance.connectCake(this, cakeVisible);
                                    await cakeVisible.pushCake(colors[indexColor], this, true);
                                }
                                this.offEdge();
                                indexColor--;
                            }
                        }
                        break;

                    case GameConstant.NOT_COMPLETE_CAKE:
                        if (cakeVisible && cakeVisible.freeSlot() > 0) {
                            cakeCheckings = cakeCheckings.filter(x => cc.isValid(x) && x.amountOfType(colors[indexColor]) > 0 && x !== cakeVisible);
                            if (cakeCheckings.length > 0) {
                                await this.processPull(cakeCheckings.filter(x => x !== cakeVisible), colors[indexColor]);
                                await cakeVisible.pushCake(colors[indexColor], this, false);
                            } else {
                                GameManager.instance.connectCake(this, cakeVisible);
                                await cakeVisible.pushCake(colors[indexColor], this, true);
                            }
                            this.offEdge();
                            indexColor--;
                        }
                        break;
                }
                indexColor++;
            }

            if (colors.length > 0 && indexColor < colors.length) {
                let cc = 1;
            }
            let free = this.freeSlot(); 
            let am = this.cakeAmount;  
            let fn = !this.isFinish;
            let tt = 1;
        }
        let c = dem;
        c++;
        GameManager.instance.endProcessCake(this);
        GameManager.instance.checkLose();
        this.offEdge();
    },

    async connectArround1(_cakesAround, colors, indexColor, cakeVisible, cakeCheckings, cakeSameType, colorCount) {
        let breakWhile = false;
        let continueWhile = false;
        if (!this.node.active) {
            breakWhile = true;
        }
        if (colors.length > 0 && indexColor < colors.length && this.freeSlot() < this.cakeAmount && !this.isFinish) {
            colors = this.getColors();
            if (colorCount !== colors.length) {
                colorCount = colors.length;
                indexColor = 0;
            }

            cakeSameType = _cakesAround
                .filter(x => x && x.node.active && !x.isFinish && x.freeSlot() < this.cakeAmount &&
                    x.amountOfType(colors[indexColor]) > 0 &&
                    x.amountOfType(colors[indexColor]) < this._cakeAmount)
                .sort((a, b) => b.amountOfType(colors[indexColor]) - a.amountOfType(colors[indexColor]));

            if (cakeSameType.length === 0) {
                indexColor++;
                if (indexColor >= colors.length) {
                    breakWhile = true;
                }
                if (!breakWhile) {
                    continueWhile = true;
                }
            }

            if (!breakWhile && !continueWhile) {
                await new Promise(resolve => setTimeout(resolve, 0)); // yield return null

                if (this.amountType() === 1) {
                    cakeCheckings = cakeSameType
                        .filter(x => x && x.node.active && !x.isFinish && x.amountOfType(colors[indexColor]) > 0)
                        .sort((a, b) => {
                            if (a.amountType() === b.amountType()) {
                                return b.amountOfType(colors[indexColor]) - a.amountOfType(colors[indexColor]);
                            }
                            return a.amountType() - b.amountType();
                        });

                    let complete = this.isCanCompleteCake(cakeCheckings, colors[indexColor]);
                    let completeType = complete.type;
                    cakeVisible = complete.cake;

                    if (completeType === GameConstant.COMPLETE_CAKE_WITH_ONLY_COLOR) {
                        await this.processPull(
                            cakeCheckings.filter(x => x !== cakeVisible),
                            colors[indexColor],
                            1
                        );

                        cakeCheckings = cakeCheckings.filter(x => x !== cakeVisible && x.amountOfType(indexColor) > 0);

                        if (cakeCheckings.length > 0) {
                            if (this.amountOfType(colors[indexColor]) === 1) {
                                let isPushed = false;
                                let colorPush = this.getColors().filter(x => x !== colors[indexColor]);
                                for (let i = 0; i < colorPush.length; i++) {
                                    let cakeCheckPush = _cakesAround.find(x =>
                                        x.amountOfType(colorPush[i]) > 0 &&
                                        x.freeSlot() > 0 &&
                                        x !== cakeVisible
                                    );
                                    if (cakeCheckPush) {
                                        await cakeCheckPush.pushCake(colorPush[i], this, false);
                                        isPushed = true;
                                        break;
                                    }
                                }
                                if (isPushed) {
                                    continueWhile = true;
                                } else {
                                    await cakeVisible.pushCake(colors[indexColor], this);
                                }
                            } else {
                                GameManager.instance.connectCake(this, cakeVisible);
                                await cakeVisible.pushCake(colors[indexColor], this, false);
                                this.offEdge();
                            }
                        } else {
                            GameManager.instance.connectCake(this, cakeVisible);
                            await cakeVisible.pushCake(colors[indexColor], this, true);
                            this.offEdge();
                        }
                    } else {
                        for (let i = 0; i < cakeSameType.length; i++) {
                            GameplayManager.Instance.connectCake(this, cakeSameType[i]);
                            await this.pushCake(colors[0], cakeSameType[i], true, 0, true);
                            this.offEdge();
                            if (this.isFinish) {
                                break;
                            }
                        }
                    }
                } else {
                    cakeCheckings = cakeSameType
                        .filter(x => x && x.node.active && !x.isFinish && x.amountOfType(colors[indexColor]) > 0)
                        .sort((a, b) => {
                            if (a.amountType() === b.amountType()) {
                                return b.amountOfType(colors[indexColor]) - a.amountOfType(colors[indexColor]);
                            }
                            return a.amountType() - b.amountType();
                        });

                    let complete = this.isCanCompleteCake(cakeCheckings, colors[indexColor]);
                    let completeType = complete.type;
                    cakeVisible = complete.cake;

                    switch (completeType) {
                        case GameConstant.UNCOMPLETE_CAKE_WITH_ONLY_COLOR:
                        case GameConstant.COMPLETE_CAKE_WITH_ONLY_COLOR:
                            await this.processPull(cakeCheckings.filter(x => x !== cakeVisible), colors[indexColor]);
                            cakeCheckings = cakeCheckings.filter(x => x !== cakeVisible && x.amountOfType(colors[indexColor]) > 0);
                            GameManager.instance.connectCake(this, cakeVisible);
                            await cakeVisible.pushCake(colors[indexColor], this, cakeCheckings.length === 0);
                            this.offEdge();
                            indexColor--;
                            break;

                        case GameConstant.UNCOMPLETE_CAKE_WITH_OTHER_COLOR:
                        case GameConstant.COMPLETE_CAKE_WITH_OTHER_COLOR:
                            let cakeColorPull = cakeVisible.getColors().find(x => x !== colors[indexColor]);
                            if (colors.includes(cakeColorPull)) {
                                if (cakeVisible.freeSlot() > 0) {
                                    await this.processPull(cakeCheckings.filter(x => x !== cakeVisible), colors[indexColor]);
                                }
                                GameManager.instance.connectCake(this, cakeVisible);
                                await this.pushCake(cakeColorPull, cakeVisible, true, 0, true);
                                this.offEdge();

                                cakeCheckings = cakeCheckings.filter(x => x.amountOfType(colors[indexColor]) > 0 && x !== cakeVisible);
                                if (cakeCheckings.length > 0) {
                                    if (this.amountOfType(colors[indexColor]) === 1) {
                                        let isPushed = false;
                                        let colorPush = this.getColors().filter(x => x !== colors[indexColor]);
                                        for (let i = 0; i < colorPush.length; i++) {
                                            let cakeCheckPush = _cakesAround.find(x =>
                                                x && x.amountOfType(colorPush[i]) > 0 &&
                                                x.freeSlot() > 0 &&
                                                x !== cakeVisible
                                            );
                                            if (cakeCheckPush) {
                                                await cakeCheckPush.pushCake(colorPush[i], this, false);
                                                isPushed = true;
                                                break;
                                            }
                                        }
                                        if (isPushed) {
                                            continueWhile = true;
                                        } else {
                                            await cakeVisible.pushCake(colors[indexColor], this);
                                        }
                                    } else {
                                        GameManager.instance.connectCake(this, cakeVisible);
                                        await cakeVisible.pushCake(colors[indexColor], this, false);
                                        this.offEdge();
                                        indexColor--;
                                    }
                                } else {
                                    GameManager.instance.connectCake(this, cakeVisible);
                                    await cakeVisible.pushCake(colors[indexColor], this, true);
                                    this.offEdge();
                                    indexColor--;
                                }
                            } else {
                                if (cakeVisible && cakeVisible.freeSlot() > 0) {
                                    cakeCheckings = cakeCheckings.filter(x => x.amountOfType(colors[indexColor]) > 0 && x !== cakeVisible);
                                    if (cakeCheckings.length > 0) {
                                        await this.processPull(cakeCheckings.filter(x => x !== cakeVisible), colors[indexColor]);
                                        await cakeVisible.pushCake(colors[indexColor], this, false);
                                        this.offEdge();
                                        indexColor--;
                                    } else {
                                        GameManager.instance.connectCake(this, cakeVisible);
                                        await cakeVisible.pushCake(colors[indexColor], this, true);
                                        this.offEdge();
                                        indexColor--;
                                    }
                                }
                            }
                            break;

                        case GameConstant.NOT_COMPLETE_CAKE:
                            if (cakeVisible && cakeVisible.FreeSlot() > 0) {
                                cakeCheckings = cakeCheckings.filter(x => x.amountOfType(colors[indexColor]) > 0 && x !== cakeVisible);
                                if (cakeCheckings.length > 0) {
                                    await this.processPull(cakeCheckings.filter(x => x !== cakeVisible), colors[indexColor]);
                                    await cakeVisible.pushCake(colors[indexColor], this, false);
                                    this.offEdge();
                                    indexColor--;
                                } else {
                                    if (cakeVisible.freeSlot() === 0) {
                                        indexColor++;
                                        continueWhile = true;
                                    }
                                    if (!continueWhile) {
                                        GameManager.instance.connectCake(this, cakeVisible);
                                        await cakeVisible.pushCake(colors[indexColor], this, true);
                                        this.offEdge();
                                        indexColor--;
                                    }
                                }
                            }
                            break;
                    }

                    if (!continueWhile) {
                        indexColor++;
                    }
                }
            }
        }

        if (!continueWhile) {
            if (colors.length > 0 && indexColor < colors.length && this.freeSlot() < this.cakeAmount && !this.isFinish) {
                this.connectArround1(_cakesAround, colors, indexColor, cakeVisible, cakeCheckings, cakeSameType, colorCount);
            } else {
                GameManager.instance.checkLose();
                this.offEdge();
            }
        } else {
            this.connectArround1(_cakesAround, colors, indexColor, cakeVisible, cakeCheckings, cakeSameType, colorCount);
        }
    },

    delaySec(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    },

    popCake3(color, number, holdCake = 0) {
        let pieces = [];
        let startIndex = -1;
        let isNeedSnap = true;
        let checkIndex = 0;
        let maxClockWise = Number.MIN_SAFE_INTEGER;
        let maxNotClockWise = Number.MIN_SAFE_INTEGER;
        let isBreakCheck = false;
        let isClockWise = true;
        let isStopCheckClockWise = false;
        let isStopCheckNotClockWise = false;

        for(let i = 0; i < this.cakeAmount; i++) {
            if (this._cakePieces[i] && this._cakePieces[i].Type === color) {
                for (let j = 0; j < this.cakeAmount; j++) {
                    if (!isStopCheckClockWise) {
                        checkIndex = i - j;
                        if (checkIndex < 0) checkIndex += this.cakeAmount;
                        if (this._cakePieces[checkIndex] == null) {
                            isNeedSnap = false;
                            isClockWise = true;
                            isBreakCheck = true;
                            break;
                        } else if (this._cakePieces[checkIndex].Type !== color) {
                            isStopCheckClockWise = true;
                        }
                        maxClockWise = checkIndex;
                    }

                    if (!isStopCheckNotClockWise) {
                        checkIndex = i + j;
                        if (checkIndex >= this.cakeAmount) checkIndex -= this.cakeAmount;

                        if (this._cakePieces[checkIndex] == null) {
                            isNeedSnap = false;
                            isClockWise = false;
                            isBreakCheck = true;
                            break;
                        } else if (this._cakePieces[checkIndex].Type !== color) {
                            isStopCheckNotClockWise = true;
                        }
                        maxNotClockWise = checkIndex;
                    }
                }
                if (isBreakCheck) break;
            }
        }

        for (let i = 0; i < this.cakeAmount; i++) {
            if (isClockWise) {
                checkIndex = maxClockWise + i;
                if (checkIndex >= this.cakeAmount) checkIndex -= this.cakeAmount;
            } else {
                checkIndex = maxNotClockWise - i;
                if (checkIndex  < 0) checkIndex += this.cakeAmount;
            }

            if (number > 0 && this.amountOfType(color) > holdCake) {
                if (this._cakePieces[checkIndex] && this._cakePieces[checkIndex].Type === color) {
                    pieces.push(this._cakePieces[checkIndex]);
                    let listPieceColor = this.dictCakeObject.get(color);
                    let idx = listPieceColor.indexOf(this._cakePieces[checkIndex]);
                    if (idx >= 0) this.dictCakeObject.get(color).splice(idx, 1);
                    this._cakePieces[checkIndex] = null;
                    number--;
                    if (startIndex < 0) startIndex = checkIndex;
                }
            }
        }

        if (isNeedSnap && startIndex >= 0) {
            let count = 0;
            let freeIndex = -1;
            let isStartSnap = false;

            for (let i = 0; i < this.cakeAmount; i++) {
                freeIndex = startIndex + i;
                if (freeIndex >= this.cakeAmount) freeIndex -= this.cakeAmount;

                if (this._cakePieces[freeIndex]) {
                    checkIndex = startIndex + count;
                    if (checkIndex >= this.cakeAmount) checkIndex -= this.cakeAmount;

                    this._cakePieces[checkIndex] = this._cakePieces[freeIndex];
                    this._cakePieces[freeIndex] = null;

                    this.moveCake(
                        cc.v3(0, this.getAngle(freeIndex * this.anglePerPiece, this._cakePieces[checkIndex].node.eulerAngles.y), 0),
                        this._cakePieces[checkIndex],
                        count * 0.1
                    );
                    count++;
                    isStartSnap = true;
                } else if (isStartSnap) {
                    break;
                }
            }
        }
        return pieces;
    },

    //async 
    return(pos) {
        // Dừng tween cũ nếu có
        this.node.stopAllActions();

        let oldPos = this.node.position;
        let distance = oldPos.sub(pos).mag();  // Vector3.Distance
        let totalTime = distance / 5;         // tính thời gian giống Unity

        cc.tween(this.node)
            .to(totalTime, { position: pos })  // move từ oldPos -> pos
            .start();
        // let oldPos = this.node.position.clone();
        // let distance = oldPos.sub(pos).mag();
        // let totalTime = distance / 5;  
        // let elapsedTime = totalTime;

        // while (elapsedTime > 0) {
        //     await new Promise(resolve => setTimeout(resolve, 0)); // tương đương yield null
        //     let dt = cc.director.getDeltaTime();                  // giống Time.deltaTime
        //     elapsedTime -= dt;

        //     let t = 1 - (elapsedTime / totalTime);
        //     let newPos = oldPos.lerp(pos, t);
        //     this.node.setPosition(newPos);
        // }
    },

    IEBounce() {
        //let oriScale = this.node.scale;

        cc.tween(this.node)
            .to(0.05, { scale: this.oriScale * 1.1 }) // scale lên
            .to(0.05, { scale: this.oriScale })       // scale về lại
            .call(() => {
                this.node.setScale(this.oriScale);
            })
            .start();
        },

});

module.exports = CakeController;
