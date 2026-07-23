import { useEffect, useRef, useState } from 'react'
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
  const abortControllerRef=useRef(null)
  const autoScrollRef=useRef(null)
  const textareaRef=useRef(null)

async function renderMessages(textToFetch) {

abortControllerRef.current= new AbortController()  
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${API_KEY}`;
setIsLoading(true)
try{
  const response=await fetch(url,
    
    {
    signal:abortControllerRef.current.signal,
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
 
  const botReply=data.candidates[0].content.parts[0].text;
  setMessages(prevMsg=>[...prevMsg,{msg:botReply,sender:"chatbot"}])
  console.log(messages)
}
catch(error){
  if(error.name==="AbortError"){
    setMessages(prevMsg=>[...prevMsg,{msg:"You stopped this response",sender:"chatbot"}])
 
  }
  else{
console.error("Error fetching from Gemini",error)
setMessages(prevMsg=>[...prevMsg,{msg:"Sorry, I am having trouble connecting right now.",sender:"chatbot"}])}
}
finally{
  setIsLoading(false)
  console.log(abortControllerRef)
}
}

useEffect(()=>{
  
autoScrollRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest",inline:"nearest" });
},[messages])


  return (
    <div className='app-container'>
    
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
<div ref={autoScrollRef}></div>
</div>

  <div className='search-bar'>
<textarea 
autoFocus
ref={textareaRef}
  placeholder='Enter Message' 
  value={userInput}
  rows={1}
  onChange={(event) => {
    setUserInput(event.target.value);
    
    event.target.style.height = 'auto'; 
    event.target.style.height = `${event.target.scrollHeight}px`; 
  }}
/>
 <button onClick={()=>{
  
  setMessages(prevMsg=>[...prevMsg,{msg:userInput,sender:"user"}])
  setUserInput("")
  renderMessages(userInput)
  if(textareaRef.current){
    textareaRef.current.style.height="auto"
  }
} 
} style={{display:userInput.trim()!==""?"inline":"none"}}>Send</button>
{isLoading&&<button onClick={()=>abortControllerRef.current.abort()}>Stop</button>}
</div>

    </div>
  )
}

export default App
