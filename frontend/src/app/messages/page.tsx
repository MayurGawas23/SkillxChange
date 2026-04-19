"use client";

import { useEffect, useState, useRef } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import ThemeToggle from "@/components/ThemeToggle";
import NavBar from "@/components/NavBar";
import { CirclePlus, EllipsisVertical, MessageCircle, MoveLeft, Phone, Search, Send, Tally1, Video } from "lucide-react";


interface Chat {
  id: string;
  members: { user: any }[];
  messages: Message[];
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { user } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chats on initial load
  useEffect(() => {
    if (!user) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChats(data);
          if (data.length > 0) setActiveChatId(data[0].id);
        } else {
          setChats([]);
        }
      })
      .catch(err => console.error("Error fetching chats:", err));
  }, [user]);

  // Setup Socket.io and fetch active chat messages
  useEffect(() => {
    if (!user || !activeChatId) return;
    setChatMessages([]); // clear current
    
    // Fetch active chat messages
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/${activeChatId}/messages`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setChatMessages(data);
        else setChatMessages([]);
      })
      .catch(err => console.error("Error fetching messages:", err));

    // Connect socket
    socketRef.current = io("${process.env.NEXT_PUBLIC_API_URL}");
    socketRef.current.emit("join_chat", activeChatId);

    // Listen for new messages
    socketRef.current.on("new_message", (message: Message) => {
      setChatMessages(prev => [...prev, message]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user, activeChatId]);

  // Auto scroll to bottom of messages list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!inputContent.trim() || !user || !activeChatId || !socketRef.current) return;
    const content = inputContent.trim();
    setInputContent("");
    
    // Send directly via socket, backend saves to DB natively
    if (socketRef.current) {
      socketRef.current.emit("send_message", { 
        chatId: activeChatId, 
        senderId: user.id, 
        content 
      });
    }
  };

  const getOtherUser = (chat: Chat) => {
    if (!user || !chat?.members) return null;
    const otherMember = chat.members.find((m: any) => m.user.clerkId !== user.id);
    return otherMember ? otherMember.user : null;
  };

  if (!user) return <div className="p-8 text-center bg-surface w-full h-screen text-on-surface">Please sign in...</div>;
  const activeChat = chats.find(c => c.id === activeChatId);
  const activeChatPartner = activeChat ? getOtherUser(activeChat) : null;

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-surface text-on-surface font-body overflow-hidden pt-20">
      <NavBar/>

      <main className="flex-1 flex flex-col md:flex-row w-full md:w-[90%] xl:w-[80%] mx-auto overflow-hidden relative bg-white dark:bg-zinc-900 md:border md:border-zinc-200/50 md:dark:border-zinc-800/50 md:rounded-2xl md:shadow-md md:my-4">
      {/* Sidebar: Chat List */}
      <aside className={`w-full md:w-[320px] lg:w-[380px] bg-white dark:bg-zinc-900 border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col h-full z-20 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] transition-transform duration-300 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {/* Nav Header */}
        <div className="h-16 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center px-6 shrink-0 justify-between bg-white dark:bg-zinc-900 md:hidden">
          <Link href="/explore">
             <button className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500">
               <span className="material-symbols-outlined"><MoveLeft/></span>
             </button>
          </Link>
          <h2 className="font-headline font-bold text-lg text-zinc-900 dark:text-zinc-50">Messages</h2>
          <div className="flex items-center space-x-2">
            <UserButton />
          </div>
        </div>

        {/* Search */}
        <div className="p-4 shrink-0 bg-white dark:bg-zinc-900">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400"><Search/></span>
            <input type="text" placeholder="Search conversations..." className="w-full pl-9 pr-4 py-2 border-none bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500"/>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto chat-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6 bg-white dark:bg-zinc-900">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">No active chats. Start trading skills!</div>
          ) : (
            chats.map(chat => {
              const other = getOtherUser(chat);
              const isActive = chat.id === activeChatId;
              const lastMsgs = chat.messages || [];
              const lastMsg = lastMsgs.length > 0 ? lastMsgs[lastMsgs.length - 1] : null;
              
              return (
                <div 
                  key={chat.id} 
                  onClick={() => setActiveChatId(chat.id)}
                  className={`flex items-center gap-4 py-4 px-6 cursor-pointer border-l-4 transition-all ${isActive ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-600' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                >
                  <div className="relative">
                    {other?.avatarUrl ? (
                      <img src={other.avatarUrl} alt={other.name} className="w-12 h-12 rounded-full object-cover shadow-sm bg-white dark:bg-zinc-800 border ghost-border" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                        {other?.name ? other.name[0] : "?"}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-headline font-bold text-sm truncate text-zinc-900 dark:text-zinc-50">{other?.name}</h4>
                      {lastMsg && <span className="text-[10px] text-zinc-500 font-medium shrink-0 ml-2">
                        {new Date(lastMsg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>}
                    </div>
                    <p className={`text-xs truncate ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-zinc-500'}`}>
                      {lastMsg ? lastMsg.content : "In Progress..."}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className={`flex-1 flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 relative ${!activeChatId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activeChat ? (
          <div className="text-center opacity-50 flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl mb-4 text-zinc-400"><MessageCircle/></span>
            <p className="font-headline font-bold text-lg text-zinc-500">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="h-20 shrink-0 border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 lg:px-10 flex items-center justify-between bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <button className="md:hidden p-2 -ml-2 rounded-full text-zinc-500" onClick={() => setActiveChatId(null)}>
                  <span className="material-symbols-outlined"><MoveLeft/></span>
                </button>
                <div className="relative">
                  {activeChatPartner?.avatarUrl ? (
                    <img src={activeChatPartner.avatarUrl} alt={activeChatPartner.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                      {activeChatPartner?.name ? activeChatPartner.name[0] : "?"}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-zinc-900 dark:text-zinc-50 text-lg leading-tight">{activeChatPartner?.name}</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Active now</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"><span className="material-symbols-outlined font-light text-xl"><Phone/></span></button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"><span className="material-symbols-outlined font-light text-xl"><Video/></span></button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"><span className="material-symbols-outlined font-light text-xl"><EllipsisVertical/></span></button>
              </div>
            </header>

            {/* Messages Area */}
            {/* The flex-1 wrapper with overflow-y-auto restricted to this div makes sure ONLY the messages scroll, not the whole page window */}
            <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-2  lg:py-0 flex flex-col gap-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-zinc-50 dark:bg-zinc-950">
              
              <div className="text-center my-4 shrink-0">
                <span className="px-4 py-1.5 bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 rounded-full text-xs font-bold uppercase tracking-wider">
                  SkillxChange Started
                </span>
              </div>

              {chatMessages.length === 0 ? (
                <div className="text-center text-zinc-500 text-sm py-10 italic">
                  No messages yet. Send a greeting to start!
                </div>
              ) : (
                chatMessages.map((msg: any, index: number) => {
                  const isMe = msg.sender?.clerkId === user.id;
                  const msgDate = new Date(msg.createdAt);
                  let currentMsgDateStr = "";
                  
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  
                  if (msgDate.toDateString() === today.toDateString()) {
                    currentMsgDateStr = "Today";
                  } else if (msgDate.toDateString() === yesterday.toDateString()) {
                    currentMsgDateStr = "Yesterday";
                  } else {
                    currentMsgDateStr = msgDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                  }
                  
                  let showDateSeparator = false;
                  if (index === 0) {
                    showDateSeparator = true;
                  } else {
                    const prevDate = new Date(chatMessages[index - 1].createdAt);
                    if (prevDate.toDateString() !== msgDate.toDateString()) {
                      showDateSeparator = true;
                    }
                  }

                  return (
                    <div key={msg.id} className="flex flex-col gap-y-2 shrink-0">
                      {showDateSeparator && (
                        <div className="text-center my-2">
                          <span className="px-3 py-1 bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 rounded-full text-xs font-bold uppercase tracking-wider">
                            {currentMsgDateStr}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] md:max-w-[65%] px-2 py-1 shadow-sm relative ${
                          isMe 
                          ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                          : 'bg-zinc-200 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl rounded-tl-sm text-zinc-900 dark:text-zinc-100'
                        }`}>
                          <div className="flex items-end justify-end gap-2">
                            <p className="  text-sm md:text-[15px] flex-3 leading-relaxed break-words relative">{msg.content} </p>
                            <p className="  text-[10px] mt-.5  items-center gap-1 opacity-70 dark:text-gray-200">{msgDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                          <div className={`text-[10px] mt-1.5 flex items-center gap-1 opacity-70 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            
                            {/* {isMe && <span className="material-symbols-outlined text-[12px]">done_all</span>} */}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} className="h-2 shrink-0" />
            </div>

            {/* Message Input Frame */}
            <div className=" p-4 lg:p-1 bg-white dark:bg-zinc-900 border-t border-zinc-200/50 dark:border-zinc-800/50   ">
              <div className="max-w-4xl max-h-11 mx-auto  flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800 p-2 rounded-2xl  transition-shadow focus-within:ring-2 focus-within:ring-indigo-500/30">
                <button className="p-3 text-zinc-400 hover:text-indigo-600 transition-colors hidden sm:block shrink-0"><span className="material-symbols-outlined"><CirclePlus/></span></button>
                {/* <button className="p-3 text-zinc-400 hover:text-indigo-600 transition-colors hidden sm:block shrink-0"><span className="material-symbols-outlined"><Tally1/></span></button> */}
                
                {/* Textarea mimicking exact behavior - dynamically expanding or just max-h */}
                <textarea 
                  rows={Math.min(2, Math.max(1, inputContent.split('\n').length))}
                  className="flex-1 max-h-12 bg-transparent text-sm text-zinc-900 dark:text-zinc-50 border-none resize-none px-2 py-3.5 focus:ring-0 outline-none placeholder:text-zinc-400 custom-scrollbar" 
                  placeholder="Type a message..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                ></textarea>
                
                <button 
                  onClick={sendMessage}
                  disabled={!inputContent.trim()}
                  className={`p-2 shrink-0 rounded-xl transition-all ${
                    inputContent.trim() 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 active:scale-95' 
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-400'
                  }`}
                >
                  <span className="material-symbols-outlined "><Send/></span>
                </button>
              </div>
              {/* <div className="text-center mt-2.5">
                   <span className="text-[10px] text-zinc-400 font-medium">Press Enter to send, Shift + Enter for new line</span>
              </div> */}
            </div>
          </>
        )}
      </section>
      </main>
    </div>
  );
}
