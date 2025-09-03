
cc.Class({
    extends: cc.Component,

    properties: {
        camera: cc.Camera,
        currentSelectCake: null,
    },

    onLoad () {
        // Bật physic3d
        cc.director.getPhysics3DManager().enabled = true;

        // Listen touch
        //cc.systemEvent.on(cc.SystemEvent.EventType.TOUCH_START, this.onTouchStart, this);
        //cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    },

    onDestroy () {
        //cc.systemEvent.off(cc.SystemEvent.EventType.TOUCH_START, this.onTouchStart, this);
        //cc.Canvas.instance.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
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
            var obj = results[i].node;
            if (obj.group === "cake") {
                let parentNode = obj.parent;
                if (parent) {
                    let cake = parentNode.getComponent("CakeController");
                    if (cake) {
                        this.currentSelectCake = cake;
                        //cake.node.setScale(cake.node.scaleX * 1.2);
                    }
                }
            }
        }
        // let touchLoc = event.touch.getLocation();
        // let ray = this.camera.getRay(touchLoc);
        // let maxDistance = 10000;
        // let rayColliderGroupName = "cake";
        // const results2 = cc.director.getPhysics3DManager().raycast(ray, rayColliderGroupName);
        // if (results2) {
        //      console.log("hit");
        // }
    },

    onTouchMove(event) {
        cc.log("Move");
        if (this.currentSelectCake) {
            let touchLoc = event.touch.getLocation();
            let ray = this.camera.getRay(touchLoc);
            let results = cc.geomUtils.intersect.raycast(cc.director.getScene(), ray);
            for (let i = 0; i < results.length; i++) {
                let hit = results[i];
                var obj = results[i].node;
                if (obj.group === "floor") {
                    let pos = hit.hitPoint;
                    this.currentSelectCake.node.setPosition(pos);
                }
            }

            //let pos = this.touchToWorldPoint(touchLoc, this. camera, 0);
            

        }
    },

    update (dt) {},
});
