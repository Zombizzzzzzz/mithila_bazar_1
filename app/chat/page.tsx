'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Send } from 'lucide-react'

interface Chat {
  product_id: number
  customer_id: number
  product_name: string
  product_slug: string
  customer_name: string
  customer_email: string
  last_message: string
  last_message_time: Date
  unread_count: number
}

interface Message {
  id: number
  product_id: number
  customer_id: number
  admin_id?: number
  message: string
  is_from_customer: boolean
  is_read_by_admin: boolean
  is_read_by_customer: boolean
  created_at: Date
  updated_at: Date
  customer_name?: string
  admin_email?: string
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      fetchChats()
    }
  }, [status, router])

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/messages/customer/chats')
      if (response.ok) {
        const data = await response.json()
        setChats(data.chats)
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (chat: Chat) => {
    try {
      const response = await fetch(`/api/messages/${chat.product_id}/${chat.customer_id}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setSelectedChat(chat)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: selectedChat.product_id,
          message: newMessage.trim(),
        }),
      })

      if (response.ok) {
        setNewMessage('')
        // Refresh messages
        fetchMessages(selectedChat)
        // Refresh chats list
        fetchChats()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">My Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {chats.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No conversations yet. Start chatting from a product page!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <div
                        key={`${chat.product_id}-${chat.customer_id}`}
                        onClick={() => fetchMessages(chat)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedChat?.product_id === chat.product_id &&
                          selectedChat?.customer_id === chat.customer_id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{chat.product_name}</h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {chat.last_message}
                            </p>
                          </div>
                          {chat.unread_count > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                              {chat.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(chat.last_message_time).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="md:col-span-2">
          {selectedChat ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {selectedChat.product_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.is_from_customer ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.is_from_customer
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.is_from_customer
                              ? (session.user?.name || 'You')
                              : 'Admin'
                            } • {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex gap-2 mt-4">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}