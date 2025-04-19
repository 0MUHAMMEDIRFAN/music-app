import React, { createContext, useState, ReactNode } from 'react';

interface AppContextProps {
    sound: string;
    setSound: (sound: string) => void;
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [sound, setSound] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    return (
        <AppContext.Provider
            value={{
                sound,
                setSound,
                isPlaying,
                setIsPlaying,
                isLoading,
                setIsLoading,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};