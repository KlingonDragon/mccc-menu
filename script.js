//fake jquery (shortened selector code) and other prototypes
window.$ = selector => document.querySelector(selector);
window.$$ = selector => document.querySelectorAll(selector);
HTMLElement.prototype.$ = function (selector) { return this.querySelector(selector); };
HTMLElement.prototype.$$ = function (selector) { return this.querySelectorAll(selector); };
String.prototype.quickHash = function() {
    let hash = 0;
    if (this.length == 0) { return hash; }
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

const lang = ((supported_langs) => {
    for (let user_lang of navigator.languages) {
        for (let site_lang of supported_langs) {
            if (user_lang.indexOf(site_lang) != -1) {
                if (user_lang == 'zh' || user_lang == 'zh-HK') { return 'zh-CN'; }
                return site_lang;
            }
        }
    }
    return 'en';
})(['cs','da','de','en','es','fr','it','ja','ko','nl','pl','pt','ru','se','zh-CN','zh-TW', 'zh'])

function upLevel() {
    path = location.hash.split('/');
    path.pop();
    location.hash = path.join('/');
}

function menuRender(path) {
    path = path.split('#').pop();
    location.hash = path
    fetch(`/menu_data/${path}.json`).then(response => {
        if (!response.ok) {
            if (response.status == 404) {throw 'Menu Data Not found\n\nThis Tool may need updating for recent updates to MCCC. Please try again later.'}
            throw `${response.status} - ${response.statusText}`;
        }
        return response.json()
    }).then(data => {
        // console.log(data);
        $('title').innerText = `MCCC Menu Online | ${((id) => {
            if (!id) { return ':('; }
            let stringStorage = localStorage.getItem(`string-${lang}-${id}`);
            if ((stringStorage = JSON.parse(stringStorage)) && (stringStorage.timestamp > Date.now() - (2 * 24 * 60 * 60 *1000))) {
                return stringStorage.string;
            }
            return id;
        })(data.title)}`;
        $('section#title').innerHTML = `<get-string>${data.title}</get-string>`;
        $('section#desc').innerHTML = data.desc ? (data.desc == 'mccc_desc' ? versionInfo():`<get-string>${data.desc}</get-string>`):'';
        $('section#minmax').innerHTML = `${data.min ? `<get-string replace-what="{0.String}" replace-with="${data.min}">0xDE0BE05D</get-string>` : ''}&ensp;${data.max ? `<get-string replace-what="{0.String}" replace-with="${data.max}">0x152D68FF</get-string>` : ''}`;
        $('section#buttons').innerHTML = '';
        if (data.input) {
            $('section#input').innerHTML = `<input type="text" value="${data.input}" />`;
            $('section#buttons').classList.add('old');
            $('section#buttons').innerHTML = `
<button class="default"><get-string>0x71C6E31F</get-string></button>
<button class="back"><get-string>back</get-string></button>
<button class="back"><get-string>ok</get-string></button>
            `;
            $$('section#buttons .back').forEach((button => {
                button.onclick = upLevel;
            }))
            $$('section#buttons .default').forEach((button => {
                button.onclick = () => { 
                    $('section#input input').value = data.input;
                 };
            }))
        } else {
            $('section#input').innerHTML = '';
        }
        if (data.items) {
            $('section#buttons').classList.remove('old');
            if (data.default) {
                let button = document.createElement('button');
                button.innerHTML = `
<img alt=""/>
<div class="info">
    <div class="title"><get-string>0x71C6E31F</get-string></div>
    <div class="desc">${defaultMenuOption(data.default)}</div>
</div>
                `;
                $('section#buttons').appendChild(button);
            }
            let useIcon = data.default || data.items.reduce((useIcons, item) => useIcons || item.img, false);
            data.items.forEach(item => {
                let button = document.createElement(item.link && item.link != 'self'? 'a':'button');
                if (item.link && item.link != 'self') { button.href = `#${`${path}/${item.link}`.split('#').pop()}`; }
                button.innerHTML = `
${useIcon ? `<img alt="" ${item.img ? icon(item.img):(data.default && item.name == data.default ? '<img alt="" src="img/icons/0xA3B15EEB3A5DB990.png"':'')}/>`:''}
<div class="info">
    <div class="title"><get-string>${item.name || item.link}</get-string></div>
    <div class="desc">${item.desc ? `<get-string>${item.desc}</get-string>` : menu_desc(`${path}/${item.link}`)}</div>
</div>
                `;
                $('section#buttons').appendChild(button);
            });
        }
        if (data.enabled_disabled) {
            $('section#buttons').innerHTML = `
<button>
    <img alt=""/>
    <div class="info">
        <div class="title"><get-string>0x71C6E31F</get-string></div>
        <div class="desc">${defaultMenuOption(data.default)}</div>
    </div>
</button>
<button>
    <img alt="" ${data.default == 'disabled' ? icon('0xA3B15EEB3A5DB990'):''}/>
    <div class="info">
        <div class="title"><get-string>disabled</get-string></div>
        <div class="desc"></div>
    </div>
</button>
<button>
    <img alt="" ${data.default == 'enabled' ? icon('0xA3B15EEB3A5DB990'):''}/>
    <div class="info">
        <div class="title"><get-string>enabled</get-string></div>
        <div class="desc"></div>
    </div>
</button>
            `;
        }
        if (path == 'MCCC' || path == 'Help' || data?.done) {
            $('section#back').classList.add('hidden');
        } else {
            $('section#back').classList.remove('hidden');
        }
        if (data?.done) {
            $('section#done').classList.remove('hidden');
        } else {
            $('section#done').classList.add('hidden');
        }
        $('section#path').innerHTML = pathStrings(path);
    }).catch(error => {
        console.error(`menuRender(${path}) - Fetch Error:`, error);
        alert(error);
        history.back();
    });
}
function pathStrings(path) {
    let buildup = '|';
    return path.split('/').reduce((old, next) => {
        let hash = next.quickHash();
        buildup += `/${next}`;
        fetch(`/menu_data/${buildup.replace('|/', '')}.json`).then(response => {
            if (!response.ok) { throw `${response.status} - ${response.statusText}`; }
            return response.json()
        }).then(data => {
            $$(`output.path_${hash}`).forEach(output=>output.outerHTML = `<get-string>${data.title}</get-string>`);
        });
        return `${old} &gt; <output class="path_${hash}">${decodeURI(next)}</output>`;
    }, '|').replace('| &gt; ', '');
}
function menu_desc(path) {
    let id = path.quickHash();
    fetch(`/menu_data/${path}.json`).then(response => {
        if (!response.ok) { throw `${response.status} - ${response.statusText}`; }
        return response.json()
    }).then(data => {
        $$(`output.desc_${id}`).forEach(output=>output.outerHTML = data.desc ? `<get-string>${data.desc}</get-string>` :'');
    }).catch(error => {
        console.error(`menu_desc(${path}) - Fetch Error:`, error)
    });
    return `<output class="desc_${id}"></output>`;
}
function defaultMenuOption(default_value) {
    if (Array.isArray(default_value)) {
        return default_value.reduce(old, next => `${old}, <get-string>${next}</get-string>`, '|').replace('|, ', '');
    }
    return `<get-string replace-what="{0.String}" replace-with-string="${default_value}">set_default_value</get-string>`
}
function icon(id) {
    return `src="/img/icons/${id.toUpperCase().replace(/^0X/, '0x')}.png"`;
}

function search(searchtext) {
    if (!searchtext) {
        document.getElementById('results').innerHTML = '';
        return;
    }
	let searchXHR = new XMLHttpRequest();
    searchXHR.open('GET', `search.php?q=${searchtext}&lang=${lang}`);
    searchXHR.onload = function () {
        document.getElementById('results').innerHTML = this.responseText;
    }
    searchXHR.send();
}
function versionInfo() {
    Promise.all([fetch('/version.php'), new Promise(resolve=>queueMicrotask(resolve))]).then(([response,wait]) => response.json()).then(data => {
        $(`output#version_mccc`).outerHTML = data.mccc;
        $(`output#version_sims`).outerHTML = data.sims;
    }).catch(error => {
        console.error(`versionInfo() - Fetch Error:`, error)
    });
    return `<get-string>mccc_version</get-string> <output id="version_mccc"></output><br/><get-string>sims_version</get-string> <output id="version_sims"></output><br/>`
}
//On page load:
onpopstate = event => menuRender(location.hash);
window.addEventListener('DOMContentLoaded', () => {
    //define <get-string> element that will replace the id with a string for the correct language (falls back to english if not found)
    customElements.define('get-string', class extends HTMLElement {
        static get observedAttributes() { return ['is-text']; }
        get isText() {
            return this.hasAttribute('is-text');
        }
        set isText(value) {
            if (value) {
                this.setAttribute('is-text', '');
            } else {
                this.removeAttribute('is-text');
            }
        }
        get replaceWhat() {
            return this.getAttribute('replace-what');
        }
        set replaceWhat(value) {
            return this.setAttribute('replace-what', value);
        }
        get replaceWith() {
            return this.getAttribute('replace-with');
        }
        set replaceWith(value) {
            return this.getAttribute('replace-with', value);
        }
        get replaceWithString() {
            return this.getAttribute('replace-with-string');
        }
        set replaceWithString(value) {
            return this.getAttribute('replace-with-string', value);
        }
        constructor() {
            // Always call super first in constructor
            super();
        }
        connectedCallback() {
            this.getString(lang);
            this.onclick = () => { this.getString(lang) }
        }
        adoptedCallback() {
            this.getString(lang);
        }
        getString(language) {
            if (this.isText) { return; }
            let id = this.textContent,
                stringStorage = localStorage.getItem(`string-${language}-${id}`);
            if ((stringStorage = JSON.parse(stringStorage)) && (stringStorage.timestamp > Date.now() - (2 * 24 * 60 * 60 *1000))) {
                if (this.replaceWithString) {
                    this.textContent = stringStorage.string.replace(this.replaceWhat, `|${this.replaceWhat}|`);
                    this.innerHTML = this.innerHTML.replace(`|${this.replaceWhat}|`,`<get-string>${this.replaceWithString}</get-string>`);
                } else if (this.replaceWith) {
                    this.textContent = stringStorage.string.replace(this.replaceWhat, this.replaceWith);
                } else {
                    this.textContent = stringStorage.string;
                }
                this.isText = true;
                return;
            }
            fetch(`/strings/${language}/${id}`).then(response => {
                if (!response.ok) {
                    if (response.status == 404 && language != 'en') { this.getString('en'); }
                    throw `${response.status} - ${response.statusText}`;
                }
                return response.text();
            }).then(string_text => {
                string_text = string_text.replace(/\&quot\;/gim, '"');
                localStorage.setItem(`string-${language}-${id}`, JSON.stringify({ string: string_text, timestamp: Date.now() }));
                this.textContent = string_text.replace(this.replaceWhat, this.replaceWith);
                this.isText = true;
            }).catch(error => {
                console.error(`get-string - ${language}/${id} - Fetch Error:`, error);
            });
        }
    });
    $('html').lang = lang;
    $('section#back button').onclick = upLevel;
    $('section#done button').onclick = upLevel;
    menuRender(location.hash || '#MCCC');
});
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register('/worker.js')
}