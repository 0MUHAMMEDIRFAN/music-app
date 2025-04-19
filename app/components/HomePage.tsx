import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import MiniPlayer from "./MiniPlayer";
import { formatDuration } from "../utils/formats";
import TrackList from "./TrackList";
import { Audio } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import { router, useRouter } from "expo-router";

const HomePage = () => {
    const router = useRouter();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Tracks");
    const [tracks, setTracks] = useState([]);
    const [currentTrack, setCurrentTrack] = useState();
    const [sound, setSound] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(null);


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
                    const defaultAlbumArt = require("../../assets/images/music-icon.png");
                    const folderName = asset.uri.split("/").slice(-2, -1)[0]; // Extract parent folder name

                    // console.log(folderName);

                    return {
                        id: asset.id,
                        title: asset.filename.replace(/\.[^/.]+$/, ""), // Remove file extension
                        artist: "Unknown Artist", // In a real app, you'd extract this from metadata
                        album: "Unknown Album", // In a real app, you'd extract this from metadata
                        duration: formatDuration(asset.duration),
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
                                onTrackSelect={handleTrackSelect}
                                onDeleteTrack={(id) => {
                                    setTracks(tracks.filter((track) => track.id !== id));
                                }}
                                tracks={tracks.length > 0 ? tracks : undefined}
                                sortBy="recent"
                            />
                            : activeTab === "Folders" &&
                            <View className="flex-1">
                                {tracks.length > 0 ? (
                                    [...new Set(tracks.map((track) => track.folder))].map((folder, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                // Navigate to the full player view with track info
                                                const folderTracks = tracks.filter((track) => track.folder === folder);
                                                router.push({
                                                    pathname: "/folder-view",
                                                    params: { folderTracks, folder },
                                                });
                                            }}
                                            className="p-4 border-b border-gray-300"
                                        >
                                            <Text className="text-lg font-medium">{folder}</Text>
                                        </TouchableOpacity>
                                    ))
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
                onPlayPause={handlePlayPause}
                sound={sound}
            />
        </View>
    )
}

export default HomePage;