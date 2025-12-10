
import './App.css'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'

function App() {

  return (
    <>
      <h1>Welcome to React App</h1>

      {/* it will show sign in button when you are signed out */}
      <SignedOut>
        <SignInButton mode="modal">
          <button>
            Sign In Bro
          </button>
        </SignInButton>
      </SignedOut>

      {/* It will show signout button when you are signed In already */}
      <SignedIn>
        <p>You are signed in!</p>
        <SignOutButton />
      </SignedIn>

      <UserButton/>
    </>
  )
}

export default App
