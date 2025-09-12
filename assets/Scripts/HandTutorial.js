
cc.Class({
    extends: cc.Component,

    properties: {
        startPos: cc.Vec3,
        destination: cc.Vec3,
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

        // tạo tween cơ bản
        let moveTween = cc.tween()
            .to(this.duration, { position: this.destination }, { easing: "sineInOut" })
            .to(this.duration, { position: this.startPos }, { easing: "sineInOut" });

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
