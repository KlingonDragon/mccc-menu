//fake jquery (shortened selector code) and other prototypes
window.$ = selector => document.querySelector(selector);
window.$$ = selector => document.querySelectorAll(selector);
HTMLElement.prototype.$ = function (selector) { return this.querySelector(selector); };
HTMLElement.prototype.$$ = function (selector) { return this.querySelectorAll(selector); };
String.prototype.quickHash = function() {
    let hash = 0;
    if (this.length == 0) { return hash; }
    for (i = 0; i < this.length; i++) {
        char = string[i];
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

const lang = ((supported_langs) => {
    for (let lang of navigator.languages) {
        lang = lang.substring(0, 2);
        if (supported_langs.indexOf(lang) != -1) {
            return lang;
        }
    }
    return 'en';
})(['en','de'])

function menuRender(path) {
    path = path[0] == '#' ? path.substring(1): path;
    $('section#back').classList.toggle('hidden', path == 'MCCC');
    location.hash = path
    fetch(`/menu_data/${path}.json`).then(response => {
        if (!response.ok) { throw new Error('Network response was not OK'); }
        return response.json()
    }).then(data => {
        console.log(data);
        $('section#title').innerHTML = string(data.title);
        $('section#desc').innerHTML = string(data.desc) || '';
        $('section#buttons').innerHTML = '';
        if (data.input) {
            $('section#input').innerHTML = `<input type="text" value="${data.input}"/>`;
            $('section#buttons').classList.add('old');
            $('section#buttons').innerHTML = `
<button class="default">${string('default_value')}</button>
<button class="back">${string('back')}</button>
<button class="back">${string('ok')}</button>
            `;
            $$('section#buttons .back').forEach((button => {
                button.onclick = () => { history.back(); };
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
<img/>
<div class="info">
    <div class="title">${string('default_value')}</div>
    <div class="desc">${defaultMenuOption(data.default)}</div>
</div>
                `;
                $('section#buttons').appendChild(button);
            }
            data.items.forEach(item => {
                let button = document.createElement(item.link == 'self'? 'button':'a');
                if (item.link != 'self') { button.href = `#${path}/${item.link}`; }
                button.innerHTML = `
${item.img ? `<img ${icon(item.img)}/>` : data.default ? (item.name == data.default ? '<img src="img/icons/0xA3B15EEB3A5DB990.png"/>':'<img/>'): ''}
<div class="info">
    <div class="title">${string(item.name || item.link)}</div>
    <div class="desc">${item.desc ? string(item.desc) : menu_desc(`${path}/${item.link}`)}</div>
</div>
                `;
                $('section#buttons').appendChild(button);
            });
        }
        if (data.enabled_disabled) {
            $('section#buttons').innerHTML = `
<button>
    <img/>
    <div class="info">
        <div class="title">${string('default_value')}</div>
        <div class="desc">${defaultMenuOption(data.default)}</div>
    </div>
</button>
<button>
    <img ${data.default == 'disabled' ? icon('0xA3B15EEB3A5DB990'):''}/>
    <div class="info">
        <div class="title">${string('disabled')}</div>
        <div class="desc"></div>
    </div>
</button>
<button>
    <img ${data.default == 'enabled' ? icon('0xA3B15EEB3A5DB990'):''}/>
    <div class="info">
        <div class="title">${string('enabled')}</div>
        <div class="desc"></div>
    </div>
</button>
            `;
        }
        $('section#path').innerHTML = decodeURI(path).replace(/\//g, ' > ')
    }).catch(error => {
        console.error(`menuRender(${path}) - Fetch Error:`, error);
        alert(error);
        history.back();
    });
}
function menu_desc(path) {
    let id = path.quickHash();
    fetch(`/menu_data/${path}.json`).then(response => {
        if (!response.ok) { throw new Error('Network response was not OK'); }
        return response.json()
    }).then(data => {
        $(`output#desc_${id}`).outerHTML = data.desc ? string(data.desc) :'';
    }).catch(error => {
        console.error(`menu_desc(${path}) - Fetch Error:`, error)
    });
    return `<output id="desc_${id}"></output>`;
}
function defaultMenuOption(default_value) {
    if (Array.isArray(default_value)) {
        return default_value.reduce(old, next => `${old}, ${string(next)}`, '|').replace('|, ', '');
    }
    return string('set_default_value', '{0.String}', string(default_value))
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
function string(id, replace = '', replace_with = '') {
    if (!id) {return false;}
    let stringStorage = localStorage.getItem(`string-${lang}-${id}`);
    if ((stringStorage = JSON.parse(stringStorage)) && (stringStorage.timestamp > Date.now() - (2 * 24 * 60 * 60 *1000))) {
        return stringStorage.string.replace(replace, replace_with);
    }
    fetch(`/strings/${lang}/${id}`).then(response => {
        if (!response.ok) { throw new Error('Network response was not OK'); }
        return response.text()
    }).then(string_text => {
        localStorage.setItem(`string-${lang}-${id}`, JSON.stringify({ string: string_text, timestamp: Date.now() }));
        $(`output#string_${id}`).outerHTML = string_text.replace(replace, replace_with);
    }).catch(error => {
        console.error(`string(${id}) - Fetch Error:`, error)
    });
    return `<output id="string_${id}">${id}</output>`;
}

//On page load:
onpopstate = event => menuRender(location.hash);
window.addEventListener('DOMContentLoaded', () => {
    $('section#back button').onclick = () => { history.back(); };
    menuRender(location.hash || '#MCCC');
});