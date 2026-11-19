async function request(path, options = {}){
    const baseUrl = "http://localhost:3000"
    const controller = new AbortController()
    const config = {
        method: 'GET',
        ...options,
        headers: {
            'Content-Type' : 'application/json',
            ...options.headers
        },
        signal: controller.signal
    }
    if(config.body && typeof config.body === 'object'){
        config.body = JSON.stringify(config.body)
    }
    const timeout = setTimeout(() => {
        controller.abort()
    }, 8000)
    try{
        if(!navigator.onLine){
            throw{
                type: "offline", 
                status: null,
                message: "there is no internet connection"
            }
        }
        const response = await fetch(`${baseUrl}${path}`, config)
        if(!response.ok){
            throw {
                type: "http", 
                status: response.status,
                message: "an http error occured"
            }
        }

        return await response.json()
    }
    catch(error){
        if(error instanceof TypeError){
            throw{
                type: "network",
                status: null,
                message: "Network error"
            }
        }
        if(error instanceof SyntaxError){
            throw{
                type: 'parse',
                status: null,
                message: "invalide JSON response"
            }
        }
        if(error.name === "AbortError"){
            throw{
                type: 'timeout',
                status: null,
                message: "timeout Error"
            }

        }
        console.error(error)
        throw error
    }
    finally{
        clearTimeout(timeout)
    }

}
async function render(path, options = {}){
    const renderArea = document.getElementById("articlesArea");
    const data = await request(path, options)
    renderArea.replaceChildren()
    data.forEach(article => {
        const card = document.createElement("div")
        const titre = document.createElement('h3')
        const description = document.createElement('p')
        const prix = document.createElement('p')
        const statut = document.createElement('p')
        const date = document.createElement('p')
        titre.textContent = `${article.titre}`
        description.textContent = `description: ${article.description}`
        prix.textContent = `Prix: ${article.prix} DH`
        statut.textContent = article.statut
        date.textContent = article.date
        card.append(titre, description, prix, statut, date)
        card.className = "card"
        renderArea.appendChild(card)
    })
}
render("/articles")
//search part
const searchBar = document.getElementById("searchBar")
searchBar.addEventListener('input', function(){
    render(`/articles?titre:contains=${searchBar.value}`)
})
//Filtre part
const filtreBtn = document.getElementById("filterBtn")
const moduleFilter = document.getElementById("filterDialogue")
filtreBtn.addEventListener("click", () => {
    moduleFilter.showModal()
    
})
const annulerBtn = document.getElementById("annulerBtn")
annulerBtn.addEventListener('click', () => {
    moduleFilter.close()
})
const confirmerBtn = document.getElementById("confirmerBtn");
confirmerBtn.addEventListener('click', function(){
    const triType = document.getElementById("Tri")
    const order = document.getElementById("direction")
    const statut = document.getElementById("statut")
    moduleFilter.close()
    render(`/articles?_sort=${order.value}${triType.value}&statut:contains=${statut.value}`)
})
