"use client"

import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  const [view, setView] = React.useState<"login" | "menu" | "messages">("login")
  const [currentCategory, setCurrentCategory] = React.useState<"Channels" | "Groups" | "Private Chats" | null>(null)
  const [dialogs, setDialogs] = React.useState<{ channels: any[]; groups: any[]; privates: any[] }>({
    channels: [],
    groups: [],
    privates: [],
  })
  const [messages, setMessages] = React.useState<any[]>([])
  const [selectedChat, setSelectedChat] = React.useState<any>(null)
  const [sessionString, setSessionString] = React.useState("")
  const [error, setError] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  // 1 - connect_client() logic
  const handleConnect = async () => {
    setIsLoading(true)
    setError("")
    // Using simulated action based on your Python code
    if (sessionString.length > 10) {
      // Simulate successful load_dialogs()
      setDialogs({
        channels: [
          { id: "c1", name: "News Channel" },
          { id: "c2", name: "Tech Updates" },
        ],
        groups: [{ id: "g1", name: "Developers Hub" }],
        privates: [{ id: "p1", name: "John Doe" }],
      })
      setView("menu")
    } else {
      setError("StringSession noto‘g‘ri yoki eskirgan")
    }
    setIsLoading(false)
  }

  // 2 - section_menu() logic
  const handleSelectCategory = (category: "Channels" | "Groups" | "Private Chats") => {
    setCurrentCategory(category)
  }

  // 3 - view_messages() logic
  const handleViewChat = (chat: any) => {
    setSelectedChat(chat)
    setMessages([
      { sender: "Unknown", text: "Welcome to " + chat.name, date: "2024-01-04 10:00", is_own: false },
      {
        sender: "Conor",
        text: "This message is from your Python logic check!",
        date: "2024-01-04 10:05",
        is_own: true,
      },
    ])
    setView("messages")
  }

  // 1 - Login Screen
  if (view === "login") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#f0f2f5]">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0088cc]">Telegram Logic Terminal</h1>
            <p className="text-sm text-muted-foreground mt-2">StringSession ni kiriting</p>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="> session_string"
              value={sessionString}
              onChange={(e) => setSessionString(e.target.value)}
              className="font-mono text-xs h-12 border-[#0088cc]/20 focus-visible:ring-[#0088cc]"
            />
            {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
            <Button
              className="w-full h-12 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold"
              onClick={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? "ULANMOQDA..." : "CONNECT"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 2 - Main Menu (Channels, Groups, Private Chats)
  if (view === "menu" && !currentCategory) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#f0f2f5]">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-center border-b pb-4">🏠 ASOSIY MENYU</h2>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-lg border-[#0088cc]/10 hover:bg-[#0088cc]/5 bg-transparent"
              onClick={() => handleSelectCategory("Channels")}
            >
              1️⃣ Channels ({dialogs.channels.length})
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-lg border-[#0088cc]/10 hover:bg-[#0088cc]/5 bg-transparent"
              onClick={() => handleSelectCategory("Groups")}
            >
              2️⃣ Groups ({dialogs.groups.length})
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-lg border-[#0088cc]/10 hover:bg-[#0088cc]/5 bg-transparent"
              onClick={() => handleSelectCategory("Private Chats")}
            >
              3️⃣ Private Chats ({dialogs.privates.length})
            </Button>
            <Button variant="ghost" className="w-full h-12 mt-4 text-red-500" onClick={() => setView("login")}>
              0️⃣ Exit
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 2 - Section Menu (List of chats in category)
  if (view === "menu" && currentCategory) {
    const list =
      currentCategory === "Channels"
        ? dialogs.channels
        : currentCategory === "Groups"
          ? dialogs.groups
          : dialogs.privates
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#f0f2f5]">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg flex flex-col h-[80vh]">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentCategory(null)}>
              <ArrowLeft />
            </Button>
            📂 {currentCategory.toUpperCase()}
          </h2>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-2">
              {list.map((d) => (
                <div
                  key={d.id}
                  className="p-3 border rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleViewChat(d)}
                >
                  <p className="font-semibold text-sm">• {d.name}</p>
                  <p className="text-[10px] text-muted-foreground">ID: {d.id}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button variant="ghost" className="w-full mt-4" onClick={() => setCurrentCategory(null)}>
            0️⃣ Ortga
          </Button>
        </div>
      </div>
    )
  }

  // 3 - Message Viewer
  return (
    <div className="w-full h-full flex flex-col bg-[#e6ebee]">
      <header className="h-16 bg-[#0088cc] text-white flex items-center px-4 shrink-0 shadow-md">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 mr-2"
          onClick={() => setView("menu")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h2 className="font-bold text-sm">📨 {selectedChat?.name}</h2>
          <p className="text-[10px] opacity-80">Oxirgi xabarlar</p>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-[600px] mx-auto space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex flex-col", msg.is_own ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "px-3 py-2 rounded-2xl max-w-[85%] shadow-sm text-sm relative",
                  msg.is_own ? "bg-[#effdde] text-black rounded-tr-none" : "bg-white text-black rounded-tl-none",
                )}
              >
                {!msg.is_own && <p className="text-[11px] font-bold text-[#0088cc] mb-1">{msg.sender}</p>}
                <p>{msg.text}</p>
                <p className="text-[9px] text-muted-foreground text-right mt-1 opacity-60">{msg.date}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <footer className="p-4 bg-white border-t">
        <Button variant="outline" className="w-full bg-transparent" onClick={() => setView("menu")}>
          ⬅️ Ortga qaytish
        </Button>
      </footer>
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
