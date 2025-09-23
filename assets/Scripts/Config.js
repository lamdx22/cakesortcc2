
class Config {
    constructor() {
        this.isSendInfo = 0;
        this.isPlaySound = true;

        this.defaultAds = 0;
        this.IronSource = 1;
        this.Unity = 2;
        this.Adwords = 3;
        this.Applovin = 4;
        this.Facebook = 5;
        this.Adcolony = 6;
        this.Mintegral = 7;
        this.Vungle = 8;
        this.Maio = 9;
        this.Pangle = 10;
        this.Moloco = 11;
        this.Yandex = 12;
        this.WebAds = 13;
        this.defaultGame = 0;
        this.G_1942 = 1;
        this.G_1945 = 2;
        this.Falcon = 3;
        this.Galaxiga = 4;
        this.FalconVip = 5;
        this.StickBattle = 6;
        this.ScrewJam = 7;
        this.BloomTile=8;
        this.CakeSort=9;
        this.defaultVersion = "9a25";
        this.version = this.defaultVersion;
        this.PlayableAdsGame = this.defaultGame;
        this.PlayableAdsType = this.defaultAds;

        this.linkAndroid = 'https://play.google.com/store/apps/details?id=com.falcon.dm.water.cake.sort.puzzle';;
        this.linkiOS = 'https://apps.apple.com/us/app/bloom-tile-match-puzzle-game/id6740838784';;
        this.linkWebAds = 'https://play.google.com/store/apps/details?id=com.falcon.dm.water.cake.sort.puzzle';;

        if (this.PlayableAdsType === this.Adwords || this.PlayableAdsType === this.Facebook || this.PlayableAdsType === this.IronSource) {
            this.isPlaySound = false;
        }
    }

    onGameReady() {
        if (this.PlayableAdsType === this.Mintegral) window.gameReady && window.gameReady();
    }

    openLinkApp() {
        if (this.PlayableAdsType === this.Unity || this.PlayableAdsType === this.Applovin) {
            if (cc.sys.os == cc.sys.OS_IOS) mraid.open(this.linkiOS);
            else mraid.open(this.linkAndroid);
        } else if (this.PlayableAdsType === this.IronSource) {
            if (cc.sys.os == cc.sys.OS_IOS) mraid.open(this.linkiOS);
            else mraid.open(this.linkAndroid);
        } else if (this.PlayableAdsType === this.Adwords) {
            if (cc.sys.os == cc.sys.OS_IOS) window.open(this.linkiOS);
            else window.open(this.linkAndroid);
        } else if (this.PlayableAdsType === this.Facebook) {
            FbPlayableAd.onCTAClick();
        } else if (this.PlayableAdsType === this.Adcolony) {
            if (cc.sys.os == cc.sys.OS_IOS) mraid.openStore(this.linkiOS);
            else mraid.openStore(this.linkAndroid);
        } else if (this.PlayableAdsType === this.Mintegral) {
            window.install && window.install();
        } else if (this.PlayableAdsType === this.Vungle) {
            parent.postMessage('download', '*');
        } else if (this.PlayableAdsType === this.Maio) {
            Maio.openClickUrl('https://maio.jp');
        } else if (this.PlayableAdsType === this.Pangle) {
            window.openAppStore();
        } else if (this.PlayableAdsType === this.Moloco) {
            FbPlayableAd.onCTAClick();
        } else if (this.PlayableAdsType === this.Yandex) {
            yandexHTML5BannerApi.getClickURLNum(1);
        } else if (this.PlayableAdsType === this.WebAds) {
            window.open(this.linkWebAds);
        } else if (this.PlayableAdsType === this.defaultAds) {
            window.open(this.linkWebAds);
        }
    }

    getGame() {
        var name = '';
        var pack = "";

        return { name: name, package: pack };
    }

    getNetwork() {
        var network = '';

        return network;
    }

    onEndGame() {
        if (this.PlayableAdsType === this.Mintegral)
            window.gameEnd && window.gameEnd();
    }

    sendInfo() {

    }
}
var CONFIG = new Config();
export default CONFIG;