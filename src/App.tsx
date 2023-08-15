import React from 'react';
import Chat from "./components/Chat";
import EmoteRegistryProvider from "./Contexts/EmoteRegistryProvider";
import TwitchIRCClientProvider from "./Contexts/TwitchIRCClientProvider";

const App = () => {
    return (
        <div>
            <TwitchIRCClientProvider>
                <EmoteRegistryProvider>
                    <Chat/>
                </EmoteRegistryProvider>
            </TwitchIRCClientProvider>
        </div>
    );
}

export default App