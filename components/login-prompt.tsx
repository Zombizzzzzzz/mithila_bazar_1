'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

export function LoginPrompt() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState('')

  useEffect(() => {
    const login = searchParams.get('login')
    const redirect = searchParams.get('redirect')

    if (login === 'true' && !session && status !== 'loading') {
      setShowLoginPrompt(true)
      setRedirectUrl(redirect || '/')
    }
  }, [searchParams, session, status])

  useEffect(() => {
    // If user becomes authenticated, redirect to the intended page
    if (session && showLoginPrompt && redirectUrl) {
      setShowLoginPrompt(false)
      router.push(redirectUrl)
    }
  }, [session, showLoginPrompt, redirectUrl, router])

  const handleLogin = () => {
    signIn('google', { callbackUrl: redirectUrl || '/' })
  }

  const handleClose = () => {
    setShowLoginPrompt(false)
    // Remove login parameters from URL
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('login')
    newUrl.searchParams.delete('redirect')
    router.replace(newUrl.pathname + newUrl.search)
  }

  if (status === 'loading') return null

  return (
    <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Sign In Required
          </DialogTitle>
          <DialogDescription>
            To contact the seller and start a conversation about this product, please sign in with your Google account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button onClick={handleLogin} className="w-full">
            Continue with Google
          </Button>
          <Button variant="outline" onClick={handleClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}