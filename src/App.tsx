import React from 'react';
import Chat from "./components/Chat";
import TwitchIRCClientProvider from "./Contexts/TwitchIRCClientProvider";

const App = () => {
    return (
        <div>
            <TwitchIRCClientProvider>
                <Chat/>
            </TwitchIRCClientProvider>
        </div>
    );
}

export default App