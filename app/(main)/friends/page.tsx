import { Metadata } from 'next';
import React from 'react'


export const metadata: Metadata = {
  title: "Friends",
};

export default function page () {
  return (
    <>
    <div className="min-h-screen w-full max-w-7xl mx-auto flex items-center justify-center">Hello Friends</div>
    </>
  )
}
