const GameManager = require("GameManager");

cc.Class({
    extends: cc.Component,

    properties: {
        textFX: cc.Label,
        listText: [cc.String],
        colors: [cc.Color],
        percentAppear: 50,
    },

    // onLoad () {},

    onEnable () {
        if (GameManager.instance.useTextFX) {
            let random = Math.random()*100;
            if (random > this.percentAppear) 
            {
                this.textFX.string = "";
                return;
            }
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
                .delay(0)
                .parallel(
                    cc.tween().to(0.7, { scale: 0.06 }, { easing: "backOut" }),
                    cc.tween().to(0.7, { opacity: 0 }, { easing: "backIn" })
                )
                //.to(0.6, { scale: 0.08 }, { easing: "backOut" }) 
                //.to(0.1, {scale: 0.1}, {easing: "backIn"})
                //.delay(0.1)                                    
                //.to(0.6, { scale: 0, opacity: 0 }, { easing: "backIn" }) 
                .start();
        } else {
            this.textFX.string = "";
        }
    },

    // update (dt) {},
});
