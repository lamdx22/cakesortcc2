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
    },

    statics: {
        instance: null,
    },

    onLoad () {
        MainUI.instance = this;
    },

    start () {
        if (!GameManager.instance.isUsingCakeProgress) {
            this.scoreGroup.active = false;
        } else {
            this.scoreGroup.active = true;
            this.maxScore = GameManager.instance.maxScore;
            this.fillSprite.fillRange = this.currentScore / this.maxScore;
            this.scoreText.string = this.currentScore + "/" + this.maxScore;
        }
    },

    // update (dt) {},

    addScore(score) {
        if (!GameManager.instance.isUsingPopUp) return;

        this.currentScore += score;

        if (this.currentScore >= this.maxScore) {
            //this.currentScore = this.maxScore;
            this.showPopUpNewCake();
        }

        let percent = this.currentScore / this.maxScore;
        //this.fillSprite.fillRange = percent;
        this.scoreText.string = this.currentScore + "/" + this.maxScore;
        cc.tween(this.fillSprite)
            .to(0.5, { fillRange: percent }) // 0.5 giây
            .start();
    },

    showPopUpNewCake() {
        if (!GameManager.instance.isUsingPopUp) return;

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