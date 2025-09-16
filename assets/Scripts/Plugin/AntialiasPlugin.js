// AntialiasPlugin.js
if (CC_EDITOR) {
    // Không chạy trong Editor
    //return;
}

// Script này sẽ chạy rất sớm, trước khi engine init
cc.macro.ENABLE_WEBGL_ANTIALIAS = true;         // Bật khử răng cưa
cc.macro.ENABLE_TRANSPARENT_CANVAS = false;     // Canvas không trong suốt (có thể đổi true nếu muốn overlay)

console.log("[Plugin] Antialias enabled:", cc.macro.ENABLE_WEBGL_ANTIALIAS);