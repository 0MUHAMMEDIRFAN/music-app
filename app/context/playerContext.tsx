import { Audio } from "expo-av";
import React, { createContext, useState, useContext, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { Track } from "../types";

type PlayerContextType = {
  isPlaying: boolean;
  currentTrack: Track | null;
  permissionStatus: boolean;
  sound: Audio.Sound | null;
  setPermissionStatus: (status: boolean) => void;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<boolean>(false);


  const playTrack = async (track: Track) => {
    try {
      // Unload previous sound if it exists
      if (sound) {
        await sound.unloadAsync();
      }

      setCurrentTrack(track);

      // Load and play the track using the URI from the track object
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: true },
      );
      if (Platform.OS === "ios") {
        Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
      } else if (Platform.OS === "android") {
        Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      }

      setSound(newSound);
      setIsPlaying(true);

      // Listen for playback status updates
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error("Error playing track:", error);
      Alert.alert("Playback Error", "Failed to play the selected track.");
    }
  };

  const togglePlayPause = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      // console.log(status)
      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  return (
    <PlayerContext.Provider value={{ isPlaying, currentTrack, sound, permissionStatus, setPermissionStatus, playTrack, togglePlayPause }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};