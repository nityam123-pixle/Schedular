import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { PenBox } from 'lucide-react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import UserMenu from './user-menu'
import { checkUser } from '@/lib/checkUser'

const Header = async () => {
  await checkUser();
  return (
    <nav className='mx-auto py-2 px-4 flex justify-between items-center shadow-md border-b-2 bg-white'>
      <Link href={"/"} className='flex items-center'>
        <Image src="/logo.png" alt='Logo' className='h-16 w-auto' width={150} height={60} />
      </Link>
      <div className='flex items-center gap-4'>
        <Link href={"/events?create=true"} className=''>
            <Button> <PenBox size={18} className='flex items-center gap-2' />  Create Event</Button>
        </Link>
        <SignedOut>
          <SignInButton forceRedirectUrl={"/dashboard"}>
            <Button variant={"outline"}>Login</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
            <UserMenu />
        </SignedIn>
      </div>
    </nav>
  )
}

export default Header
