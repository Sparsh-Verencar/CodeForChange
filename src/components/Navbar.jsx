import WebPic from '/src/assets/OIP.jpg';
import Logo from '../assets/koraLogo.jpeg';
import { Link } from 'react-router-dom';
import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

function Navbar() {
    return (
        <div className="shadow-xl">
            <nav className="flex items-center justify-between bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900">
                <img src={Logo} alt="Kora Logo" className="w-20 h-20 border-[#EFDFBB] rounded-full border-4" />
                <h1 className="text-amber-50 text-5xl">KORA</h1>
                
                <div className="flex items-center">
                    <SignedOut>
                        <SignInButton
                            className="border-white-300 border-1 rounded-2xl p-2 text-amber-50 bg-blue-500 hover:bg-blue-600 transition-colors"
                            forceRedirectUrl={'/test-main-page'}  // Redirect to the TestMainPage after sign-in
                        />
                    </SignedOut>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;