
let GameManagerLamDX = cc.Class({
    extends: cc.Component,

    properties: {
        cells1: [cc.Node],
        cells: [cc.Node],
        handTut: cc.Node,
        cakePrefab: cc.Prefab,
        maxMerger: 50,
        maxPut: 80,
        bgD: cc.Node,
        bgN: cc.Node,
        cam: cc.Camera,
        fxWin: cc.Node,
        tableSub: cc.Node,
        subXoay: [cc.Node],
        subStatic: [cc.Node],
    },

    statics: {
        instance: null,
    },

    onLoad () {
        GameManagerLamDX.instance = this;

        this.countPut = 0;
        this.countMerger = 0;
        this.isGameEnd = false;
        this.isCanMove = true;
        this.isFirstHand2 = false;
        this.cakeSub = [];
        this.level = 1;
        this.vec30 = cc.v3(-90, -30, 0);
        this.vec31 = cc.v3(-90, 208, 0);
        this.vec32 = cc.v3(-90, 236, 0);

        // FrameSize
        let frameSize = cc.view.getFrameSize();
        this.width = frameSize.width;
        this.height = frameSize.height;
        this.onResize();

        //this.tableSub.eulerAngles = cc.v3(-90, 359, 0);
        this.tableSub.eulerAngles = cc.v3(-90, 263, 0);
        this.playRotateTable1();
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

    // update (dt) {},

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
            //ps.stop();   // đảm bảo dừng hẳn
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

    playRotateTable(id = -1) {
        if (!this.isFirstHand2 && this.level === 2) {
            this.isFirstHand2 = true;
            //this.arrow2.active = true;
            this.handTut.active = true;
        }

        this.isCanMove = false;

        if (id == 0) {
            this.tableSub.eulerAngles = cc.v3(-90, 208, 0);
        } else if (id == 1) {
            this.tableSub.eulerAngles = cc.v3(-90, 236, 0);
        } else {
            this.tableSub.eulerAngles = cc.v3(-90, 264, 0);
        }

        let targetRotation = null;
        if (id === 0 || id === -1) {
            targetRotation = this.vec30;
        } else if (id === 1) {
            targetRotation = this.vec31;
        } else if (id === 2) {
            targetRotation = this.vec32;
        }

        if (targetRotation) {
            cc.tween(this.tableSub)
                .to(2.0, { eulerAngles: targetRotation })
                .call(() => {
                    for (let i = 0; i < this.cakeSub.length; i++) {
                        this.cakeSub[i].node.parent = this.subStatic[i];
                    }
                    this.isCanMove = true;
                })
                .start();
        }
    },

    playRotateTable1(id = -1) {
        this.tableSub.eulerAngles = cc.v3(-90, 264, 0);

        this.isCanMove = false;

        cc.log(this.tableSub.eulerAngles);
        cc.tween(this.tableSub)
            .by(2.0, { eulerAngles: cc.v3(0, 60, 0) })
            .call(() => {
                this.cakeSub[0].node.parent = this.subStatic[1];
                this.isCanMove = true;
                cc.log(this.tableSub.eulerAngles);
            })
            .start();
    }

});
