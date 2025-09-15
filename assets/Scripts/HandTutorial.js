
cc.Class({
    extends: cc.Component,

    properties: {
        targetCell: cc.Node,
        startPos: cc.Vec3,
        destination: cc.Vec3,
        offsetDes: cc.Vec3,
        duration: 2,
        loopCount: -1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {},

    start () {
        this.startTutorial();
    },

    startTutorial() {
        // set vị trí ban đầu
        //this.node.setPosition(this.startPos);
        this.startPos = this.node.position;
        this.destination = this.targetCell.parent.convertToWorldSpaceAR(this.targetCell.position);
        this.destination.addSelf(this.offsetDes);
        this.destination.y = this.startPos.y;

        // tạo tween cơ bản
        let moveTween = cc.tween()
            .to(this.duration, { position: this.destination }, { easing: "sineInOut" })
            .to(0, { position: this.startPos });

        if (this.loopCount < 0) {
            // lặp vô hạn (giống DOTween LoopType.Yoyo)
            cc.tween(this.node).repeatForever(moveTween).start();
        } else {
            // lặp đúng số lần (mỗi lần gồm đi + về)
            cc.tween(this.node).repeat(this.loopCount, moveTween).start();
        }
        
    }

    // update (dt) {},
});
