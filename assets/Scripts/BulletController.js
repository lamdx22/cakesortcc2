var GameManager = require("GameManager");
import CakePoolManager from "./CakePoolManager";

cc.Class({
    extends: cc.Component,

    properties: {
        speed: 10,
        hitRadius: 0.5,
    },

    onLoad () {
        
    },

    onEnable() {
        this.targetNode = null;
        this.targetWorldPos = null;
        this.velocity = cc.v3(0, 0, 0);
        this.isMoving = false;
    },

    start () {

    },

    update (dt) {
        if (!this.targetNode) return;

        let pos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        let targetPos = this.targetNode.parent.convertToWorldSpaceAR(this.targetNode.position);

        // hướng đến target
        let dir = cc.v3();
        targetPos.sub(pos, dir);
        dir.normalize(dir, dir);

        // di chuyển = hướng * speed * dt
        let move = dir.mul(this.speed * dt);
        pos.add(move, pos);
        this.node.position = pos;

        // kiểm tra chạm target
        if (pos.sub(targetPos).mag() < this.hitRadius) {
            this.onHitTarget();
        }
    },

    setTarget(targetNode) {
        let posUp = this.node.position.clone();
        posUp.y += 10;
        // cc.tween(this.node)
        //     .to(0.2, {position: posUp})
        //     .call(() => {
        //         this.targetNode = targetNode;
        //     })
        //     .start();
        this.targetNode = targetNode;
    },

    onHitTarget() {
        this.isMoving = false;
        let targetPos = this.targetNode.parent.convertToWorldSpaceAR(this.targetNode.position);
        let ghost = this.targetNode.getComponent("GhostController");
        if (ghost) {
            GameManager.instance.killGhost(ghost);
        }

        let fx = CakePoolManager.instance.spawnFxBoom(targetPos);
        CakePoolManager.instance.despawnBullet(this);
        this.targetNode = null;
    },


});
