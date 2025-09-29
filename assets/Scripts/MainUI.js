const GameManager = require("GameManager");
//const SoundManager = require("SoundManager");

const MainUI = cc.Class({
    extends: cc.Component,

    properties: {
        fillSprite: cc.Sprite,
        scoreText: cc.Label,
        popUpNewCake: cc.Node,
        popUpLose: cc.Node,
        popUpStart: cc.Node,
        scoreGroup: cc.Node,
        //maxScore: 70,
        currentScore: 0,
        islandElements: [cc.Node],
        island: cc.Node,
        waterFlow: cc.Node,
        useWaterFlow: true,
        fxPlace: cc.Prefab,
    },

    statics: {
        instance: null,
    },

    onLoad () {
        MainUI.instance = this;
        this.islandActiveIndex = 0;
    },

    start () {
        if (!GameManager.instance.isUsingCakeProgress) {
            this.scoreGroup.active = false;

            if (GameManager.instance.isUsingIsland) {
                this.island.active = true;
            }
        } else {
            this.island.active = false;
            this.scoreGroup.active = true;
            this.maxScore = GameManager.instance.maxScore;
            this.fillSprite.fillRange = this.currentScore / this.maxScore;
            this.scoreText.string = this.currentScore + "/" + this.maxScore;
        }

        if (this.useWaterFlow && this.waterFlow) {
            let startPos = this.waterFlow.position;
            let leftPos = startPos.clone();
            leftPos.x -= 18;
            let rightPos = startPos.clone();
            rightPos.x += 18;
            this.waterFlow.position = leftPos;
            let flowTween = cc.tween()
                .to(4, { position: rightPos}, { easing: "sineInOut" }) //
                .to(4, { position: leftPos}, { easing: "sineInOut" });
            cc.tween(this.waterFlow).repeatForever(flowTween).start();
        }

    },

    hidePopUp() {
        if (this.popUpStart) this.popUpStart.active = false;
        if (this.popUpLose) this.popUpLose.active = false;
        if (this.popUpNewCake) this.popUpNewCake.active = false;
    },

    // update (dt) {},

    addScore(score) {
        //if (!GameManager.instance.isUsingPopUp) return;

        this.currentScore += score;

        if (this.currentScore >= this.maxScore) {
            //this.currentScore = this.maxScore;
            this.showPopUpNewCake();
        }

        let t = GameManager.instance;
        if (t) {
            this.currentScore += 0;
        }

        if (GameManager.instance.isUsingCakeProgress) {
            let percent = this.currentScore / this.maxScore;
            //this.fillSprite.fillRange = percent;
            this.scoreText.string = this.currentScore + "/" + this.maxScore;
            cc.tween(this.fillSprite)
                .to(0.5, { fillRange: percent }) // 0.5 giây
                .start();
        } else if (GameManager.instance.isUsingIsland) {
            if (this.islandActiveIndex < this.islandElements.length) {
                let currentActive = this.islandElements[this.islandActiveIndex];
                currentActive.active = true;
                this.islandActiveIndex++;
                if (this.islandActiveIndex == this.islandElements.length) {
                    this.showPopUpNewCake();
                }

                let originPos = currentActive.position;
                let originScale = cc.v3();
                currentActive.getScale(originScale);
                let originRotation = currentActive.eulerAngles;

                currentActive.position = cc.v3(originPos.x, originPos.y + 15, originPos.z);
                currentActive.scale = 0;

                currentActive.eulerAngles = cc.v3(-40, 0, 0);

                let centerPos = cc.v3(0, 0, 0);
                centerPos = currentActive.parent.convertToNodeSpaceAR(centerPos);
                //centerPos.x = 0;
                //centerPos.z = 0;
                centerPos.y = originPos.y + 5;
                //centerPos.z += -10;
                //currentActive.eulerAngles = cc.v3(0, 270 , 0);

                let rotate = cc.v3(0, -360, 0);

                cc.tween(currentActive)
                    .parallel(
                        cc.tween()
                            .to(0.3, {position: centerPos}, { easing: "sineInOut" })
                            .delay(0.8)
                            .to (0.3, {position: originPos})
                            .call(() => {
                                let fx = cc.instantiate(this.fxPlace);
                                fx.parent = this.island;
                                fx.position = originPos;
                            }),
                        cc.tween()
                            .to(0.3 , {scale: 2.4}) //this.island.active = false;
                            //.by(0.3, {eulerAngles: rotate})
                            .to(0.2, {scale: 1.8})
                            .delay(0.6)
                            .to(0.3, {scale: 1}),
                        cc.tween()
                            .delay(1.1)
                            .to(0.3, {eulerAngles: cc.v3(0, 0, 0)})

                        //cc.tween().by(0.3, {eulerAngles: rotate})
                    )
                    .start();
            }
        }
    },

    async showPopUpNewCake() {
        
        if (!GameManager.instance.isUsingPopUp) return;

        await new Promise(resolve => setTimeout(resolve, 1400));

        // SoundManager.instance.soundBackground.stop();
        // SoundManager.instance.soundCompleteGame.play();
        AudioEngine.instance.playNewCake();
        AudioEngine.instance.muteAudio();
        
        //await new Promise(resolve => setTimeout(resolve, 200));

        GameManager.instance.endGame();
        if (this.popUpNewCake) {
            this.popUpNewCake.active = true;
            let widgets = this.popUpNewCake.getComponents(cc.Widget);
            for (let w of widgets) {
                w.updateAlignment();
            }
        }
    },

    showPopUpLose() {
        if (!GameManager.instance.isUsingPopUp) return;

        // SoundManager.instance.soundBackground.stop();
        // SoundManager.instance.soundLose.play();
        AudioEngine.instance.playSoundLose();
        AudioEngine.instance.muteAudio();

        GameManager.instance.endGame();
        if (this.popUpNewCake) {
            this.popUpNewCake.active = false;
        }
        if (this.popUpLose) {
            this.popUpLose.active = true;
            let widgets = this.popUpLose.getComponents(cc.Widget);
            for (let w of widgets) {
                w.updateAlignment();
            }
            this.popUpLose.scale = 0;
            this.popUpLose.opacity = 0;
            // cc.tween(this.popUpLose)
            // .to(0.25, { scale: 1 }) // 0.5 giây
            // .start();
            cc.tween(this.popUpLose)
                .parallel(
                    cc.tween().to(0.5, { scale: 1 }, { easing: "backOut" }),
                    cc.tween().to(0.5, { opacity: 255 }, { easing: "quadOut" })
                )
                .start();
        }
    }


});

module.exports = MainUI;