


function search(searchtext) {
    if (!searchtext) {
        document.getElementById('results').innerHTML = '';
        return;
    }
	sxhr = new XMLHttpRequest();
    sxhr.open('GET', `search.php?q=${searchtext}`);
    sxhr.onload = function () {
        document.getElementById('results').innerHTML = this.responseText;
    }
    sxhr.send();
}