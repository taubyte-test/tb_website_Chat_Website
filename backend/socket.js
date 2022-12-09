class TauSocket extends WebSocket {
    constructor(url) {
        super(url)

        // Override socket methods with TauSocket methods
        super.onopen = this.onopen
        super.onmessage = this.onmessage
        super.onclose = this.onclose
        super.onerror = this.onerror

        this.users = {} // test
        this.typing = false

        this.key = window.localStorage.getItem("enc-key")
        this.encrypter = new Encrypter() // Create new encryption/decryption class
        this.databaseHandler = new DatabaseHandler() // Create new DatabaseHandler to save/get messages

        // set heartbeat interval
        this.heartbeat = setInterval(() => {
            this.send(JSON.stringify({
                type: "heartbeat",
                user: username,
                typing: this.typing,
            }))
            this.users = updateUsers(this.users)
        }, 1000)
    }

    async onmessage(e) {
        let message = await e.data.text()
        if (message.startsWith("{") && message.endsWith("}")) {
            this.handleMessageJson(message)
        } else {
            let newMessage = this.encrypter.decryptWithAES(message, this.key)
            if (newMessage.startsWith("{") && newMessage.endsWith("}")) {
                this.handleMessageJson(newMessage)
            }
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

    sendMessage() {
        let toSend = JSON.stringify({
            type: "message",
            text: messageBox.value,
            user: username,
            timestamp: Date.now()
        })
        
        let secretHash = ""
        if (this.key && this.key.length != 0) {
            toSend = this.encrypter.encryptWithAES(toSend, this.key)
            secretHash = this.encrypter.hashKeySha1(this.key)
        }
        
        this.send(toSend)
        this.databaseHandler.saveMessage(messageBox.value, secretHash)

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

        pushMessage(topClass, m.user, m.text)
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
        this.users = updateUsers(this.users)

        // Only push if user who joined also sent the message
        if (m.user == username) {
            let secretHash = ""
            if (this.key && this.key.length != 0) {
                secretHash = this.encrypter.hashKeySha1(this.key)
            }
            this.databaseHandler.getMessages(secretHash)
        } 
        window.scrollTo(0, document.body.scrollHeight);
    }
}
