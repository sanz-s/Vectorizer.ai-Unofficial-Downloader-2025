from DrissionPage import Chromium
import DrissionPage.errors
import time

dp = Chromium()
dp.latest_tab.get("https://vectorizer.ai/");
with open("inject.js","r",encoding="utf-8") as js_file:
    js_inject = js_file.read()
isNeedToRun = True
while isNeedToRun:
    time.sleep(0.5)
    for tab in Chromium()._get_tabs():
        if tab.url.startswith("https://vectorizer.ai/images/") and tab.ele("#App-DownloadLink") and tab.run_js("return window.isActivated;") == None:
            tab.run_js(js_inject)
        if tab.run_js("return window.isActivated;") == "done":
            isNeedToRun=False


