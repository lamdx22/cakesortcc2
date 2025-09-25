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

    update (dt) {
        let pos = this.node.position;
        pos.z += this.speed * dt;
        this.node.setPosition(pos);
    },

    die() {
        this.node.position = cc.v3(0, 0, 0);
        CakePoolManager.instance.despawnGhost(this);
        //CakePoolManager.instance.spawnGhost(0);
    },
});

module.exports = GhostController;