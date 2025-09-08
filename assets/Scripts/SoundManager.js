
let SoundManager = cc.Class({
    extends: cc.Component,

    properties: {
        soundPickCake: cc.AudioSource,
        soundPutCake: cc.AudioSource,
        soundCompleteCake: cc.AudioSource,
        soundMoveCake: cc.AudioSource,
        soundComeleteGame: cc.AudioSource,
    },

    statics: {
        instance: null,
    },

    onLoad () {
        if (SoundManager.instance == null) {
            SoundManager.instance = this;
        } else {
            this.destroy();
        }
    },

    start () {

    },

    // update (dt) {},
});
