import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import TrackList from "./components/TrackList";
import MiniPlayer from "./components/MiniPlayer";
import { useState, useEffect } from "react";
import * as MediaLibrary from "expo-media-library";
import { Audio } from "expo-av";


export default function HomeScreen() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState();
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  // Request media library permissions
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "This app needs access to your media library to display and play your music.",
          [{ text: "OK" }],
        );
      } else {
        loadMusicTracks();
      }
    })();

    // Cleanup function for sound object
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Format duration from seconds to mm:ss
  const formatDuration = (durationInSeconds) => {
    if (!durationInSeconds) return "0:00";
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Load music tracks from media library
  const loadMusicTracks = async () => {
    try {
      setIsLoading(true);

      if (Platform.OS === "web") {
        // Use demo tracks for web environment
        const demoTracks = [
          {
            id: "5",
            title: "Uptown Funk",
            artist: "Mark Ronson ft. Bruno Mars",
            album: "Uptown Special",
            duration: "4:30",
            albumArt:
              "https://images.unsplash.com/photo-1618609377864-68609b857e90?w=300&q=80",
            uri: "https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.mp3",
          },
        ];
        setTracks(demoTracks);
      } else {
        // For native mobile platforms, use MediaLibrary
        const media = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: 50,
        });

        const loadedTracks = await Promise.all(
          media.assets.map(async (asset) => {
            // Get a default album art image

            // const defaultAlbumArt = Image.resolveAssetSource(musicIcon).uri;
            const defaultAlbumArt = require("../assets/images/music-icon.png");

            console.log(asset);

            return {
              id: asset.id,
              title: asset.filename.replace(/\.[^/.]+$/, ""), // Remove file extension
              artist: "Unknown Artist", // In a real app, you'd extract this from metadata
              album: "Unknown Album", // In a real app, you'd extract this from metadata
              duration: formatDuration(asset.duration),
              currentTime: formatDuration("00"),
              albumArt: defaultAlbumArt,
              uri: asset.uri
            };
          }),
        );

        setTracks(loadedTracks);
      }
    } catch (error) {
      console.error("Error loading music tracks:", error);
      Alert.alert("Error", "Failed to load music tracks from your device.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrackSelect = async (track: any) => {
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

      setSound(newSound);
      setIsPlaying(true);

      // Listen for playback status updates
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error("Error playing track:", error);
      Alert.alert("Playback Error", "Failed to play the selected track.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-lg text-gray-500">
              Loading music library...
            </Text>
          </View>
        ) : (
          <TrackList
            onTrackSelect={handleTrackSelect}
            onDeleteTrack={(id) => {
              // Filter out the deleted track
              setTracks(tracks.filter((track) => track.id !== id));
            }}
            tracks={tracks.length > 0 ? tracks : undefined}
            sortBy="recent"
          />
        )}
      </View>
      <MiniPlayer
        isPlaying={isPlaying}
        currentTrack={currentTrack}
        onPlayPause={handlePlayPause}
        sound={sound}
      />
    </View>
  );
}
