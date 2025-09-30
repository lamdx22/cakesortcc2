#!/usr/bin/python3

import os
import time
import sys
from html.parser import HTMLParser
import base64
import simplejson
import math
import zipfile
import shutil
import json
from pathlib import Path

prefix = ''
if (prefix != ''):
    prefix += '_'
date = '250930'
titles = ['CakeSort']
version = ['25b09_Cocos']
dev = 'LamDX'
# languages = ['ar', 'de', 'en','es','fr', 'hi', 'jp', 'kr', 'pt','ru']
languages = ['en']

ads = ['IronSource', 'Unity', 'Adwords', 'Applovin', 'Facebook', 'Adcolony', 'Mintegral', 'Maio', 'Pangle', 'Vungle', 'Moloco', 'Yandex', 'WebAdsFB', 'WebAdsGA']
# ads = ['WebAdsFB', 'WebAdsGA']

if sys.getdefaultencoding() != 'utf-8':
    reload(sys)
    sys.setdefaultencoding('utf-8')

settingMatchKey = '{#settings}'
engineMatchKey = '{#cocosengine}'
projectMatchKey = '{#project}'
resMapMatchKey = '{#resMap}'
physicMatchKey = '{#physic}'

fileByteList = ['.png', '.jpg', '.mp3', '.ttf', '.plist', '.txt', '.bin']

base64PrefixList = {
    '.png': 'data:image/png;base64,',
    '.jpg': 'data:image/jpeg;base64,',
    '.mp3': '',
    '.ttf': '',
    '.plist': 'data:text/plist;base64,',
    '.bin': 'data:application/octet-stream;base64,'
}

lo = {}
minimumMp3 = 'SUQzAwAAAAAAI1RTU0UAAAAPAAAATGF2ZjU4LjEyLjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAHAAADYABVVVVVVVVVVVVVVVVVVXFxcXFxcXFxcXFxcXFxjo6Ojo6Ojo6Ojo6Ojo6qqqqqqqqqqqqqqqqqqqrHx8fHx8fHx8fHx8fHx+Pj4+Pj4+Pj4+Pj4+Pj//////////////////8AAAAATGF2YzU4LjE4AAAAAAAAAAAAAAAAJAYgAAAAAAAAA2APRYUU//sUZAAAAE0A3q0EYAAAAA0goAABBAA/ghhjAAAAADSDAAAACAAA8EDFf8EAwOSPwot50IUdu5DWoDKrDYad2kyJJwoIixE77gEqx9FqqpoAAIdzgKNSahfsl//10/WG//sUZAkD8H8BY0cIAAgAAA0g4AABAYwDiwCEYAAAADSAAAAEwcGg7dl0j47vxWqSQSNgCRJFXOLIwWX//TE4xI0AYMAgJ1uvc1VFvPuQADxFUeYQLjb2f/+quSSNJgCR//sUZBiD8HMB4qBBEAAAAA0gAAABAagDiIEEACAAADSAAAAEFBdjGjJh1/+r/0LbbbawCW1PXJvhJ+96vbbJKIyM4Pvsx0hKEV8GIYjQSStAQIO1Q9C7BWU1ac+2XrUh//sUZCiD8HwAYUBBEAAAAA0gAAABAgQDgIEAAAAAADSAAAAETZLV/Ws06v7H/b9rc3p04AEkAAAckNPy43zHwpPBhW/DGf/KGPekJgJMQU1FMy45OS41qqqqqqqqqqqq//sUZDaD8G0A4iBBEAoAAA0gAAABAgwxgJQxACAAADSCgAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sUZEWAARMfWwYMwAIAAA0gwAAAAzRdMrkBAAAAADSDAAAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sUZEWP8AAAaQcAAAgAAA0g4AABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'

file_size_list = []
# Load map UUID -> relativePath
uuid_map_path = os.path.join("library", "uuid-to-mtime.json")
with open(uuid_map_path, "r", encoding="utf-8") as f:
    uuid_map = json.load(f)

def get_real_name_from_uuid(uuid, ext):
    info = uuid_map.get(uuid)
    if info and "relativePath" in info:
        return f"{info['relativePath']}{ext}"
    return f"{uuid}{ext}"  # fallback nếu không tìm thấy


def read_in_chunks(filePath, ad=""):
    extName = os.path.splitext(filePath)[1]

    fileSize = os.path.getsize(filePath)   # lấy dung lượng
    # Lưu vào danh sách để cuối cùng in ra
    file_size_list.append((filePath, fileSize))

    #print(f"📦 Đang đọc file: {filePath} ({fileSize} bytes)")

    if extName in fileByteList:
        file_object = open(filePath, 'rb')
        if (extName == '.mp3' and (ad == 'Adwords' or ad == 'Facebook')):
            base64Str = minimumMp3
        else:
            base64Str = base64.b64encode(file_object.read())
        base64Prefix = base64PrefixList[extName]
        if base64Prefix != None:
            if (extName == '.mp3' and (ad == 'Adwords' or ad == 'Facebook')):
                base64Str = base64Str
            else:
                base64Str = bytes(base64Prefix, 'utf-8') + base64Str
            return base64Str
    elif extName == '':
        return None

    file_object = open(filePath, encoding='utf-8')
    return file_object.read()


def writeToPath(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(data)

def fixPangle(fileJson, language):
    if language == 'kr':
        language = 'ko'
    if language == 'jp': 
        language = 'ja'
    newJson = fileJson.replace("{#language}", language, 1)
    return newJson

def getResMap(jsonObj, path, resPath, ad):
    fileList = os.listdir(path)
    for fileName in fileList:
        absPath = path + '/' + fileName
        if (os.path.isdir(absPath)):
            getResMap(jsonObj, absPath, resPath, ad)
        elif (os.path.isfile(absPath) and absPath.find("main/index.js") == -1):
            dataStr = read_in_chunks(absPath, ad)
            if dataStr != None:
                absPath = absPath.replace(resPath + '/', '')
                jsonObj[absPath] = dataStr


def getResMapScript(resPath, ad):
    jsonObj = {}
    getResMap(jsonObj, resPath, resPath, ad)
    jsonStr = simplejson.dumps(jsonObj)
    resStr = str("window.resMap = ") + jsonStr
    return resStr

# This issue is fixed in Cocos Creator 2.x


def fixEngineError(engineStr):
    newEngineStr = engineStr.replace(
        "t.content instanceof Image", "t.content.tagName === \"IMG\"", 1)
    return newEngineStr


def fixVersion(mainStr, cnt, v):
    newMainStr = mainStr.replace(
        'this.version="version"', 'this.version="' + v + '"', 1)
    return newMainStr
    

def fixTitle(mainStr, title):
    newMainStr = mainStr.replace("{#title}", title.replace('G_', '', 1), 1)
    newMainStr = newMainStr.replace(
        "this.PlayableAdsGame=this.defaultGame", "this.PlayableAdsGame=this." + title, 1)
    return newMainStr

def removeHttpRequest(mainStr):
    newMainStr = mainStr.replace(",getXMLHttpRequest:function(){return new XMLHttpRequest}", "", -1)
    newMainStr = newMainStr.replace(",new XMLHttpRequest", "", -1)
    newMainStr = newMainStr.replace('if("undefined"!=typeof XMLHttpRequest&&(!e||n))return new XMLHttpRequest', "", -1)
    newMainStr = newMainStr.replace('if("undefined"!=typeof XMLHttpRequest&&(!e||i))return new XMLHttpRequest', "", -1)
    newMainStr = newMainStr.replace('t.exports="undefined"!=typeof XMLHttpRequest&&"withCredentials"in new XMLHttpRequest', "", -1)
    newMainStr = newMainStr.replace('var n=new XMLHttpRequest;n.open("GET",t,!0),n.onload=function(){200==n.status?e(n.responseText):i(n.status,n.responseText)},n.onerror=function(){i(n.status,n.responseText)},n.send()', "", 1)
    newMainStr = newMainStr.replace('var n=new XMLHttpRequest;n.open("GET",t,!0),n.responseType="arraybuffer",n.onload=function(){200==n.status?e(new Uint8Array(n.response)):i(n.status,n.responseText)},n.onerror=function(){i(n.status,n.responseText)},n.send()', "", -1)
    newMainStr = newMainStr.replace('var n=new XMLHttpRequest;n.onreadystatechange=function(){n.readyState==XMLHttpRequest.DONE&&(n.status>=200&&n.status<300?i.rawAssets[e]=n.responseText:i.errors[e]="Couldn\'t load text "+e+": status "+n.status+", "+n.responseText)},n.open("GET",e,!0),n.send()', "", -1)
    newMainStr = newMainStr.replace('var n=new XMLHttpRequest;n.onreadystatechange=function(){n.readyState==XMLHttpRequest.DONE&&(n.status>=200&&n.status<300?i.rawAssets[e]=JSON.parse(n.responseText):i.errors[e]="Couldn\'t load text "+e+": status "+n.status+", "+n.responseText)},n.open("GET",e,!0),n.send()', "", -1)
    return newMainStr

def fixDev(mainStr):
    newMainStr = mainStr.replace("devs.defaultDev", "devs." + dev, 1)
    return newMainStr


def fixAds(mainStr, ad):
    newMainStr = mainStr.replace(
        "this.PlayableAdsType=this.defaultAds", "this.PlayableAdsType=this." + ad, 1)
    newMainStr = newMainStr.replace("javascript:0", '', -1)
    if (ad != "Adwords"):
        newMainStr = newMainStr.replace(
            "this.isSendInfo=0", 'this.isSendInfo=1', 1)
    return newMainStr


def readFile(filePath, extName='png'):
    file_object = open(filePath, 'rb')
    base64Str = base64.b64encode(file_object.read())
    base64Prefix = base64PrefixList['.' + extName]
    if base64Prefix != None:
        base64Str = bytes(base64Prefix, 'utf-8') + base64Str
        return base64Str


def localize(htmlStr, projectRootPath, title, language):
    path = projectRootPath + '/assets/TextureLocalize/' + title + '/' + language
    for x, y in lo.items():
        if os.path.exists(path + '/' + x):
            obj = readFile(path + '/' + x).decode('utf-8')
            htmlStr = htmlStr.replace(y, obj, -1)
    htmlStr = htmlStr.replace("this.language=this.EN",
                              "this.language=this." + language.upper(), 1)
    return htmlStr


def initDictionary(projectRootPath):
    path = projectRootPath + '/assets/TextureLocalize/' + titles[0] + '/en'
    obj = os.scandir(path)
    for entry in obj:
        name = str(entry)[11:-2]
        extName = name.split('.')
        if (len(extName) > 1):
            extName = extName[len(extName)-1]
            if (extName == 'png'):
                lo[name] = readFile(path + '/' + name, extName).decode("utf-8")


def integrate(projectRootPath):
    # shutil.rmtree('./output', ignore_errors=True)
    initDictionary(projectRootPath)
    for title in titles:
        for lang in languages:
            for x in ads:
                cnt = 1
                for v in version:
                    Path("./output/" + title + "/" + date + "/" + v + "/" +
                         x).mkdir(parents=True, exist_ok=True)
                    htmlPath = projectRootPath + '/build/web-mobile/' + x + '.html'

                    settingScrPath = projectRootPath + '/build/web-mobile/src/settings.js'
                    yandexSrcPath = projectRootPath + '/build/web-mobile/yandex.js'
                    maioSrcPath = projectRootPath + '/build/web-mobile/maio.1.1.3.min.js'
                    engineScrPath = projectRootPath + '/build/web-mobile/cocos2d-js-min.js'
                    projectScrPath = projectRootPath + '/build/web-mobile/assets/main/index.js'
                    physicScrPath = projectRootPath + '/build/web-mobile/physics-min.js'
                    lunaScrPath = projectRootPath + '/build/web-mobile/luna.json'
                    playgroundScrPath = projectRootPath + '/build/web-mobile/playground.json'
                    resPath = projectRootPath + '/build/web-mobile/assets'
                    if (x == 'Yandex'):
                        Path("./output/" + title + "/" + date + "/" + v + "/" + x + "/" +
                             date + '_' + title + '_' + \
                                prefix + x + '_' + \
                                v.replace('.', '_') + '_' + dev + \
                                '_' + lang.upper()).mkdir(parents=True, exist_ok=True)
                        htmlStr = read_in_chunks(htmlPath)
                        htmlStr = fixTitle(htmlStr, title)

                        newHtmlPath = './output/' + title + "/" + date + "/" + v + "/" + \
                            x + '/' + date + '_' + title + '_' + \
                                prefix + x + '_' + \
                                v.replace('.', '_') + '_' + dev + \
                                '_' + lang.upper() + '/index.html'
                        writeToPath(newHtmlPath, htmlStr)
                        Path("./output/" + title + "/" + date + "/" + v + "/" + x + "/" + date + '_' + title + '_' + \
                                prefix + x + '_' + \
                                v.replace('.', '_') + '_' + dev + \
                                '_' + lang.upper() +
                             "/scripts").mkdir(parents=True, exist_ok=True)

                        jsStr = read_in_chunks(yandexSrcPath)
                        settingsStr = read_in_chunks(settingScrPath)
                        jsStr = jsStr.replace(settingMatchKey, settingsStr, 1)

                        projectStr = read_in_chunks(projectScrPath)
                        
                        jsStr = jsStr.replace(projectMatchKey, projectStr, 1)

                        engineStr = read_in_chunks(engineScrPath)
                        engineStr = fixEngineError(engineStr)
                        if os.path.isfile(physicScrPath):
                            engineStr += read_in_chunks(physicScrPath)
                        jsStr = jsStr.replace(engineMatchKey, engineStr, 1)

                        resStr = getResMapScript(resPath, x)
                        jsStr = jsStr.replace(resMapMatchKey, resStr, 1)

                        jsStr = fixTitle(jsStr, title)
                        jsStr = fixDev(jsStr)

                        jsStr = localize(jsStr, projectRootPath, title, lang)

                        jsStr = fixAds(jsStr, x)
                        jsStr = fixVersion(jsStr, cnt, v)
                        cnt = cnt + 1

                        newHtmlPath = './output/' + title + "/" + date + "/" + v + "/" + \
                            x + "/" + date + '_' + title + '_' + \
                                prefix + x + '_' + \
                                v.replace('.', '_') + '_' + dev + \
                                '_' + lang.upper() + '/scripts/main.js'
                        writeToPath(newHtmlPath, jsStr)
                    else:
                        htmlStr = read_in_chunks(htmlPath)
                        settingsStr = read_in_chunks(settingScrPath)
                        htmlStr = htmlStr.replace(settingMatchKey, settingsStr, 1)

                        projectStr = read_in_chunks(projectScrPath)
                        htmlStr = htmlStr.replace(projectMatchKey, projectStr, 1)
                        
                        engineStr = read_in_chunks(engineScrPath)
                        engineStr = fixEngineError(engineStr)
                        if os.path.isfile(physicScrPath):
                            engineStr += '</script><script>' + read_in_chunks(physicScrPath)
                        
                        htmlStr = htmlStr.replace(engineMatchKey, engineStr, 1)

                        resStr = getResMapScript(resPath, x)
                        htmlStr = htmlStr.replace(resMapMatchKey, resStr, 1)

                        htmlStr = fixTitle(htmlStr, title)
                        htmlStr = fixDev(htmlStr)

                        htmlStr = localize(htmlStr, projectRootPath, title, lang)
                        htmlStr = removeHttpRequest(htmlStr)
                        htmlStr = fixAds(htmlStr, x)
                        htmlStr = fixVersion(htmlStr, cnt, v)
                        cnt = cnt + 1
                        if (x == 'Adwords'):
                            newHtmlPath1 = './output/' + title + "/" + date + "/" + v + "/" + x + '/' + date + '_' + title + '_' + \
                                prefix + 'GA_32x48' + \
                                v.replace('.', '_') + '_' + dev + \
                                '_' + lang.upper() + '.html'
                            writeToPath(newHtmlPath1, htmlStr)
                            newHtmlPath2 = './output/' + title + "/" + date + "/" + v + "/" + x + '/' + date + '_' + title + '_' + \
                                prefix + 'GA_48x32' + \
                                v.replace('.', '_') + '_' + dev + \
                                '_' + lang.upper() + '.html'
                            writeToPath(newHtmlPath2, htmlStr.replace(
                                '<meta name="ad.size" content="width=320,height=480">', '<meta name="ad.size" content="width=480,height=320">', 1))
                        elif (x == 'Maio'):
                            Path("./output/" + title + "/" + date + "/" + v + "/" + x + "/" + lang.upper() +
                                    "/scripts").mkdir(parents=True, exist_ok=True)
                            newHtmlPath = "./output/" + title + "/" + date + "/" + v + "/" + \
                                x + "/" + lang.upper() + "/index.html"
                            writeToPath(newHtmlPath, htmlStr)
                            shutil.copy2(
                                maioSrcPath, "./output/" + title + "/" + date + "/" + v + "/" + x + "/" + lang.upper() + "/scripts")
                        elif (x == 'Moloco'):
                            Path("./output/" + title + "/" + date + "/" + v + "/" + x + "/" + lang.upper()).mkdir(parents=True, exist_ok=True)
                            newHtmlPath = "./output/" + title + "/" + date + "/" + v + "/" + \
                                x + "/" + lang.upper() + "/index.html"
                            writeToPath(newHtmlPath, htmlStr)
                        else:
                            newHtmlPath = './output/' + title + "/" + date + "/" + v + "/" + x + '/' + date + '_' + title + '_' + \
                                prefix + x + '_' + \
                                v.replace('.', '_') + '_' + dev + \
                                '_' + lang.upper() + '.html'
                            writeToPath(newHtmlPath, htmlStr)

                        if x == "Adwords" or x == "Mintegral" or x == "Maio" or x == "Pangle" or x == "Vungle" or x == "source" or x == "Yandex":
                            if (x == "Adwords"):
                                newZipPath1 = './output/' + title + "/" + date + "/" + v + "/" + x + '/' + date + '_' + title + '_' + prefix + \
                                    'GA_32x48' + '_' + \
                                    v.replace('.', '_') + '_' + dev + \
                                    '_' + lang.upper() + '.zip'
                                zipObj = zipfile.ZipFile(newZipPath1, 'w')
                                zipObj.write(newHtmlPath1, date + '_' + title + '_' + prefix + x + '_320x480' + '_' + v.replace(
                                    '.', '_') + '_' + dev + '_' + lang.upper() + '.html', compress_type=zipfile.ZIP_DEFLATED)
                                zipObj.close()
                                os.remove(newHtmlPath1)
                                newHtmlPath1 = newZipPath1

                                newZipPath2 = './output/' + title + "/" + date + "/" + v + "/" + x + '/' + date + '_' + title + '_' + prefix + \
                                    'GA_48x32' + '_' + \
                                    v.replace('.', '_') + '_' + dev + \
                                    '_' + lang.upper() + '.zip'
                                zipObj = zipfile.ZipFile(newZipPath2, 'w')
                                zipObj.write(newHtmlPath2, date + '_' + title + '_' + prefix + x + '_480x320' + '_' + v.replace(
                                    '.', '_') + '_' + dev + '_' + lang.upper() + '.html', compress_type=zipfile.ZIP_DEFLATED)
                                zipObj.close()
                                os.remove(newHtmlPath2)
                                newHtmlPath2 = newZipPath2
                            elif (x == 'Maio'):
                                newZipPath = './output/' + title + "/" + date + "/" + v + "/" + x + '/' + lang.upper() + '/' + date + '_' + title + \
                                    '_' + prefix + x + '_' + \
                                    v.replace('.', '_') + '_' + dev + \
                                    '_' + lang.upper() + '.zip'
                                zipObj = zipfile.ZipFile(newZipPath, 'w')
                                zipObj.write(newHtmlPath, "index.html",
                                                compress_type=zipfile.ZIP_DEFLATED)
                                zipObj.write("./output/" + title + "/" + date + "/" + v + "/" + x + "/" + lang.upper(
                                ) + "/scripts/maio.1.1.3.min.js", "scripts/maio.1.1.3.min.js", compress_type=zipfile.ZIP_DEFLATED)
                                zipObj.close()
                                os.remove(newHtmlPath)
                                shutil.rmtree(
                                    "./output/" + title + "/" + date + "/" + v + "/" + x + "/" + lang.upper() + "/scripts")
                                newHtmlPath = newZipPath
                            elif (x == "Pangle"):
                                newZipPath = './output/' + title + "/" + date + "/" + v + "/" + x + '/' + date + '_' + title + '_' + prefix + x + '_' + v.replace('.', '_') + '_' + dev + '_' + lang.upper() + '.zip'
                                zipObj = zipfile.ZipFile(newZipPath, 'w')
                                zipObj.write(newHtmlPath, 'index.html', compress_type = zipfile.ZIP_DEFLATED)
                                json = read_in_chunks(projectRootPath + '/build-templates/web-mobile/config.json')
                                json = fixPangle(json, lang.lower())
                                newJson = './output/' + title + "/" + date + "/" + v + "/" + x + '/config.json'
                                writeToPath(newJson, json)
                                zipObj.write(newJson, 'config.json', compress_type = zipfile.ZIP_DEFLATED)
                                zipObj.close()
                                os.remove(newJson)
                                os.remove(newHtmlPath)
                                newHtmlPath = newZipPath
                            elif (x == "Vungle"):
                                newZipPath = './output/' + title + "/" + date + "/" + v + "/" + x + '/' + date + '_' + title + '_' + \
                                    prefix + x + '_' + \
                                    v.replace('.', '_') + '_' + dev + \
                                    '_' + lang.upper() + '.zip'
                                zipObj = zipfile.ZipFile(newZipPath, 'w')
                                zipObj.write(newHtmlPath, 'ad.html', compress_type=zipfile.ZIP_DEFLATED)
                                zipObj.close()
                                os.remove(newHtmlPath)
                                newHtmlPath = newZipPath
                            elif (x == "source"):
                                newZipPath = './output/' + title + '_' + lang.upper() + '_Source_Luna.zip'
                                zipObj = zipfile.ZipFile(newZipPath, 'w')
                                zipObj.write(newHtmlPath, "source.html", compress_type=zipfile.ZIP_DEFLATED)
                                zipObj.write(lunaScrPath, "luna.json", compress_type=zipfile.ZIP_DEFLATED)
                                zipObj.write(playgroundScrPath, "playground.json", compress_type=zipfile.ZIP_DEFLATED)
                                zipObj.close()
                                os.remove(newHtmlPath)
                                newHtmlPath = newZipPath
                            else:
                                newZipPath = './output/' + title + "/" + date + "/" + v + "/" + x + '/' + date + '_' + title + '_' + \
                                    prefix + x + '_' + \
                                    v.replace('.', '_') + '_' + dev + \
                                    '_' + lang.upper() + '.zip'
                                zipObj = zipfile.ZipFile(newZipPath, 'w')
                                zipObj.write(newHtmlPath, date + '_' + title + '_' + prefix + x + '_' + v.replace(
                                    '.', '_') + '_' + dev + '_' + lang.upper() + '.html', compress_type=zipfile.ZIP_DEFLATED)
                                zipObj.close()
                                os.remove(newHtmlPath)
                                newHtmlPath = newZipPath

                        if (x == "Adwords"):
                            targetFileSize = os.path.getsize(newHtmlPath1)
                            targetFileSizeInMegabyte = math.ceil(
                                targetFileSize * 1000 / (1024 * 1024)) / 1000
                            print("Target file = {}, with size {}M".format(
                                newHtmlPath1, targetFileSizeInMegabyte))
                            targetFileSize = os.path.getsize(newHtmlPath2)
                            targetFileSizeInMegabyte = math.ceil(
                                targetFileSize * 1000 / (1024 * 1024)) / 1000
                            print("Target file = {}, with size {}M".format(
                                newHtmlPath2, targetFileSizeInMegabyte))
                        else:
                            targetFileSize = os.path.getsize(newHtmlPath)
                            targetFileSizeInMegabyte = math.ceil(
                                targetFileSize * 1000 / (1024 * 1024)) / 1000
                            print("Target file = {}, with size {}M".format(
                                newHtmlPath, targetFileSizeInMegabyte))
    print("===================  All Done! =================== ")
    print("\n=================== Danh sách file theo dung lượng giảm dần ===================")
    unique_files = list(dict.fromkeys(file_size_list))  # giữ nguyên thứ tự, loại trùng
    for filePath, size in sorted(unique_files, key=lambda x: x[1], reverse=True):
        size_kb = size / 1024
        real_name = filePath

        if "build/web-mobile/assets/" in filePath:
            uuid = os.path.splitext(os.path.basename(filePath))[0]  # lấy uuid
            ext = os.path.splitext(filePath)[1]
            real_name = get_real_name_from_uuid(uuid, ext)

        print(f"{size_kb:8.2f} KB  -  {real_name}")


if __name__ == '__main__':
    workDir = os.getcwd() + "/.."
    integrate(workDir)