const GameManager = require("GameManager");

cc.Class({
    extends: cc.Component,

    properties: {
        targetCellIndex: 0,
        startPos: cc.Vec3,
        destination: cc.Vec3,
        offsetDes: cc.Vec3,
        duration: 2,
        arrow: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {},

    start () {
        //this.startTutorial();
    },

    startTutorial() {
        // set vị trí ban đầu
        //this.node.setPosition(this.startPos);
        this.targetCell = GameManager.instance.cells[this.targetCellIndex];
        this.startPos = this.node.position;
        let cellWorldPos = this.targetCell.parent.convertToWorldSpaceAR(this.targetCell.position);
        this.destination = cellWorldPos.clone();
        this.destination.addSelf(this.offsetDes);
        this.destination.y = this.startPos.y;

        // moveTween
        let moveTween = cc.tween()
            .to(this.duration, { position: this.destination }, { easing: "sineInOut" })
            .to(0, { position: this.startPos });
        cc.tween(this.node).repeatForever(moveTween).start();
        
        let arrowStartPos = cc.v3(cellWorldPos.x, this.arrow.y, cellWorldPos.z);
        let arrowTargetPos = arrowStartPos.clone();
        arrowTargetPos.y += 3;
        this.arrow.position = arrowStartPos;

        let arrowTween = cc.tween()
            .to(0.3, { position: arrowTargetPos }, { easing: "sineInOut" })
            .to(0.3, { position: arrowStartPos});
        cc.tween(this.arrow).repeatForever(arrowTween).start();
    },

    show() {
        this.startTutorial();
        this.node.active = true;
        this.arrow.active = true;
    },

    hide() {
        this.node.active = false;
        this.arrow.active = false;
    }

    // update (dt) {},
});
