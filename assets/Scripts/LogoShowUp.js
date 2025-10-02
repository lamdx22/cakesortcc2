
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // onLoad () {},

    onEnable() {
        this.node.opacity = 255;
        this.node.scale = 0;
        cc.tween(this.node)
                .delay(0)
                .parallel(
                    cc.tween().to(0.6, { scale: 0.016 }, { easing: "backOut" }),
                    cc.tween().to(0.6, { opacity: 0 }, { easing: "backIn" })
                )
                //.to(0.6, { scale: 0.08 }, { easing: "backOut" }) 
                //.to(0.1, {scale: 0.1}, {easing: "backIn"})
                //.delay(0.1)                                    
                //.to(0.6, { scale: 0, opacity: 0 }, { easing: "backIn" }) 
                .start();
    },

    start () {

    },


    // update (dt) {},
});
