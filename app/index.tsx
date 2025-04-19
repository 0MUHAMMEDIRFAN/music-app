import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform, FlatList, Image } from "react-native";
import MiniPlayer from "./components/MiniPlayer";
import { formatDuration } from "./utils/formats";
import TrackList from "./components/TrackList";
import { Audio } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import { router, useRouter } from "expo-router";
import { usePlayer } from "./context/playerContext";

const HomePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tracks");
  const { isPlaying, currentTrack, sound, playTrack, togglePlayPause, setPermissionStatus, tracks, setTracks ,PlayNextSong,PlayPrevSong} = usePlayer()

  // Load music tracks from media library
  const loadMusicTracks = async () => {
    try {
      setIsLoading(true);
      // For native mobile platforms, use MediaLibrary
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: Number.MAX_SAFE_INTEGER, // Fetch all available audio assets
        sortBy: [MediaLibrary.SortBy.creationTime], // Sort by recent
      });
      // Add tabs for Tracks and Folders below the header


      const loadedTracks = await Promise.all(
        media.assets.map(async (asset) => {
          // Get a default album art image

          // const defaultAlbumArt = Image.resolveAssetSource(musicIcon).uri;
          const defaultAlbumArt = require("../assets/images/music.jpeg");
          const folderName = asset.uri.split("/").slice(-2, -1)[0]; // Extract parent folder name

          // console.log(asset);

          return {
            id: asset.id,
            title: asset.filename.replace(/\.[^/.]+$/, ""), // Remove file extension
            artist: "Unknown Artist", // In a real app, you'd extract this from metadata
            album: "Unknown Album", // In a real app, you'd extract this from metadata
            duration: asset.duration * 1000,
            currentTime: formatDuration("00"),
            albumArt: defaultAlbumArt,
            uri: asset.uri,
            folder: folderName, // Add parent folder name
          };
        }),
      );
      setTracks(loadedTracks);

    } catch (error) {
      console.error("Error loading music tracks:", error);
      Alert.alert("Error", "Failed to load music tracks from your device.");
    } finally {
      setIsLoading(false);
    }
  };

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


  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-around bg-gray-200 p-2">
        <TouchableOpacity
          onPress={() => setActiveTab("Tracks")}
          className={`flex-1 items-center p-2 ${activeTab === "Tracks" ? "bg-white" : "bg-gray-200"
            }`}
        >
          <Text className="text-base font-medium">Tracks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("Folders")}
          className={`flex-1 items-center p-2 ${activeTab === "Folders" ? "bg-white" : "bg-gray-200"
            }`}
        >
          <Text className="text-base font-medium">Folders</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-lg text-gray-500">
              Loading music library...
            </Text>
          </View>
        ) :
          (
            <View className="flex-1">{activeTab === "Tracks" ?
              <TrackList
                onTrackSelect={playTrack}
                onDeleteTrack={(id) => {
                  setTracks(tracks.filter((track) => track.id !== id));
                }}
                tracks={tracks.length > 0 ? tracks : undefined}
                sortBy="recent"
              />
              : activeTab === "Folders" &&
              <View className="flex-1">
                {tracks.length > 0 ? (
                  <FlatList
                    data={[...new Set(tracks.map((track) => track.folder))]}
                    renderItem={(folder) =>
                      <TouchableOpacity
                        key={folder.item}
                        onPress={() => {
                          // Navigate to the full player view with track info
                          // const folderTracks = tracks.filter((track) => track.folder === folder.item);
                          router.push({
                            pathname: "/folder-view",
                            params: { folderName: folder.item },
                          });
                        }}
                        className="flex-row items-center p-3 border-b border-gray-200 bg-white"
                      >
                        <Image source={require("../assets/images/folder.jpeg")} className="w-12 h-12 rounded-sm " />
                        <View className="flex-1 ml-3">
                          <Text className="text-lg font-medium">{folder.item}</Text>
                        </View>

                      </TouchableOpacity>
                    }
                    // contentContainerStyle={{ paddingBottom: 80 }} // Space for mini player
                    showsVerticalScrollIndicator={false}

                  />
                ) : (
                  <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-lg text-gray-500">No folders available.</Text>
                  </View>
                )}
              </View>}
            </View>
          )}
      </View>
      <MiniPlayer
        isPlaying={isPlaying}
        currentTrack={currentTrack}
        onPlayPause={togglePlayPause}
        onPrevious={PlayPrevSong}
        onNext={PlayNextSong}
        sound={sound}
      />
    </View>
  )
}

export default HomePage;