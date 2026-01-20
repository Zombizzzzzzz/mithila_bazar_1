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
  const [productFromUrl, setProductFromUrl] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to home page with login prompt and current URL as redirect
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search)
      router.push(`/?login=true&redirect=${currentUrl}`)
      return
    }

    if (status === 'authenticated') {
      // Get product ID from URL if present
      const urlParams = new URLSearchParams(window.location.search)
      const productId = urlParams.get('product')
      if (productId) {
        setProductFromUrl(productId)
      }
      fetchChats()
    }
  }, [status, router])

  useEffect(() => {
    // If we have a product from URL and chats are loaded, try to find or create conversation
    if (productFromUrl && !loading) {
      const existingChat = chats.find(chat => chat.product_id === parseInt(productFromUrl))
      if (existingChat) {
        fetchMessages(existingChat)
      } else {
        // Create a placeholder chat for new conversation
        createPlaceholderChat(productFromUrl)
      }
    }
  }, [productFromUrl, chats, loading])

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

  const createPlaceholderChat = async (productId: string) => {
    try {
      // Fetch product details to create placeholder chat
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const product = await response.json()
        const placeholderChat: Chat = {
          product_id: parseInt(productId),
          customer_id: 0, // Will be set when message is sent
          product_name: product.name,
          product_slug: product.slug,
          customer_name: session?.user?.name || '',
          customer_email: session?.user?.email || '',
          last_message: '',
          last_message_time: new Date(),
          unread_count: 0
        }
        setSelectedChat(placeholderChat)
        setMessages([]) // Empty messages for new conversation
      }
    } catch (error) {
      console.error('Error creating placeholder chat:', error)
    }
  }

  const sendMessage = async () => {
    console.log('Send message called')
    console.log('Session status:', status)
    console.log('Session data:', session)
    console.log('Selected chat:', selectedChat)
    console.log('New message:', newMessage)

    if (!selectedChat || !newMessage.trim()) {
      console.log('Cannot send message: selectedChat or newMessage is empty', { selectedChat, newMessage })
      return
    }

    console.log('Sending message:', { product_id: selectedChat.product_id, message: newMessage.trim() })

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

      console.log('Send message response:', response.status, response.statusText)

      if (response.ok) {
        const responseData = await response.json()
        console.log('Message sent successfully:', responseData)
        setNewMessage('')
        // Refresh chats list
        await fetchChats()

        // If this was a placeholder chat (customer_id === 0), try to find the real chat
        if (selectedChat.customer_id === 0) {
          const customerChatsResponse = await fetch('/api/messages/customer/chats')
          if (customerChatsResponse.ok) {
            const customerData = await customerChatsResponse.json()
            const realChat = customerData.chats.find((chat: Chat) => chat.product_id === selectedChat.product_id)
            if (realChat) {
              console.log('Found real chat:', realChat)
              setSelectedChat(realChat)
              fetchMessages(realChat)
              return
            }
          }
        }

        // For existing chats, just refresh messages
        fetchMessages(selectedChat)
      } else {
        const errorData = await response.json()
        console.error('Failed to send message:', errorData)
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
                <p className="mb-2">
                  {productFromUrl ? 'Start a conversation about this product' : 'Select a conversation to view messages'}
                </p>
                {productFromUrl && (
                  <p className="text-sm">Type your message below to begin chatting with the seller.</p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}