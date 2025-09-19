
cc.Class({
    extends: cc.Component,

    properties: {
        cake: cc.Node,
        button: cc.Node,
        targetCakeEuler: cc.Vec3,
        glow: cc.Node,
    },

    // onLoad () {},

    start () {
        this.show();
    },

    show() {
        this.node.active = true;
        this.node.getComponent(cc.Widget).updateAlignment();
        //this.node.scale = 0;
        // cc.tween(this.node)
        //     .to(0.3, { scale: 1 }) // scale to
        //     //.to(0.1, {scale: 0.1}, {easing: "backIn"})
        //     .start();

        // let targetEuler = cc.v3(
        //     0,
        //     360,
        //     0
        // );

        cc.tween(this.cake)
            // Xoay
            .by(3, { eulerAngles: this.targetCakeEuler }) // thay "sineInOut" bằng easing bạn muốn
            .repeatForever()
            .start();

        cc.tween(this.glow)
            // Xoay
            .by(6, { angle: 360 }) // thay "sineInOut" bằng easing bạn muốn
            .repeatForever()
            .start();

        let nhapnhay = cc.tween()
            .to(0.5, { scale: 0.95 }) // scale to
            //.delay(0.5)
            .to(0.5, {scale: 1.1});
            //.repeatForever()
            //.start();
        cc.tween(this.button).repeatForever(nhapnhay).start();
    },

    // update (dt) {},
});
