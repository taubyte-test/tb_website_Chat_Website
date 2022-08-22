let host = window.location.origin
let username = localStorage.getItem("username")

if (!username || username.length == 0) {
    window.location.href = "login"
}

fetch(host + "/ws/url")
    .then(async function (response) {
        let wsURL = await response.text()
        connect(host.replace("http", "ws") + "/" + wsURL)
    })
    .catch(function (error) {
        console.log("Error getting socket url: ", error.message.valueOf())
    })