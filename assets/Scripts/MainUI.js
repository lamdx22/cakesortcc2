const GameManagerLamDX = require("GameManagerLamDX");

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
        if (!GameManagerLamDX.instance.isNewCakePopUp) {
            this.scoreGroup.active = false;
        } else {
            this.scoreGroup.active = true;
            this.maxScore = GameManagerLamDX.instance.maxScore;
            this.fillSprite.fillRange = this.currentScore / this.maxScore;
            this.scoreText.string = this.currentScore + "/" + this.maxScore;
        }
    },

    // update (dt) {},

    addScore(score) {
        if (!GameManagerLamDX.instance.isNewCakePopUp) return;

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
        GameManagerLamDX.instance.endGame();
        if (this.popUpNewCake) {
            this.popUpNewCake.active = true;
        }
    },

    showPopUpLose() {
        GameManagerLamDX.instance.endGame();
        if (this.popUpNewCake) {
            this.popUpNewCake.active = false;
        }
        if (this.popUpLose) {
            this.popUpLose.active = true;
        }
    }


});

module.exports = MainUI;