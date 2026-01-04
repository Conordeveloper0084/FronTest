"use client"

import * as React from "react"
import { Search, Menu, Send, MoreVertical, Phone, Info, Hash, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type ChatType = "channel" | "group" | "private"

interface Chat {
  id: string
  name: string
  type: ChatType
  lastMessage: string
  time: string
  unread?: number
  avatar?: string
}

const MOCK_CHATS: Chat[] = [
  {
    id: "1",
    name: "General Channel",
    type: "channel",
    lastMessage: "New update available!",
    time: "12:45 PM",
    avatar: "/winding-waterway.png",
  },
  {
    id: "2",
    name: "Dev Team",
    type: "group",
    lastMessage: "Conor: Let's fix that bug",
    time: "11:20 AM",
    unread: 3,
    avatar: "/diverse-group-meeting.png",
  },
  {
    id: "3",
    name: "John Doe",
    type: "private",
    lastMessage: "Hey, how are you?",
    time: "Yesterday",
    avatar: "/abstract-geometric-shapes.png",
  },
]

export function TelegramInterface() {
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null)
  const [activeTab, setActiveTab] = React.useState<string>("all")
  const [isMobileListVisible, setIsMobileListVisible] = React.useState(true)
  const [isConnected, setIsConnected] = React.useState(false)
  const [sessionString, setSessionString] = React.useState("")

  const filteredChats = MOCK_CHATS.filter((chat) => {
    if (activeTab === "all") return true
    if (activeTab === "channels") return chat.type === "channel"
    if (activeTab === "groups") return chat.type === "group"
    if (activeTab === "privates") return chat.type === "private"
    return true
  })

  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-border space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-primary">Telegram Web</h1>
            <p className="text-sm text-muted-foreground">Please enter your StringSession to connect</p>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="StringSession (e.g. 1BVjk...)"
              value={sessionString}
              onChange={(e) => setSessionString(e.target.value)}
              className="font-mono text-xs h-12"
            />
            <Button
              className="w-full h-12 text-base font-semibold"
              onClick={() => {
                if (sessionString.trim()) {
                  setIsConnected(true)
                }
              }}
            >
              Connect Client
            </Button>
            <div className="flex justify-center items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>API_ID: 21180544</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <span>API_HASH: 9af42e...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full max-w-[1600px] lg:h-[95vh] lg:rounded-xl shadow-2xl flex bg-white overflow-hidden border border-border">
      {/* Sidebar / Chat List */}
      <div
        className={cn(
          "w-full md:w-[350px] lg:w-[400px] border-r border-border flex flex-col shrink-0 transition-all duration-300",
          !isMobileListVisible && "hidden md:flex",
        )}
      >
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-10 bg-muted/50 border-none h-10 rounded-full focus-visible:ring-primary"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-transparent p-0 gap-1 h-auto">
              {["All", "Channels", "Groups", "Privates"].map((tab) => (
                <TabsTrigger
                  key={tab.toLowerCase()}
                  value={tab.toLowerCase()}
                  className="rounded-full py-1.5 px-2 text-[13px] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat)
                setIsMobileListVisible(false)
              }}
              className={cn(
                "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors group relative",
                selectedChat?.id === chat.id && "bg-primary/5 hover:bg-primary/5",
              )}
            >
              <Avatar className="h-14 w-14">
                <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {chat.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 border-b border-border/50 group-last:border-none pb-3 pt-1">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-semibold text-[15px] truncate flex items-center gap-1.5">
                    {chat.type === "channel" && <Hash className="h-3.5 w-3.5 text-primary" />}
                    {chat.type === "group" && <Users className="h-3.5 w-3.5 text-primary" />}
                    {chat.name}
                  </h3>
                  <span className="text-[12px] text-muted-foreground shrink-0">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-[14px] text-muted-foreground truncate leading-tight flex-1">{chat.lastMessage}</p>
                  {chat.unread && (
                    <span className="bg-primary text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={cn("flex-1 flex flex-col bg-[#e6ebee] relative", isMobileListVisible && "hidden md:flex")}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 z-10">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileListVisible(true)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChat.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h2 className="font-bold text-[15px] leading-tight">{selectedChat.name}</h2>
                  <span className="text-[12px] text-primary">online</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </header>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-[url('https://blob.v0.app/telegram-pattern.png')] bg-repeat">
              <div className="max-w-[800px] mx-auto space-y-4 py-4">
                <div className="flex justify-center">
                  <span className="bg-black/10 text-white text-[12px] px-3 py-1 rounded-full backdrop-blur-md">
                    January 4
                  </span>
                </div>

                <Message
                  text="Hello! How is the Telethon integration going?"
                  time="10:00 AM"
                  isOwn={false}
                  sender="John Doe"
                />
                <Message text="It's going great! I've visualized the dialog categories." time="10:01 AM" isOwn={true} />
                <Message
                  text="The dodgerblue theme matches the Telegram vibe perfectly."
                  time="10:02 AM"
                  isOwn={true}
                />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-border">
              <div className="max-w-[800px] mx-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
                  <MoreVertical className="h-6 w-6 rotate-90" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Write a message..."
                    className="h-11 border-none bg-muted/50 focus-visible:ring-0 rounded-xl pr-12"
                  />
                  <Button
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-transparent hover:bg-transparent text-primary"
                  >
                    <span className="text-xl">😊</span>
                  </Button>
                </div>
                <Button
                  size="icon"
                  className="rounded-full h-11 w-11 bg-primary hover:bg-primary/90 shadow-lg shrink-0"
                >
                  <Send className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
            <div className="bg-black/5 p-2 rounded-full mb-2">
              <Info className="h-6 w-6" />
            </div>
            <p className="text-[14px]">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Message({ text, time, isOwn, sender }: { text: string; time: string; isOwn: boolean; sender?: string }) {
  return (
    <div className={cn("flex w-full mb-1", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] px-3 py-1.5 rounded-2xl relative shadow-sm",
          isOwn ? "bg-primary text-white rounded-br-none" : "bg-white text-black rounded-bl-none",
        )}
      >
        {!isOwn && sender && <div className="text-[13px] font-bold text-primary mb-0.5">{sender}</div>}
        <div className="text-[15px] leading-relaxed pr-8">{text}</div>
        <div
          className={cn(
            "text-[10px] absolute right-2 bottom-1.5 opacity-70",
            isOwn ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {time}
        </div>
      </div>
    </div>
  )
}
