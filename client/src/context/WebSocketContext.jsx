import { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const [clientId, setClientId] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);

    useEffect(() => {
        
        let cancelled = false;
            
        const socket = new WebSocket("ws://localhost:9000");

        socket.onopen = () => {
            if(cancelled){
                socket.close();
                return;
            }

            console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
            if(cancelled) return;
            const data = JSON.parse(event.data);

            console.log("WebSocket message:", data);

            if (data.type === "client-id") {
                setClientId(data.clientId);
                return;
            }

            setLastMessage(data);
        };

        socket.onerror = (error) => {
            if(!cancelled){
                console.error("WebSocket error:", error);
            }
            
        };

        socket.onclose = () => {
            if(!cancelled){
                console.log("WebSocket disconnected");
            }
            
        };

        return () => {
            cancelled = true;
            if(socket.readyState === WebSocket.OPEN){
                socket.close();
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider
            value={{
                clientId,
                lastMessage
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    return useContext(WebSocketContext);
}