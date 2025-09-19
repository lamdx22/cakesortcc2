const GameManager = require("GameManager");

cc.Class({
    extends: cc.Component,

    properties: {
        textFX: cc.Label,
        listText: [cc.String],
        colors: [cc.Color],
    },

    // onLoad () {},

    onEnable () {
        if (GameManager.instance.useTextFX) {
            let k = Math.floor(Math.random() * this.listText.length);
            if (k > this.listText.length - 1) {
                k = this.listText.length - 1;
            }
            let r = Math.floor(Math.random() * this.colors.length);
            this.textFX.string = this.listText[k];
            this.textFX.node.color = this.colors[r];

            let n = this.textFX.node;
            n.opacity = 255;
            n.scale = 0;

            cc.tween(n)
                .delay(0.15)
                .to(0.3, { scale: 0.08 }, { easing: "backOut" }) 
                //.to(0.1, {scale: 0.1}, {easing: "backIn"})
                .delay(0.5)                                    
                .to(0.3, { scale: 0, opacity: 0 }, { easing: "backIn" }) 
                .start();
        } else {
            this.textFX.string = "";
        }
    },

    // update (dt) {},
});
