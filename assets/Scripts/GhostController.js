import CakePoolManager from "./CakePoolManager";

const GhostController = cc.Class({
    extends: cc.Component,

    properties: {
        Type: 0,
        speed: 10,
        startPos: cc.v3(0, 0, 0),
    },


    onLoad () {
        this.node.position = cc.v3(0, 0, 0);
    },

    start () {

    },

    onEnable() {
        this.isTargeted = false;
        this.isAlive = true;
    },

    update (dt) {
        if (!this.isAlive) return;
        let pos = this.node.position;
        pos.z += this.speed * dt;
        this.node.setPosition(pos);
    },

    die() {
        this.isAlive = false;
        cc.tween(this.node)
            .to(0.8, {
                opacity: 0,
                position: cc.v3(this.node.x, -2.4, this. node.z)
            }, {easing: "sineInOut"})
            .call(() => {
                this.node.position = cc.v3(0, 0, 0);
                CakePoolManager.instance.despawnGhost(this);
                this.node.opacity = 255;
                this.node.position = cc.v3(0, 0, 0);
            })
            .start();
        //await new Promise(resolve => setTimeout(resolve, 500));
        //CakePoolManager.instance.spawnGhost(0);
    },

    setTargeted() {
        this.isTargeted = true;
    }
});

module.exports = GhostController;