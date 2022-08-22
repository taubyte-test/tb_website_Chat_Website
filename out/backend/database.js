class DatabaseHandler{
    constructor(){}

    saveMessage(message, hash){
        fetch(host+"/"+"save", {method: 'POST', headers:{
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
           fetch(host+"/"+"getMessages", {method: 'POST', headers:{
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
            //    let topClass = "message"
               for (let i =0; i <data.length; i++){
                //    this.pushMessage(topClass, data[i].user,data[i].msg)
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