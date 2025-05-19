from DrissionPage import ChromiumPage
import time

dp = ChromiumPage()

last_url = dp.url
print('👀 Watching for navigation...')
dp.get("https://vectorizer.ai/");

while True:
    current_url = dp.url
    if current_url != last_url:
        print(f'🚀 New page loaded: {current_url}')

        with open('inject.js', 'r', encoding='utf-8') as f:
            inject_js = f.read()
        dp.run_js(inject_js)
        time.sleep(0.5);
        if(dp.url.startswith("https://vectorizer.ai/images/") and dp.url.endswith("edit")):
            while True:
                bar = dp.ele('#App-Progress-Download-Bar')
                if not bar:
                    time.sleep(0.5)
                    continue
                width = bar.style('width')
                if width == '100%' or not(dp.url.startswith("https://vectorizer.ai/images/") and dp.url.endswith("edit")):
                    break
                time.sleep(0.5)

            dp.run_js('''document.querySelector(".showPaid").innerHTML = "Free Download";
                         document.querySelector("#App-DownloadLink").href = "javascript:void(0)";
                         document.querySelector("#App-DownloadLink").style.background = "lightgreen";
                         document.querySelector("#App-DownloadLink").onclick = function(){
                            var a = document.createElement("a");
                            a.download = document.querySelector("title").innerText.split(".")[0].trim()+".svg";
                            a.href = window.URL.createObjectURL(new Blob([down()],{type:"image/svg+xml"}));
                            a.click();
                         };
                         alert("Free Download Activated !");
                    ''')
            
        last_url = current_url

    time.sleep(0.5)