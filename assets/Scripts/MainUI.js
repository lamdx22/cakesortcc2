const GameManager = require("GameManager");

const MainUI = cc.Class({
    extends: cc.Component,

    properties: {
        fillSprite: cc.Sprite,
        scoreText: cc.Label,
        popUpNewCake: cc.Node,
        popUpLose: cc.Node,
        scoreGroup: cc.Node,
        //maxScore: 70,
        currentScore: 0,
        islandElements: [cc.Node],
        island: cc.Node,
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

    },

    // update (dt) {},

    addScore(score) {
        //if (!GameManager.instance.isUsingPopUp) return;

        this.currentScore += score;

        if (this.currentScore >= this.maxScore) {
            //this.currentScore = this.maxScore;
            this.showPopUpNewCake();
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
                //currentActive.eulerAngles = cc.v3(0, 270 , 0);

                let rotate = cc.v3(0, -360, 0);

                cc.tween(currentActive)
                    .parallel(
                        cc.tween().to(0.3, {position: originPos}, { easing: "sineInOut" }),
                        cc.tween()
                            .to(0.3 , {scale: 1.2}) //this.island.active = false;
                            .to(0.2, {scale: 1})

                        //cc.tween().by(0.3, {eulerAngles: rotate})
                    )
                    .start();
            }
        }
    },

    async showPopUpNewCake() {
        if (!GameManager.instance.isUsingPopUp) return;

        await new Promise(resolve => setTimeout(resolve, 500));

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