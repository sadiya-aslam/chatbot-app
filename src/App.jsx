import { useEffect, useState } from 'react'
import './App.css'
import userIcon from './assets/user-icon.jpg'
import chatbotIcon from './assets/chatbot-icon.png'

function Message({msg,sender}){

let imageSrc= sender==="user"?userIcon:chatbotIcon
let msgClassName= sender==="user"?"user-msg":"chatbot-reply"
return(
  <div className={msgClassName}>
    <img src={imageSrc} alt="" />
    <span>{msg}</span>
  </div>
)
}

function App() {

  const [userInput,setUserInput]=useState("")
  const [messages,setMessages]=useState([])
  
  const[isLoading,setIsLoading]=useState(false)



async function renderMessages(textToFetch) {
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${API_KEY}`;
setIsLoading(true)
try{
  const response=await fetch(url,{
    method:"POST",
    headers:{
      'Content-Type':'application/json',
    },
    body:JSON.stringify({
contents:[{
  parts:[{text:textToFetch}]
}]
    }),
  });
  const data=await response.json()
  console.log(data)
  const botReply=data.candidates[0].content.parts[0].text;
  setMessages(prevMsg=>[...prevMsg,{msg:botReply,sender:"chatbot"}])
}
catch(error){
console.error("Error fetching from Gemini",error)
setMessages(prevMsg=>[...prevMsg,{msg:"Sorry, I am having trouble connecting right now.",sender:"chatbot"}])
}
finally{
  setIsLoading(false)
}
}




  return (
    <div className='app-container'>
      <div className='search-bar'>
 <input type="text" placeholder='Enter Message' value={userInput} onChange={(event)=>{setUserInput(event.target.value)}}/>
 <button onClick={()=>{
  
  setMessages(prevMsg=>[...prevMsg,{msg:userInput,sender:"user"}])
  setUserInput("")
  renderMessages(userInput)
} 
}>Send</button>
</div>
 <div className='message-container'>
  
 {messages.length>0?messages.map((msg,index)=>{
  return(
    <Message
 key={index}
 msg={msg.msg}
 sender={msg.sender}
 />
  )
 }):<h2 className='welcome-msg'>What's On Your Mind Today ?</h2>
}
{isLoading && <div className="loading-msg">Bot is Typing...</div>}
</div>

    </div>
  )
}

export default App
