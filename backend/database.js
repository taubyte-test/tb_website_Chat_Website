class DatabaseHandler{
    constructor(){}

    saveMessage(message, hash){
        fetch(host+"/"+"message", {method: 'POST', headers:{
           'message':message,
           'user': username,
           'timestamp': Date.now(),
           'secret': hash
       }})
       .then(function (response){
           if(response.ok){
               return response.json()
           } else{
               return Promise.reject(response)
           }
       })
       .catch(function(err){
           return err
       })
   }

   getMessages(secretHash){    
           fetch(host+"/"+"messages", {method: 'GET', headers:{
               'secret': secretHash
           }})
           .then(async function (response){
               if(response.ok){
                   return response.json()
               } else{
                   return Promise.reject(response)
               }
           })
           .then((data)=>{
               for (let i =0; i <data.length; i++){
                document.getElementById("box").innerHTML += `
                <div class="message">
                    <div class="message-body">
                        <div class="username-text" markdown=1>${data[i].user}:</div>  
                        <div class="message-text" markdown=1>
                            ${marked.parse(data[i].msg)}
                        </div>
                    </div>
                </div>`
               }
           })
           .catch(function(err){
               return err
           })
   }
}