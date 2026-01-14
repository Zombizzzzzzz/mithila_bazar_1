'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, Send, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

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

export default function AdminMessagesPage() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [adminId, setAdminId] = useState<number | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const session = localStorage.getItem('admin_session')
    if (!session) {
      router.push('/admin/login')
      return
    }

    try {
      const adminData = JSON.parse(session)
      setAdminId(adminData.id)
      fetchChats()
    } catch (error) {
      localStorage.removeItem('admin_session')
      router.push('/admin/login')
    }
  }

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/messages/admin/chats')
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
    if (!selectedChat || !newMessage.trim() || !adminId) return

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: selectedChat.product_id,
          message: newMessage.trim(),
          admin_id: adminId,
          customer_id: selectedChat.customer_id, // Pass customer_id for admin messages
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

  const handleLogout = () => {
    localStorage.removeItem('admin_session')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Customer Messages</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
          >
            <span>←</span>
            Logout
          </button>
        </div>

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
                      No conversations yet.
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
                              <p className="text-xs text-muted-foreground">{chat.customer_name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {chat.last_message}
                              </p>
                            </div>
                            {chat.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {chat.unread_count}
                              </Badge>
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
                    {selectedChat.product_name} - {selectedChat.customer_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedChat.customer_email}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.is_from_customer ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.is_from_customer
                                ? 'bg-muted'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.is_from_customer
                                ? (message.customer_name || 'Customer')
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
                      placeholder="Type your reply..."
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
    </div>
  )
}