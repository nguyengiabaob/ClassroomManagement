import { useState } from "react"
import { Paperclip, Phone, Search, Send, Smile, Trash2, UserRound } from "lucide-react"
import { toast } from "sonner"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const chats = [
  { id: 1, name: "Alex Johnson", lastMsg: "Teacher, can I ask about the homework...", time: "10:30", online: true },
  { id: 2, name: "Sarah Miller", lastMsg: "I have submitted my assignment.", time: "09:15", online: false },
  { id: 3, name: "Chris Evans", lastMsg: "Thank you so much!", time: "Yesterday", online: true },
  { id: 4, name: "David Brown", lastMsg: "Where is the zoom link?", time: "Mon", online: false },
]

const avatarUrl = (name: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(1)
  const selectedChat = chats.find((chat) => chat.id === selectedUser) ?? chats[0]

  return (
    <div className="flex h-full overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm md:rounded-3xl">
      <aside className="flex h-full w-full flex-col border-r border-slate-100 bg-white md:w-80">
        <div className="border-b border-slate-100 p-4">
          <h1 className="mb-4 text-xl font-semibold">Messages</h1>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search conversations..." className="h-10 border-0 bg-slate-50 pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              type="button"
              key={chat.id}
              onClick={() => setSelectedUser(chat.id)}
              className={`flex w-full cursor-pointer items-center gap-3 border-l-4 p-4 text-left transition-all hover:bg-blue-50 ${selectedUser === chat.id ? "border-blue-600 bg-blue-50" : "border-transparent"}`}
            >
              <span className="relative">
                <Avatar className="size-12 bg-slate-100"><img src={avatarUrl(chat.name)} alt="" className="size-full" /></Avatar>
                <span className={`absolute right-0 bottom-0 size-3 rounded-full border-2 border-white ${chat.online ? "bg-emerald-500" : "bg-slate-300"}`} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="mb-1 flex items-center justify-between gap-2">
                  <strong className="truncate text-sm">{chat.name}</strong>
                  <small className="text-xs text-slate-500">{chat.time}</small>
                </span>
                <span className="block truncate text-xs text-slate-500">{chat.lastMsg}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="hidden h-full flex-1 flex-col bg-slate-50 md:flex">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10"><img src={avatarUrl(selectedChat.name)} alt="" className="size-full" /></Avatar>
            <div><strong className="block text-sm">{selectedChat.name}</strong><span className="text-xs text-slate-500">Active now</span></div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" aria-label="Call"><Phone /></Button>
            <Button variant="ghost" size="icon" aria-label="Profile"><UserRound /></Button>
            <Button variant="ghost" size="icon" aria-label="Delete chat"><Trash2 /></Button>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="text-center"><Badge variant="outline" className="bg-white text-slate-400">Today</Badge></div>

          <div className="flex items-start gap-3">
            <Avatar><img src={avatarUrl(selectedChat.name)} alt="" className="size-full" /></Avatar>
            <div className="max-w-[70%]">
              <div className="rounded-2xl rounded-tl-none border border-slate-100 bg-white p-4 text-sm shadow-sm">Hello teacher, I have a question about the React Hooks section from yesterday&apos;s lecture.</div>
              <span className="mt-1 ml-1 block text-[10px] text-slate-500">10:30 AM</span>
            </div>
          </div>

          <div className="flex flex-row-reverse items-start gap-3">
            <Avatar><img src={avatarUrl("Felix")} alt="" className="size-full" /></Avatar>
            <div className="max-w-[70%] text-right">
              <div className="rounded-2xl rounded-tr-none bg-blue-600 p-4 text-sm text-white shadow-md">Hi there! Which part is unclear? I can explain it right now.</div>
              <span className="mt-1 mr-1 block text-[10px] text-slate-500">10:32 AM</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Avatar><img src={avatarUrl(selectedChat.name)} alt="" className="size-full" /></Avatar>
            <div className="max-w-[70%]">
              <div className="rounded-2xl rounded-tl-none border border-slate-100 bg-white p-4 text-sm shadow-sm">It&apos;s about the <code>useEffect</code> dependency array. I don&apos;t quite understand when it re-runs.</div>
              <span className="mt-1 ml-1 block text-[10px] text-slate-500">10:35 AM</span>
            </div>
          </div>
        </div>

        <footer className="border-t border-slate-100 bg-white p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <Button variant="ghost" size="icon" aria-label="Attach file"><Paperclip className="text-slate-400" /></Button>
            <Input
              placeholder="Type your message..."
              className="flex-1 border-0 shadow-none focus-visible:ring-0"
              onKeyDown={(event) => event.key === "Enter" && toast.info("Message sent (Simulation)")}
            />
            <Button variant="ghost" size="icon" aria-label="Add emoji"><Smile className="text-slate-400" /></Button>
            <Button size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700" aria-label="Send message"><Send /></Button>
          </div>
        </footer>
      </section>
    </div>
  )
}
