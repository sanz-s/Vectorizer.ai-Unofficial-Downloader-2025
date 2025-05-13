from DrissionPage import ChromiumPage
import time

def wait_for_url_stable(page, wait_secs=3):
    last_url = ''
    stable_count = 0
    while stable_count < wait_secs * 2:
        curr_url = page.url
        if curr_url == last_url:
            stable_count += 1
        else:
            stable_count = 0
            last_url = curr_url
        time.sleep(0.5)

def main():
    page = ChromiumPage()
    page.get('https://vectorizer.ai/')

    wait_for_url_stable(page)

   
    with open('inject.js', 'r', encoding='utf-8') as f:
        inject_js = f.read()
    page.run_js(inject_js)

    while True:
        bar = page.ele('#App-Progress-Download-Bar')
        if not bar:
            time.sleep(0.5)
            continue
        width = bar.style('width')
        if width == '100%':
            break
        time.sleep(0.5)

    val = page.run_js('return down();')

    with open('output.svg', 'w', encoding='utf-8') as f:
        f.write(val)
        page.run_js('alert("Download Successful!")')

if __name__ == "__main__":
    main()
