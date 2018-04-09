// jshint -W117

'use strict';

require('./materialize/sass/materialize.scss');
require('./materialize/js/bin/materialize.min.js');
require('./animate.css');
require('./style.scss');
const $ = require('./jquery-3.3.1.min.js');

$('#input-search').focus();

$('#random').click(() => {
    window.open('https://en.wikipedia.org/wiki/Special:Random');
});

$('#label-search').click(() => {
    let query = $('#input-search').val();
    if (query) { // jshint ignore: start
        (async () => {
            let results = await getResults(query);
            displayResults(results);
        })(); 
        // jshint ignore: end       
    } 
});
$('#input-search').on('keydown', event => {
    if (event.which == 13 || event.keyCode == 13) {
        let query = $('#input-search').val();
        if (query) { // jshint ignore: start
            (async () => {
                let results = await getResults(query);
                displayResults(results);
            })(); 
            // jshint ignore: end       
        } 
    }
});

// jshint ignore:start
async function displayResults(items) {
    let container = $('#results');
    let tabs = [];
    const baseTimeout = 100;

    if (container.children().length > 1) {
        let children = $('.result-info');
        for (let i = 0; i < children.length; i++) {
            setTimeout(() => {
                $(children[i]).addClass('animated fadeOutRightBig');
            }, baseTimeout*i);
            if (i == children.length - 1) {
                await timeout(baseTimeout*children.length);
                container.empty();
            }
        }
    }

    for (let i of items) {
        let tab = $('<div></div>');
        let header = $('<h3></h3>').text(i.title);
        let par = $('<p></p>').text(i.extract);
        tab.addClass('result-info');
        tab.addClass('animated fadeInLeftBig');
        tab.append(header);
        tab.append(par);
        tab.click(async () => {
            tab.removeClass('fadeInLeftBig');
            tab.addClass('shake');
            await timeout(750);
            window.open(`https://en.wikipedia.org/?curid=${i.pageid}`);
            tab.removeClass('shake');
        });
        tabs.push(tab);
    } 
    for (let i = 0; i < tabs.length; i++) {
        setTimeout(() => {
            container.append(tabs[i]);
        }, baseTimeout*i);
    }
}

async function getResults(query) {
    let results = [];
    let ids = [];

    let data = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&generator=search&utf8=1&exsentences=1&exintro=1&explaintext=1&exsectionformat=plain&gsrsearch=${query}&gsrwhat=text&gsrinfo=suggestion&origin=*`
    ).then(response => {
        if (response.ok)
            return response.json().then(data => {
                return data;
            });
        else throw new Error(response.statusText);
    }).catch(e => {
        throw new Error(e);
    });

    ids = Object.keys(data.query.pages);
    for (let id of ids)
        results.push(data.query.pages[id]);
    results = results.sort((a, b) => {
        return a.index - b.index;
    });

    return results;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// jshint ignore: end