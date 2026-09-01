const MESSAGE_HISTORY_KEY="gohHubMessageHistoryV1";

function loadMessageHistory(){

  try{

    const saved=JSON.parse(
      localStorage.getItem(MESSAGE_HISTORY_KEY)||"{}"
    );

    chats.forEach(chat=>{

      const data=saved[chat.id];

      if(!data)return;

      if(Array.isArray(data.messages)){
        chat.messages=data.messages;
      }

      if(typeof data.preview==="string"){
        chat.preview=data.preview;
      }

      if(typeof data.unread==="number"){
        chat.unread=data.unread;
      }

    });

  }catch(e){
    console.error("Message history load failed",e);
  }

}


function saveMessageHistory(){

  const data={};

  chats.forEach(chat=>{

    data[chat.id]={
      messages:chat.messages||[],
      preview:chat.preview||"",
      unread:chat.unread||0
    };

  });

  localStorage.setItem(
    MESSAGE_HISTORY_KEY,
    JSON.stringify(data)
  );

}


loadMessageHistory();


const historyRenderList=renderList;

renderList=function(){

  saveMessageHistory();

  historyRenderList();

};


const historyOpenChat=openChat;

openChat=function(id){

  historyOpenChat(id);

  saveMessageHistory();

};


renderList();

openChat(activeId);
