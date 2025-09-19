const GameManager = require("GameManager");
const SoundManager = require("SoundManager");

cc.Class({
    extends: cc.Component,

    properties: {
        camera: cc.Camera,
        currSelectCake: null,
        touchY: 30,
    },

    onLoad () {
        this.currHoverCell = null;
        this.offsetTouch = -0.12;

        // Bật physic3d
        //cc.director.getPhysics3DManager().enabled = true;

        // Listen touch
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },

    onDestroy () {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },

    onTouchStart (event) {
        cc.log("TouchManager nhận TOUCH_START");
        if (GameManager.instance.isGameEnd) {
            GameManager.instance.goToStore();
            return;
        }

        if (!GameManager.instance.isCanMove) return;

        if (this.currSelectCake) {
            this.currSelectCake.return(cc.v3(0, 0, 0));
            this.currSelectCake = null;
        }
        
        let touchLoc = event.touch.getLocation();
        let ray = this.camera.getRay(touchLoc);
        let results = cc.geomUtils.intersect.raycast(cc.director.getScene(), ray);
        for (let i = 0; i < results.length; i++) {
            let hit = results[i];
            var obj = results[i].node;
            if (obj.group === "cake") {
                let parentNode = obj.parent;
                if (parentNode) {
                    let oldRot = cc.quat();
                    parentNode.getRotation(oldRot);
                    let cake = parentNode.getComponent("CakeController");
                    if (cake && !cake.isInCell) {
                        this.currSelectCake = cake;
                        this.currSelectCake.IEBounce();
                        SoundManager.instance.soundPickCake.play();

                        let hitPoint = ray.o.add(ray.d.mul(hit.distance));
                        hitPoint.y = this.touchY;
                        let localPos = this.currSelectCake.node.parent.convertToNodeSpaceAR(hitPoint);
                        this.currSelectCake.node.setPosition(localPos.x, localPos.y, localPos.z - this.offsetTouch);
                        //cake.node.setScale(cake.node.scaleX * 1.2);
                    }
                }
            }

            
        }
        
        //let touchLoc = event.touch.getLocation();
        //let ray = this.camera.getRay(touchLoc);
        let maxDistance = 10000;
        let rayColliderGroupName = "cake";
        const results2 = cc.director.getPhysics3DManager().raycast(ray, rayColliderGroupName, maxDistance, true);
        if (results2) {
             console.log("hit");
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
                    let hitPoint = ray.o.add(ray.d.mul(hit.distance));
                    hitPoint.y = this.touchY;
                    let localPos = this.currSelectCake.node.parent.convertToNodeSpaceAR(hitPoint);
                    this.currSelectCake.node.setPosition(localPos.x, localPos.y, localPos.z - this.offsetTouch);
                }

                // if (obj.group === "cell") {
                //     //cc.log("cell");
                //     this.currHoverCell = obj.parent;
                //     //let t = 1;
                // }
            }

            let origin = this.currSelectCake.node.parent.convertToWorldSpaceAR(this.currSelectCake.node.position);
            let screenPos = cc.v3();
            this.camera.getWorldToScreenPoint(origin, screenPos);

            let ray2 = this.camera.getRay(screenPos);
            let results2 = cc.geomUtils.intersect.raycast(cc.director.getScene(), ray2);

            for (let i = 0; i < results2.length; i++) {
                let hit2 = results2[i];
                var obj = results2[i].node;
                if (hit2.node.group === "cell") {
                    this.currHoverCell = obj.parent;
                }
            }
            if (this.currHoverCell && GameManager.instance.isCanSnap(this.currHoverCell, this.currSelectCake)) {
                GameManager.instance.showSelector(this.currHoverCell, this.currSelectCake);
            } else {
                GameManager.instance.offSelector();
            }
            
            if (results.length <= 0) {
                GameManager.instance.offSelector();
            }
        }
    },

    onTouchEnd(event) {
        if (this.currSelectCake) {// && this.currHoverCell) {
            let origin = this.currSelectCake.node.parent.convertToWorldSpaceAR(this.currSelectCake.node.position);
            let screenPos = cc.v3();
            this.camera.getWorldToScreenPoint(origin, screenPos);

            let ray = this.camera.getRay(screenPos);

            let results = cc.geomUtils.intersect.raycast(cc.director.getScene(), ray);

            for (let i = 0; i < results.length; i++) {
                let hit = results[i];
                var obj = results[i].node;
                if (hit.node.group === "cell") {
                    let p = obj.parent.convertToWorldSpaceAR(obj.position);
                    this.currHoverCell = obj.parent;
                }
            }
            if (this.currHoverCell && GameManager.instance.isCanSnap(this.currHoverCell, this.currSelectCake)) {
                GameManager.instance.onSnapTo(this.currHoverCell, this.currSelectCake);
                GameManager.instance.onPutCake();
                this.currSelectCake.IEBounce();
            } else {
                this.currSelectCake.return(cc.v3(0, 0, 0));
            }
            //cc.log("Put");
            // this.currSelectCake.node.parent = this.currHoverCell;
            // this.currSelectCake.node.position = cc.v3(0, 0, 0);
            GameManager.instance.offSelector();
        }
        this.currSelectCake = null;
        this.currHoverCell = null;
    },

    update (dt) {},
});
