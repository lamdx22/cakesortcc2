const GameManager = require("GameManager");

cc.Class({
    extends: cc.Component,

    properties: {
        camera: cc.Camera,
        currSelectCake: null,
    },

    onLoad () {
        this.currHoverCell = null;

        // Bật physic3d
        cc.director.getPhysics3DManager().enabled = true;

        // Listen touch
        //cc.systemEvent.on(cc.SystemEvent.EventType.TOUCH_START, this.onTouchStart, this);
        //cc.systemEvent.on(cc.SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);
        //cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },

    onDestroy () {
        //cc.systemEvent.off(cc.SystemEvent.EventType.TOUCH_START, this.onTouchStart, this);
        //cc.Canvas.instance.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },

    start() {
        // cc.director.getPhysics3DManager().physicsWorld._colliders.forEach(c => {
        // cc.log("Có collider:", c.node.name);
        // });
    },

    onTouchStart (event) {
        cc.log("TouchManager nhận TOUCH_START");
        let touchLoc = event.touch.getLocation();
        let ray = this.camera.getRay(touchLoc);
        let results = cc.geomUtils.intersect.raycast(cc.director.getScene(), ray);
        for (let i = 0; i < results.length; i++) {
            let t = results[i];
            var obj = results[i].node;
            if (obj.group === "cake") {
                let parentNode = obj.parent;
                if (parent) {
                    let cake = parentNode.getComponent("CakeController");
                    if (cake) {
                        this.currSelectCake = cake;
                        //cake.node.setScale(cake.node.scaleX * 1.2);
                    }
                }
            }

            
        }
        this.test();
        
        //let touchLoc = event.touch.getLocation();
        //let ray = this.camera.getRay(touchLoc);
        let maxDistance = 10000;
        let rayColliderGroupName = "cake";
        const results2 = cc.director.getPhysics3DManager().raycast(ray, rayColliderGroupName, maxDistance, true);
        if (results2) {
             console.log("hit");
        }
        
    },

    async test() {
        for (let i = 0; i < dem; i++) {
            await new Promise(resolve => setTimeout(resolve, 0)); // chờ 1 frame
        }
    },

    onTouchMove(event) {
        // cc.log("Move");
        this.currHoverCell = null;
        if (this.currSelectCake) {
            let touchLoc = event.touch.getLocation();
            let ray = this.camera.getRay(touchLoc);
            let results = cc.geomUtils.intersect.raycast(cc.director.getScene(), ray);
            for (let i = 0; i < results.length; i++) {
                let hit = results[i];
                var obj = results[i].node;
                if (obj.group === "floor") {
                    let t = results[i];
                    let hitPoint = ray.o.add(ray.d.mul(t.distance));
                    //let pos = hit.
                    let cur = this.currSelectCake.node.position;
                    //cc.log(this.currSelectCake.node.position);
                    let localPos = this.currSelectCake.node.parent.convertToNodeSpaceAR(hitPoint);
                    this.currSelectCake.node.setPosition(localPos.x, localPos.y, localPos.z);
                }

                if (obj.group === "cell") {
                    //cc.log("cell");
                    this.currHoverCell = obj.parent;
                    //let t = 1;
                }
            }

            //let pos = this.touchToWorldPoint(touchLoc, this. camera, 0);
            

        }
    },

    onTouchEnd(event) {
        if (this.currSelectCake && this.currHoverCell) {
            cc.log("Put");
            // this.currSelectCake.node.parent = this.currHoverCell;
            // this.currSelectCake.node.position = cc.v3(0, 0, 0);
            GameManager.instance.onSnapTo(this.currHoverCell, this.currSelectCake);
            this.currSelectCake = null;
            this.currHoverCell = null;
        } else if (this.currSelectCake) {
            this.currSelectCake.return(cc.v3(0, 0, 0));
        }
    },

    update (dt) {},
});
