//fake jquery (shortened selector code)
window.$ = selector => document.querySelector(selector);
window.$$ = selector => document.querySelectorAll(selector);
HTMLElement.prototype.$ = function (selector) { return this.querySelector(selector); };
HTMLElement.prototype.$$ = function (selector) { return this.querySelectorAll(selector); };

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
        data.items.forEach(item => {
            let button = document.createElement('a');
            button.href = `#${path}/${item.link}`;
            button.innerHTML = `
${item.img ? `<img src="/img/icons/${item.img}.png" />` : ''}
<div class="info">
    <div class="title">${string(item.name || item.link)}</div>
    <div class="desc">${item.desc ? string(item.desc) : ''}</div>
</div>`;
            $('section#buttons').appendChild(button);
        });
        $('section#path').innerHTML = decodeURI(path).replace(/\//g, ' > ')
    }).catch(error => {
        console.error(`menuRender(${path}) - Fetch Error:`, error);
        alert(error);
        history.back();
    });
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
function string(id) {
    if (!id) {return false;}
    let stringStorage = localStorage.getItem(`string-${lang}-${id}`);
    if ((stringStorage = JSON.parse(stringStorage)) && (stringStorage.timestamp > Date.now() - (2 * 24 * 60 * 60 *1000))) {
        return stringStorage.string;
    }
    fetch(`/strings/${lang}/${id}`).then(response => {
        if (!response.ok) { throw new Error('Network response was not OK'); }
        return response.text()
    }).then(string_text => {
        localStorage.setItem(`string-${lang}-${id}`, JSON.stringify({ string: string_text, timestamp: Date.now() }));
        $(`output#string_${id}`).outerHTML = string_text;
    }).catch(error => {
        console.error(`string(${id}) - Fetch Error:`, error)
    });
    return `<output id="string_${id}">${id}</output>`;
}

//On page load:
onpopstate = event => menuRender(location.hash);
window.addEventListener('DOMContentLoaded', () => {
    $('section#back button').onclick = () => {
        history.back();
    }
    menuRender(location.hash || '#MCCC');
});