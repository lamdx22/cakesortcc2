import CONFIG from "Config";

const AudioEngine = cc.Class({
    extends: cc.Component,

    properties: {
        audio: {
            default: [],
            type: [cc.AudioClip]
        }
    },

    statics: {
        instance: null,
    },

    onLoad() {
        AudioEngine.instance = this;
        if (this.currentAudio == null) {
            this.currentAudio = new Array(this.audio.length);
        }
        this.canPlayPunch = true;
    },

    playBackground() {
        this.volumeBG = 1;
        if (this.currentAudio == null) {
            this.currentAudio = new Array(this.audio.length);
        }
        if (CONFIG.PlayableAdsType == CONFIG.IronSource) {
            this.isStarted = true;
            if (typeof (window.playAudioThepn) !== 'undefined') {
                if (window.playAudioThepn) {
                    this.currentAudio[0] = cc.audioEngine.play(this.audio[0], true, this.volumeBG);
                    CONFIG.isPlaySound = true;
                } else {
                    this.currentAudio[0] = cc.audioEngine.play(this.audio[0], true, 0);
                }
                this.playAudioThepn = window.playAudioThepn;
            }
        } else {
            if (CONFIG.isPlaySound) {
                this.currentAudio[0] = cc.audioEngine.play(this.audio[0], true, this.volumeBG);
            }
        }
    },

    /**
     * 
     * @param {number} index 
     * @param {cc.Boolean} [loop=false]
     * @description Play sound effect at index with loop option
     */
    playSfx(index, loop = false ) {
        if (CONFIG.isPlaySound) {
            this.currentAudio[index] = cc.audioEngine.play(this.audio[index], loop, 1);
        }
    },


    muteAudio() {
        if (CONFIG.PlayableAdsType === CONFIG.Adcolony) {
            cc.audioEngine.stop(this.currentAudio[0]);
        } else {
            cc.audioEngine.setVolume(this.currentAudio[0], 0);
        }
    },

    unmuteAudio() {
        if (CONFIG.isPlaySound)
            if (CONFIG.PlayableAdsType === CONFIG.Adcolony) {
                cc.audioEngine.stop(this.currentAudio[0]);
                this.currentAudio[0] = cc.audioEngine.play(this.audio[0], true, this.volumeBG);
            } else {
                cc.audioEngine.setVolume(this.currentAudio[0], this.volumeBG);
            }
    },

    onDestroy: function () {
        for (var i = 0; i < this.currentAudio.length; i++) {
            cc.audioEngine.stop(this.currentAudio[i]);
        }
    }
});

window.AudioEngine = AudioEngine;