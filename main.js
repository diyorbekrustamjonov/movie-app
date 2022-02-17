const append = document.querySelector(".append")
const submitSearch = document.querySelector("#submitSearch")
const categorys = document.querySelector(".row2")

const prev = document.querySelector(".prev")
const pageStatus = document.querySelector("#page")
const next = document.querySelector(".next")

const searchInput = document.querySelector("#search")
const minInput = document.querySelector("#min")
const maxInput = document.querySelector("#max")
const scoreInput = document.querySelector("#score")

const pn = document.querySelector('.pn')

for(let category of categorys.children){
    category.addEventListener("click", function(){
        clearInputs()
        pageStatus.textContent = 1

        let categoryData = this.dataset.category
        renderContent({category: categoryData, page: 1})

        window.localStorage.setItem('category', this.dataset.category)
        window.location.reload()
    })
}

async function renderContent({search, category, dateMin, dateMax, score, page}){
    append.innerHTML = ""

    let response = await fetch(`${API_URL}/movie/${category}?api_key=${API_KEY}&release_date&page=${page}`)
    let data = await response.json()
    
    let movies = data.results
    const totalPages = data.total_pages


    if(search){
        let searched = await fetch(`https://api.themoviedb.org/3/search/movie?query=${search}&api_key=${API_KEY}&page=${page}`)
        let data = await searched.json()
        movies = data.results.filter(movie => {
            const regex = new RegExp(search, 'gi')
            return movie.title.match(regex)
        })
        pageStatus.dataset.search = search
        pageStatus.textContent = page
    }

    
    if(dateMin && dateMax){
        movies = movies.filter(movie => {
            let date = movie.release_date
            let year = date.substring(0,4)
            return year >= dateMin && year <= dateMax
        })
        
    }else if(dateMin){
        movies = movies.filter(movie => {
            let date = movie.release_date 
            let year = date.substring(0,4)
            return year >= +dateMin
        })
    }else if(dateMax){
        movies = movies.filter(movie => {
            let date = movie.release_date
            let year = date.substring(0,4)
            return year <= +dateMax
        })
    }


    if(score){
        movies = movies.filter(movie => {
            return movie.vote_average >= score
        })
    }
    if(movies.length < 1){        
        pn.style.visibility = "hidden"
        if(search){
            pageStatus.removeAttribute("data-search")
            append.innerHTML = `<div class="warning"><code>${search}</code> not found!</div>`
        }else if(dateMax && dateMin){
            append.innerHTML = `<div class="warning"><code>${dateMin} <-> ${dateMax}</code> No movies released during this period were found</div>`
        }else if(dateMin){
            append.innerHTML = `<div class="warning"><code>${dateMin} </code> No movies from this time have been found </div>`
        }else if(dateMax){
            append.innerHTML = `<div class="warning"><code>${dateMax} </code> No movies have been found so far</div>`
        }else if(score){
            append.innerHTML = `<div class="warning"><code>${score}</code> No movies with score higher than <code>${score}</code>  were found</div>`
        }
        setTimeout(() => {
            clearInputs()
            pageStatus.textContent = 1
            return renderContent({search: "", category: defaultCategory, dateMin: "", dateMax: "", score: "", page: 1})
        },2000)
    }else{
        pn.style.visibility = "visible"
    }for(let movie of movies){
        let [movieCard, movieImg, movieInfo, movieLink, movieTitle, movieRate, movieDate] = createElement("div", "img", "div", "a", "h3", "span", "span")
        movieCard.classList.add("movie")
        movieInfo.classList.add("movie-info")
        movieRate.classList.add("orange")
        movieDate.classList.add("date")

        movieLink.setAttribute("target", `__blank`)
        movieLink.href = await getVideoUrl(movie.id) ? `https://www.youtube.com/watch?v=${await getVideoUrl(movie.id)}` : ""
        movieImg.src = `${API_IMG_URL}/${movie.poster_path}`
        movieTitle.textContent = movie.title
        movieRate.textContent = movie.vote_average
        movieDate.textContent = movie.release_date
        
        movieImg.onload = function(){
            // movieLink.href = `movie.html?id=${movie.id}`
            movieLink.append(movieTitle)
            movieInfo.append(movieLink, movieRate)
            movieCard.append(movieImg, movieInfo, movieDate)   
            append.append(movieCard)
        }
    }
}

renderContent({search: '', category: defaultCategory, dateMin: "", dateMax: "", score: "", page: 1})

submitSearch.addEventListener("click", (e) => {
    let search = searchInput.value.trim()
    let dateMin = minInput.value.trim()
    let dateMax = maxInput.value.trim()
    let score = scoreInput.value.trim()

    if(search){
        renderContent({search, category: defaultCategory, dateMin, dateMax, score, page: 1})
    }else if(dateMin && dateMax){
        renderContent({search: search, category: defaultCategory, dateMin, dateMax, page: 1})
    }
    renderContent({search: search, category: defaultCategory, dateMin, dateMax, score, page: 1})
})

prev.addEventListener("click", (e) => {
    clearInputs()
    if(pageStatus.textContent > 1){
        renderContent({search: pageStatus.dataset.search ? pageStatus.dataset.search : "", category: defaultCategory, dateMin: "", dateMax: "", score: "", page: +(pageStatus.textContent) - 1})
        pageStatus.textContent = parseInt(pageStatus.textContent) - 1
    }
})

next.addEventListener("click", (e) => {
    clearInputs()
    if(pageStatus.textContent >= 1){
        renderContent({search: pageStatus.dataset.search ? pageStatus.dataset.search : "", category: defaultCategory, dateMin: "", dateMax: "", score: "", page: +(pageStatus.textContent) + 1})
        pageStatus.textContent = parseInt(pageStatus.textContent) + 1
    }
})

searchInput.onkeyup = (e) => {
    if(e.keyCode == 8){
        if(searchInput.value.length == 0){
            pn.style.visibility = "visible"
            pageStatus.textContent = 1
            window.location.reload()
            renderContent({search: "", category: defaultCategory, dateMin: "", dateMax: "", score: "", page: 1})
        }
    }
}

//Preloader with load event
// setTimeout(() => {
//     preloader.style.display = "none"
// }, 2000)