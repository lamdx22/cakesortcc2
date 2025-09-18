const GameManagerLamDX = require("GameManagerLamDX");

cc.Class({
    extends: cc.Component,

    properties: {
        textFX: cc.Label,
        listText: [cc.String],
        colors: [cc.Color],
    },

    // onLoad () {},

    onEnable () {
        if (GameManagerLamDX.instance.useTextFX) {
            let k = Math.floor(Math.random() * this.listText.length);
            if (k > this.listText.length - 1) {
                k = this.listText.length - 1;
            }
            let r = Math.floor(Math.random() * this.colors.length);
            this.textFX.string = this.listText[k];
            this.textFX.node.color = this.colors[r];

            let n = this.textFX.node;
            n.opacity = 255;
            n.scale = 0;   // bắt đầu nhỏ

            // tween: scale to lên -> đợi -> scale nhỏ -> biến mất
            cc.tween(n)
                .delay(0.15)
                .to(0.3, { scale: 0.08 }, { easing: "backOut" }) // scale to
                //.to(0.1, {scale: 0.1}, {easing: "backIn"})
                .delay(0.5)                                    // giữ một lúc
                .to(0.3, { scale: 0, opacity: 0 }, { easing: "backIn" }) // scale nhỏ, fade out
                .start();
        } else {
            this.textFX.string = "";
        }
    },

    // update (dt) {},
});
