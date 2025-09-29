
cc.Class({
    extends: cc.Component,

    properties: {
        animateNode: cc.Node,
    },

    // onLoad () {},

    start () {
        let nhapnhay = cc.tween()
            .to(0.5, { scale: 0.95 }) // scale to
            //.delay(0.5)
            .to(0.5, {scale: 1.1});
            //.repeatForever()
            //.start();
        cc.tween(this.animateNode).repeatForever(nhapnhay).start();
    },

    // update (dt) {},
});
