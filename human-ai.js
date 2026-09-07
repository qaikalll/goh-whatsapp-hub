// GOH WhatsApp Hub — Human Style AI Reply Engine

window.GOH_AI_REPLY_MEMORY =
  window.GOH_AI_REPLY_MEMORY || {};


function gohHasAny(text,words){
  return words.some(
    word=>text.includes(word)
  );
}


function gohPick(chat,intent,variants){

  const key=
    `${chat.id}:${intent}`;

  const previous=
    window.GOH_AI_REPLY_MEMORY[key];

  let available=
    variants
      .map((text,index)=>({
        text,
        index
      }))
      .filter(
        item=>item.index!==previous
      );

  if(!available.length){
    available=
      variants.map(
        (text,index)=>({
          text,
          index
        })
      );
  }

  const picked=
    available[
      Math.floor(
        Math.random()*
        available.length
      )
    ];

  window.GOH_AI_REPLY_MEMORY[key]=
    picked.index;

  return picked.text;
}


function gohGreeting(chat){

  if(chat.type==="group"){

    const groupGreetings=[
      "Hi team 👋",
      "Hey team",
      "Hi everyone 👋",
      "Hello team"
    ];

    return groupGreetings[
      Math.floor(
        Math.random()*
        groupGreetings.length
      )
    ];
  }


  const firstName=
    (chat.name||"")
      .trim()
      .split(/\s+/)[0]||
      "there";


  const greetings=[
    `Hi ${firstName} 👋`,
    `Hey ${firstName}`,
    `Hello ${firstName} 😊`,
    `Hi ${firstName}`
  ];


  return greetings[
    Math.floor(
      Math.random()*
      greetings.length
    )
  ];
}


function gohTonePrefix(chat,text){

  const greet=
    gohGreeting(chat);


  const angry=
    gohHasAny(
      text,
      [
        "angry",
        "upset",
        "frustrated",
        "frustrating",
        "disappointed",
        "unacceptable",
        "bad service",
        "terrible",
        "why so slow",
        "so slow",
        "lama",
        "marah",
        "geram",
        "tak puas hati"
      ]
    );


  if(angry){

    return gohPick(
      chat,
      "tone-angry",
      [
        `${greet}, I understand why this is frustrating.`,
        `${greet}, I hear you. I can see why you're concerned.`,
        `${greet}, I completely understand your concern here.`,
        `${greet}, sorry this has been frustrating for you.`
      ]
    );
  }


  const urgent=
    gohHasAny(
      text,
      [
        "urgent",
        "asap",
        "immediately",
        "right now",
        "need now",
        "cepat",
        "segera"
      ]
    );


  if(urgent){

    return gohPick(
      chat,
      "tone-urgent",
      [
        `${greet}, understood — I know this is urgent.`,
        `${greet}, got it. I know you need this checked quickly.`,
        `${greet}, understood. This sounds time-sensitive.`,
        `${greet}, got you — I'll keep this straight to the point.`
      ]
    );
  }


  const confused=
    gohHasAny(
      text,
      [
        "confused",
        "don't understand",
        "dont understand",
        "not understand",
        "tak faham",
        "pening"
      ]
    );


  if(confused){

    return gohPick(
      chat,
      "tone-confused",
      [
        `${greet}, no worries — I'll keep this simple.`,
        `${greet}, sure, let me make this clearer for you.`,
        `${greet}, got it. I'll explain this as simply as possible.`,
        `${greet}, no problem, let's make this easier to understand.`
      ]
    );
  }


  return greet;
}


safeAIReply=function(chat,combined){

  const text=
    (combined||"")
      .toLowerCase();

  const prefix=
    gohTonePrefix(
      chat,
      text
    );


  // HAPPY / THANK YOU

  if(
    gohHasAny(
      text,
      [
        "thank you",
        "thanks",
        "thankyou",
        "tq",
        "appreciate",
        "great thanks",
        "okay thanks",
        "ok thanks"
      ]
    )
  ){

    return gohPick(
      chat,
      "happy",
      [
        `${prefix}! You're most welcome 😊 Glad I could help.`,
        `${prefix}! No problem at all 😊 Happy to help.`,
        `${prefix}! Anytime 👍 Just drop us a message if you need anything else.`,
        `${prefix}! You're welcome 😊 Glad we could sort that out for you.`,
        `${prefix}! My pleasure. Let me know anytime if there's anything else.`
      ]
    );
  }


  // RECEIVING / ARRIVAL STATUS

  if(
    gohHasAny(
      text,
      [
        "dah sampai",
        "sampai warehouse",
        "receiving status",
        "barang sampai",
        "arrived",
        "shipment arrived",
        "warehouse yet",
        "received yet"
      ]
    )
  ){

    return gohPick(
      chat,
      "receiving",
      [
        `${prefix} I'll need to verify the receiving status with our warehouse team first before I confirm anything.`,
        `${prefix} Let me make sure the warehouse status is verified first so I don't give you the wrong information.`,
        `${prefix} I don't want to guess on this. I'll need the warehouse status verified before I confirm it with you.`,
        `${prefix} I'll need to double-check the receiving record first, then we can confirm the actual status properly.`,
        `${prefix} Let me make sure the receiving information is accurate first before giving you a confirmed update.`
      ]
    );
  }


  // DAMAGE / DISCREPANCY

  if(
    gohHasAny(
      text,
      [
        "damage",
        "damaged",
        "rosak",
        "discrepancy",
        "broken"
      ]
    )
  ){

    return gohPick(
      chat,
      "damage",
      [
        `${prefix} I'll need to verify the discrepancy record and photo evidence first before confirming the condition.`,
        `${prefix} Let me make sure the damage record and photos are checked properly before I confirm anything.`,
        `${prefix} I don't want to assume the condition. I'll need the discrepancy details verified first.`,
        `${prefix} Let me verify the record and supporting photos first so I can give you the correct information.`,
        `${prefix} I'll need to check the actual discrepancy evidence before confirming what happened to the item.`
      ]
    );
  }


  // RETURN / REFUND

  if(
    gohHasAny(
      text,
      [
        "return",
        "refund",
        "pulangkan",
        "returned"
      ]
    )
  ){

    return gohPick(
      chat,
      "return",
      [
        `${prefix} Could you share the Tracking Number or Order ID with me? That'll help us check the return details properly.`,
        `${prefix} Sure — send me the Tracking Number or Order ID and we'll check the return record from there.`,
        `${prefix} Can you share the Order ID or Tracking Number first? That'll make it much easier to trace the return.`,
        `${prefix} Got it. Send me the Tracking Number or Order ID and we'll use that to verify the return status.`,
        `${prefix} Could you drop me the Order ID or Tracking Number? I'll need that to trace the return properly.`
      ]
    );
  }


  // BOOKING / DELIVERY

  if(
    gohHasAny(
      text,
      [
        "booking",
        "hantar barang",
        "delivery",
        "esok boleh",
        "send tomorrow",
        "deliver tomorrow",
        "shipment booking"
      ]
    )
  ){

    return gohPick(
      chat,
      "booking",
      [
        `${prefix} Sure 😊 Could you send me the company name, delivery date and estimated arrival time?`,
        `${prefix} Can do. Just share the company name, delivery date and estimated arrival time so we can check the booking.`,
        `${prefix} Sure thing. Send me the company name, delivery date and estimated arrival time first.`,
        `${prefix} No problem 👍 Could you share the company, delivery date and expected arrival time?`,
        `${prefix} Yep, let me help with that. I'll need the company name, delivery date and estimated arrival time first.`
      ]
    );
  }


  // GREETING

  if(
    gohHasAny(
      text,
      [
        "hi",
        "hello",
        "hey",
        "morning",
        "afternoon",
        "assalam"
      ]
    )
  ){

    return gohPick(
      chat,
      "greeting",
      [
        `${prefix}! How can I help you today?`,
        `${prefix}! Sure, what can I help you with?`,
        `${prefix}! 😊 What's up? How can I help?`,
        `${prefix}! Of course — let me know what you need help with.`,
        `${prefix}! Happy to help. What would you like me to check?`
      ]
    );
  }


  // GENERAL SAFE REPLY

  return gohPick(
    chat,
    "general",
    [
      `${prefix}, got it. Let me make sure I understand the details properly before giving you an answer.`,
      `${prefix}, understood. I don't want to guess, so I'll need the information verified first.`,
      `${prefix}, got you. Let me make sure the details are correct before anything is confirmed.`,
      `${prefix}, noted. I'll need to verify the information properly so I can give you the right answer.`,
      `${prefix}, understood 👍 Let me make sure we're working with the correct information first.`
    ]
  );

};
