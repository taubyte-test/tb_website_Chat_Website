function connect(url) {
    let socket = new TauSocket(url)

    messageBox = document.getElementById("messageInput")
    let shiftDown = false
    let typingInterval = null

    messageBox.addEventListener("keydown", (event) => {
        socket.typing = true
        if (typingInterval != null) {
            clearInterval(typingInterval)
        }
        typingInterval = setInterval(() => {
            socket.typing = false
        }, 2000)

        if (event.key == "Shift") {
            shiftDown = true
        } else if (event.key == "Tab") {
            event.preventDefault()
            messageBox.value += "\t"
        }
    })

    messageBox.addEventListener("keyup", (event) => {
        if (event.key == "Shift") {
            shiftDown = false
        } else if (shiftDown == false && event.key == "Enter") {
            if (typingInterval != null) {
                clearInterval(typingInterval)
            }
            socket.typing = false
            socket.sendMessage()
        }
    })
}