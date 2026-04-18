import "./App.css";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/react";

function App() {
  return (
    <>
      <header>
        <div>Hello World</div>
        <Show when="signed-out">
          <>
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" />
          </>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </>
  );
}

export default App;
