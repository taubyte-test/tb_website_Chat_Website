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



const encryptWithAES = (text, passphrase) => {
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};

const decryptWithAES = (ciphertext, passphrase) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};


class TauSocket extends WebSocket {
    constructor(url) {
        super(url)

        // Override socket methods with TauSocket methods
        super.onopen = this.onopen
        super.onmessage = this.onmessage
        super.onclose = this.onclose
        super.onerror = this.onerror

        this.users = {}
        this.typing = false

        this.key = window.localStorage.getItem("enc-key")

        // set heartbeat interval
        this.heartbeat = setInterval(() => {
            this.send(JSON.stringify({
                type: "heartbeat",
                user: username,
                typing: this.typing,
            }))
            this.updateUsers()
        }, 1000)
    }

    async onmessage(e) {
        let message = await e.data.text()
        if (message.startsWith("{") && message.endsWith("}")) {
            this.handleMessageJson(message)
        } else {
            this.tryToDecrypt(message)
        }
    }

    tryToDecrypt(message) {
        let newMessage = decryptWithAES(message, this.key)
        if (newMessage.startsWith("{") && newMessage.endsWith("}")) {
            this.handleMessageJson(newMessage)
        }
    }

    tryToEncrypt(message) {
        return encryptWithAES(message, this.key)
    }

    handleMessageJson(message) {
        let messageObj = JSON.parse(message)
        switch (messageObj.type) {
            case "login":
                this.writeMessageLogin(messageObj)
                break
            case "message":
                this.writeMessageText(messageObj)
                break
            case "heartbeat":
                this.handleHeartbeat(messageObj)
                break
            case "error":
                this.writeMessageError(messageObj)
                break
        }
    }

    handleHeartbeat(m) {
        if (m.user == username) {
            return
        }
        let user = this.users[m.user]
        if (user) {
            user.updated = Date.now()
            user.typing = m.typing
        } else {
            this.users[m.user] = {
                updated: Date.now(),
                typing: false,
            }
        }

        let userElement = document.getElementById("user-" + m.user)
        if (userElement == null) {
            return
        }
        if (m.typing) {
            if (userElement.classList.contains(`dots`) == false) {
                userElement.innerHTML = `
                    <div class="dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                    `
            }
        } else {
            userElement.innerHTML = ``
        }
    }

    onopen(e) {
        e.target.send(JSON.stringify({
            "type": "login",
            "user": username
        }))
    }

    onclose() {
        this.writeErrorText({
            text: "disconnected",
        })
    }

    onerror() {
        e.data.text().then((text) => {
            this.writeErrorText({
                text: text,
            })
        })
    }

    sendMessage() {
        let toSend = JSON.stringify({
            type: "message",
            text: messageBox.value,
            user: username
        })

        if (this.key && this.key.length != 0) {
            toSend = this.tryToEncrypt(toSend)
        }

        this.send(toSend)

        messageBox.value = ""
    }

    writeMessageText(m) {
        let topClass = "message"
        if (m.user == username) {
            topClass = "message message-self"
        }

        if (m.user != username && this.users[m.user] != undefined) {
            this.users[m.user].typing = false
            document.getElementById("user-" + m.user).innerHTML = ``
        }

        document.getElementById("box").innerHTML += `
        <div class="${topClass}">
            <div class="message-body">
                <div class="username-text" markdown=1>${m.user}:</div>  
                <div class="message-text" markdown=1>
                    ${marked.parse(m.text)}
                </div>
            </div>
        </div>`
        window.scrollTo(0, document.body.scrollHeight);
    }

    writeErrorText(m) {
        document.getElementById("box").innerHTML += `
        <div class="message message-error">
            <div class="message-body">
                <div class="message-text" markdown=1>
                    Error: ${m.text}
                </div>
            </div>
        </div>`
        window.scrollTo(0, document.body.scrollHeight);
    }

    writeMessageLogin(m) {
        if (m.user != username) {
            this.users[m.user] = {
                typing: false,
                updated: Date.now(),
            }
        }

        document.getElementById("box").innerHTML += `
        <div class="message message-login">
            <div class="message-body">
                <div class="message-text" markdown=1>
                    ${m.user} has joined the chat.
                </div>
            </div>
        </div>`
        this.updateUsers()
        window.scrollTo(0, document.body.scrollHeight);
    }

    updateUsers() {
        let users = ""
        for (let user in this.users) {
            let _user = this.users[user]
            if (_user.updated + 5000 < Date.now()) {
                delete this.users[user]
            } else if (_user.typing) {
                users += `
                <tr>
                    <td class="user-display">${user}</td>
                    <td id="user-${user}">
                        <div class="dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </td>
                </tr>`
            } else {
                users += `
                <tr>
                    <td class="user-display">${user}</td>
                    <td id="user-${user}">
                </tr>`
            }
        }
        document.getElementsByClassName("users-box")[0].innerHTML = users
    }
}
