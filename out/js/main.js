let host = window.location.origin
let username = localStorage.getItem("username")
if (!username || username.length == 0) {
    window.location.href = "login"
}

fetch(host + "/" + "getsocketurl")
    .then(async function (response) {
        let socketURL = await response.text()
        connect(host.replace("http", "ws") + "/" + socketURL)
    })
    .catch(function (error) {
        console.log("Error getting socket url: ", error.message.valueOf())
    })