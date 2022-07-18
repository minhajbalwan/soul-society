const searchArea = document.querySelector('.search');
const searchIcon = document.querySelector('.search-btn');
const logo = document.querySelector('.logo');

searchIcon.addEventListener('click', function() {
    searchArea.classList.toggle('active');
    logo.classList.toggle('active');
});

let database = [];

async function get_data() {
    const API = "data.json";
    const raw_response = await fetch(API);
    const response = await raw_response.json();
    return response;
}

const split_json = (payload) => {
    const {results,visited,data,dict,search_keyword,i} = payload;
    Object.entries(data).forEach(([key,value])=> {
        try {
            if (typeof value == 'object' && !Array.isArray(value)) {
                const new_payload = {
                    data: value,
                    i,
                    search_keyword,
                    visited,
                    dict,
                    results
                }
                split_json(new_payload);
            } else{
                value = String(value).toLowerCase();
            }

        } catch (error) {
            value = String(value).toLowerCase();
        }
        dict[i].push(...value.split(' '));

        if (value.includes(search_keyword)) {
            results.push(data);
            visited.push(String(i));
        }
    })
}

const create_card = (data) => {
    return `<div class="post">
            <a href="${data.url}">
                <img src="${data.img}" alt="${data.title}">
                <div class="post-body">
                    <b>${data.read}</b>
                    <p>${data.title}</p>
                    <span>${data.tag}</span>
                </div>
            </a>
        </div>`;
}

const search = (search_keyword) => {
    const search_on = ['title', 'tag'];
    const dc = {};
    search_keyword = search_keyword.toLowerCase();
    const splitted_words = search_keyword.split(' ');
    const results = [], visited = [];
    database.forEach((data,i) => {
        dc[i] = [];

        Object.entries(data).forEach(([key,value])=> {
            if (search_on.includes(key)) {
                value = String(value).toLowerCase()
                dc[i].push(...value.split(' '));
                if (value.includes(search_keyword)) {
                    results.push(data);
                    visited.push(String(i));
                }
            }
        });
    });

    Object.entries(dc).forEach(([key,value])=> {
        for(let word of splitted_words){
            if(value.includes(word.toLowerCase()) && !visited.includes(key)){
                results.push(database[key]);
                visited.push(key);
            }
        }
    });

    return results;
}

document.querySelector("#input").addEventListener("keypress", (val) => {
    if (val.key === "Enter") {
        document.querySelector("#result").innerHTML = '';
        const results = search(val.target.value);
        if (!val.target.value) {
            document.querySelector("#result").innerHTML = `<h3 class="no-result">Sorry, try searching for another article! 😞</h3>`;
            return;
        }
        results.forEach(result => {
            document.querySelector("#result").innerHTML += create_card(result);
        });
        document.querySelector("#stats").innerHTML = `<b>${results.length}</b> Results for <b>${val.target.value}</b>`;
    }
})

document.addEventListener("DOMContentLoaded", async () => {
    document.querySelector("#result").innerHTML = ''
    database = await get_data();
    database.forEach(data => document.querySelector("#result").innerHTML += create_card(data))
});