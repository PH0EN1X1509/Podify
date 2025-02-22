'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';

const Header = () => {

  return (
    <header className="w-full bg-black shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
      <Link href="/" className="flex">
          <Image
            src={"/logo.png"}
            alt="welth logo"
            height={60}
            width={200}
            className="h-12 w-auto object-contain"
          />
          <p className='text-4xl font-extrabold text-purple-800 my-3 mx-2'>Podify</p>
        </Link>

        <div className="flex space-x-4">
          <nav className="hidden md:flex space-x-4">
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white">
              <Link href="/about">About</Link>
            </Button>
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white">
              <Link href="/services">Services</Link>
            </Button>
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white">
              <Link href="/contact">Contact</Link>
            </Button>
          </nav>
          
          <Button className="bg-purple-600 text-white hover:bg-purple-700">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
