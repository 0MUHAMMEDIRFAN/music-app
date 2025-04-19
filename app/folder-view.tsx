import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import TrackList from './components/TrackList';
import MiniPlayer from './components/MiniPlayer';
import * as MediaLibrary from "expo-media-library";
import { formatDuration } from './utils/formats';
import { usePlayer } from './context/playerContext';


const FolderView: React.FC = () => {
    // const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [tracks, setTracks] = useState([]);
    const params = useLocalSearchParams();
    const { folderName } = params
    const { isPlaying, currentTrack, playTrack, togglePlayPause, sound } = usePlayer()
    // console.log(folderTracks)


    const PlayPrevSong = () => {
        if (tracks.length > 0 && currentTrack) {
            const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
            if (currentIndex > 0) {
                playTrack(tracks[currentIndex - 1]);
            }
        }
    }
    const PlayNextSong = () => {
        if (tracks.length > 0 && currentTrack) {
            const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
            if (currentIndex > 0) {
                playTrack(tracks[currentIndex + 1]);
            }
        }
    }
    const loadMusicTracks = async () => {
        try {
            setIsLoading(true);
            // For native mobile platforms, use MediaLibrary
            const media = await MediaLibrary.getAssetsAsync({
                mediaType: MediaLibrary.MediaType.audio,
                first: Number.MAX_SAFE_INTEGER, // Fetch all available audio assets
                sortBy: [MediaLibrary.SortBy.creationTime], // Sort by recent
            });

            const loadedTracks = await Promise.all(
                media.assets.map(async (asset) => {
                    const defaultAlbumArt = require("../assets/images/music.jpeg");
                    const parentFolderName = asset.uri.split("/").slice(-2, -1)[0]; // Extract parent folder name

                    return {
                        id: asset.id,
                        title: asset.filename.replace(/\.[^/.]+$/, ""), // Remove file extension
                        artist: "Unknown Artist", // In a real app, you'd extract this from metadata
                        album: "Unknown Album", // In a real app, you'd extract this from metadata
                        duration: asset.duration * 1000,
                        currentTime: formatDuration(0),
                        albumArt: defaultAlbumArt,
                        uri: asset.uri,
                        folder: parentFolderName, // Add parent folder name
                    };
                }),
            );

            // Filter tracks by the selected folder name
            console.log(folderName)
            const filteredTracks = loadedTracks.filter(track => track.folder === folderName);
            setTracks(filteredTracks);

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
        <View className="flex-1 bg-white justify-between">
            <Stack.Screen options={{ title: folderName, headerShown: true }} />
            <View className="flex-1">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center p-4">
                        <Text className="text-lg text-gray-500">
                            Loading music library...
                        </Text>
                    </View>
                ) :
                    (
                        <View className="flex-1">
                            <TrackList
                                onTrackSelect={playTrack}
                                onDeleteTrack={(id) => {
                                    setTracks(tracks.filter((track) => track.id !== id));
                                }}
                                tracks={tracks.length > 0 ? tracks : undefined}
                                sortBy="recent"
                            />

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
    );
};

export default FolderView;