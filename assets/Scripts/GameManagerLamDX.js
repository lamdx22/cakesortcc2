
let GameManagerLamDX = cc.Class({
    extends: cc.Component,

    properties: {
        cells1: [cc.Node],
        cells: [cc.Node],
        handTut1: cc.Node,
        handTut2: cc.Node,
        cakePrefab: cc.Prefab,
        maxComplete: 20,
        maxPut: 4,
        bgD: cc.Node,
        bgN: cc.Node,
        cam: cc.Camera,
        fxWin: cc.Node,
        tableSub: cc.Node,
        subXoay: [cc.Node],
        subStatic: [cc.Node],
        rotateDuration: 2,
        useTextFX: true,
        maxScore: 70,
        isNewCakePopUp: true,
        isLimitPut: false,
        level: 1,
    },

    statics: {
        instance: null,
    },

    onLoad () {
        GameManagerLamDX.instance = this;

        this.countPut = 0;
        this.countComplete = 0;
        this.countSpawnCake = 0;
        this.isGameEnd = false;
        this.isCanMove = true;
        this.isFirstHand2 = false;
        this.isShowTutorial = false;
        this.cakeSub = [];
        this.cakeTutorial = 0;
        this.vec30 = cc.v3(0, 28, 0);
        this.vec31 = cc.v3(0, 28, 0);
        this.vec32 = cc.v3(0, 28, 0);

        // FrameSize
        let frameSize = cc.view.getFrameSize();
        this.width = frameSize.width;
        this.height = frameSize.height;
        this.onResize();

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

    start () {

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

    onCompleteCake() {
        this.countComplete++;
        if (this.countComplete >= this.maxComplete) {
            this.endGame();
        }
    },

    onPutCake() {
        this.countPut++;
        if (this.isShowTutorial) this.hideTutorial();
        if (this.isLimitPut && this.countPut >= this.maxPut) {
            this.endGame();
        }
    },

    playRotateTable(id = -1) {
        if (this.handTut && !this.isFirstHand2 && this.level === 2) {
            this.isFirstHand2 = true;
            //this.arrow2.active = true;
            this.handTut.active = true;
        }

        this.isCanMove = false;

        // if (id == 0) {
        //     this.tableSub.eulerAngles = cc.v3(-90, -28, 0);
        // } else if (id == 1) {
        //     this.tableSub.eulerAngles = cc.v3(-90, -56, 0);
        // } else {
        //     this.tableSub.eulerAngles = cc.v3(-90, -84, 0);
        // }

        let targetRotation = null;
        if (id === 0) { // || id === -1) {
            targetRotation = this.vec30;
        } else if (id === 1) {
            targetRotation = this.vec31;
        } else if (id === 2) {
            targetRotation = this.vec32;
        } else {
            targetRotation = cc.v3(0, 84, 0);
        }

        if (targetRotation) {
            cc.tween(this.tableSub)
                .by(this.rotateDuration, { eulerAngles: targetRotation })
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
            .by(this.rotateDuration, { eulerAngles: cc.v3(0, 84, 0) })
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

        //await new Promise(resolve => setTimeout(resolve, 400));

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

    endGame() {
        this.isGameEnd = true;
        cc.log("Game End");
    },

    goToStore() {
        cc.log("Go To Store");
    }

});
