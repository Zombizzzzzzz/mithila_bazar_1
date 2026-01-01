"use client"

import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ClientAuth() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button onClick={() => signIn()}>Login</Button>
      </div>
    )
  }

  const user = session.user

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((s) => !s)}
        className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden ring-1 ring-border"
        aria-label="User menu"
      >
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name || 'User'} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center text-sm">{(user?.name || 'U').charAt(0)}</div>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5">
          <div className="p-2">
            <Link href="/profile" onClick={() => setMenuOpen(false)} className="block p-2 rounded hover:bg-muted">Profile</Link>
            <button onClick={() => signOut()} className="w-full text-left p-2 rounded hover:bg-muted">Sign out</button>
          </div>
        </div>
      )}
    </div>
  )
}
