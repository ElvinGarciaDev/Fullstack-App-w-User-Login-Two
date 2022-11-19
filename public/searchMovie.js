let result = document.getElementById("displayMovies")

document.querySelector(".search").addEventListener("click", async () => {

    // Get the user value from the input
    let UserValue = document.querySelector("input")

    try {
        const response = await fetch(`http://www.omdbapi.com/?s=${UserValue.value}&apikey=e8425006`)
        const data = await response.json()

        console.log(data)
        result.innerHTML =
          `${data.Search
            .map(
              (element) =>
                `<div class="card" style="width: 17rem;">
              <img src="${element.Poster}"
                    class="card-img-top" alt="${element.Title}">
                <div class="card-body">
                    <h5 class="card-title">${element.Title}</h5>
                    <p class="card-text">${element.Year}</p>
                    <span><i class="bi bi-star-fill"></i></span>
                </div>
            </div>`
            )}`


    } catch (error) {
        console.log(error)
    }


        // Select the Star Icons
        var thumbUp = document.getElementsByClassName("bi");


        Array.from(thumbUp).forEach(function(element) {

            
            element.addEventListener('click', function() {

                element.innerText = "Bookmarked"
                element.style.color = 'blue'

            // Grab the movie title, year and image so we can send it with the POST request
            let title = this.parentNode.parentNode.childNodes[1].innerText
            let year = this.parentNode.parentNode.childNodes[3].innerText
            let img = this.parentNode.parentNode.parentNode.childNodes[1].src


            //Make a server request and store the movie in the data base if the user bookmarks it
            fetch('addBookMark', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'Title': title,
                'Year': year,
                'Image': img
            })
            })
            .then(response => {
            if (response.ok) return response.json()
            })
            .then(data => {
            console.log(data)
            // window.location.reload(true)
            })
        });
    });

})


