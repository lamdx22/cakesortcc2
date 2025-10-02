import CakePoolManager from "./CakePoolManager";
var GameManager = require("GameManager");

const GhostController = cc.Class({
    extends: cc.Component,

    properties: {
        Type: 0,
        speed: 10,
        startPos: cc.v3(0, 0, 0),
        attackPos: cc.v3(0, 0, 20),
        weapon: cc.Node,
        walkStr: "",
        attackStr: "",
        dieStr: "",
        spawnStr:"",
        walkSpeed: 1,

    },


    onLoad () {
        this.isAttack = false;
        this.node.position = cc.v3(0, 0, 0);
        this.skelAnim = this.node.getComponent(cc.SkeletonAnimation);
        //let state = this.skelAnim.defaultClip;
        //state.speed = 0.8;
        // Lấy AnimationClip
        let clip = this.skelAnim._clips.find(c => c.name === this.walkStr);

        // Chỉnh tốc độ gốc
        clip.speed = this.walkSpeed;
    },

    start () {

    },

    onEnable() {
        if (this.weapon) this.weapon.active = false;
        this.isTargeted = false;
        this.isAlive = true;
        this.skelAnim.play(this.spawnStr);
        this.scheduleOnce(() => {
            this.skelAnim.play(this.walkStr);
            this.isMoving = true;
        }, 1.2);
    },

    update (dt) {
        if (!this.isAlive || !this.isMoving || !GameManager.instance.isGameStarted) return;
        let pos = this.node.position;
        pos.z += this.speed * dt;
        this.node.setPosition(pos);

        if (!this.isAttack && pos.z < this.attackPos.z + 2.5) {
            GameManager.instance.mainUI.showWarning();
        }

        if (pos.z < this.attackPos.z) {
            this.attack();
        }
    },

    async attack() {
        if (this.isAttack) return;
        this.isAttack = true;
        this.isMoving = false;
        if (this.weapon) this.weapon.active = true;
        this.skelAnim.play(this.attackStr);
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (this.isAlive) {
            GameManager.instance.showLose();
        }
    },

    die() {
        this.isAlive = false;
        AudioEngine.instance.playDeathSound();
        cc.tween(this.node)
            //.by(0.2, {position: cc.v3(0, 0.5, 1)}, {easing: "cubicOut"})
            .parallel(
                cc.tween().to(0.6, {
                    opacity: 0
                }),
                cc.tween().by(0.8, {
                    position: cc.v3(0, 0, 0)
                }, {easing: "sineInOut"}))
            .call(() => {
                this.node.position = cc.v3(0, 0, 0);
                CakePoolManager.instance.despawnGhost(this);
                this.node.opacity = 255;
                this.node.position = cc.v3(0, 0, 0);
            })
            .start();

        this.skelAnim.play(this.dieStr);
        //await new Promise(resolve => setTimeout(resolve, 500));
    },

    setTargeted() {
        this.isTargeted = true;
    }
});

module.exports = GhostController;