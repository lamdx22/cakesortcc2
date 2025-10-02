const GameManager = require("GameManager");

cc.Class({
    extends: cc.Component,

    properties: {
        timeEachSpawn: 0.5,
    },

    onLoad () {
        this.timeInterval = this.timeEachSpawn;
    },

    start () {

    },

    update (dt) {
        if (this.timeInterval >= 0 && GameManager.instance.isGameStarted && !GameManager.instance.isGameEnd) {
            this.timeInterval -= dt;
            if (this.timeInterval <= 0) {
                this.timeInterval = this.timeEachSpawn;
                GameManager.instance.spawnGhost();
            }
        }
    },
});
