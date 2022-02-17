function createElement(...elements){
    return elements.map(el => document.createElement(el))
}

function clearInputs(){
    searchInput.value = ""
    minInput.value = ""
    maxInput.value = ""
    scoreInput.value = ""
}

async function  getVideoUrl(videoId){
    let movieVideoResponse = await fetch(`https://api.themoviedb.org/3/movie/${videoId}/videos?api_key=${API_KEY}&language=en-US`)
    let {results} = await movieVideoResponse.json()
    if(results.length > 0){
        return results[0].key
    }
}