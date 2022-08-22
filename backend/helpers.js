function updateUsers(usersList) {
    let users = ""
    for (let user in usersList) {
        let _user = usersList[user]
        if (_user.updated + 5000 < Date.now()) {
            delete usersList[user]
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
    return usersList
}

function pushMessage(topClass, usrname, msg){
    document.getElementById("box").innerHTML += `
    <div class="${topClass}">
        <div class="message-body">
            <div class="username-text" markdown=1>${usrname}:</div>  
            <div class="message-text" markdown=1>
                ${marked.parse(msg)}
            </div>
        </div>
    </div>`
}