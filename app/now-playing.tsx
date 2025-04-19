import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Slider from '@react-native-community/slider'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react-native";
import { Stack } from "expo-router";
import { formatDuration } from "./utils/formats";
import { Audio } from "expo-av";
import { usePlayer } from "./context/playerContext";


const NowPlaying = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isPlaying, togglePlayPause, currentTrack, sound, PlayNextSong, PlayPrevSong } = usePlayer()
  const [currentVolume, setCurrentVolume] = useState(0); // Default volume to 1 (max)
  const [currentProgress, setCurrentProgress] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  // console.log(currentTrack.duration)
  // console.log(currentProgress)
  // console.log(progressValue)

  useEffect(() => {
    const setUpAudio = async () => {
      const status = await sound.getStatusAsync();
      console.log(status)
      if (status.isLoaded) {
        setCurrentVolume(status.volume);
        setCurrentProgress(status.positionMillis)
        setProgressValue(Math.floor(100 * (Number(status.positionMillis))) / (Number(currentTrack.duration)));
      }
    };
    if (sound) {
      setUpAudio();
    }
  }, []);
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateProgress = async () => {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          setCurrentProgress(status.positionMillis);
          setProgressValue(
            Math.floor(100 * Number(status.positionMillis) / Number(currentTrack.duration))
          );
        }
      }
    };

    if (sound) {
      interval = setInterval(updateProgress, 1000);
    }

    return () => {
      console.log("hey")
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sound, currentTrack]);
  // const [currentTrack] = useState({
  //   ...params,
  // });





  return (
    <View className="flex-1 bg-gray-900 p-6 justify-between">
      <Stack.Screen options={{ title: "Now Playing", headerShown: true }} />

      {/* Album Art */}
      <View className="items-center mt-8">
        <Image
          source={currentTrack.albumArt}
          className="w-72 h-72 object-contain bg-gray-200 rounded-lg shadow-lg"
        />
      </View>

      {/* Track Info */}
      <View className="items-center mt-8">
        <Text className="text-white text-2xl font-bold" numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text className="text-gray-400 text-lg mt-1" numberOfLines={1}>
          {currentTrack.artist}
        </Text>
        <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
          {currentTrack.album}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="mt-8">
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={1}
          value={progressValue / 100}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#707070"
          thumbTintColor="#FFFFFF"
          onSlidingComplete={(value) => {
            const newProgress = value * currentTrack.duration;
            setCurrentProgress(newProgress);
            sound.setPositionAsync(newProgress);
          }}
        />
        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-400">
            {formatDuration(currentProgress)}
          </Text>
          <Text className="text-gray-400">
            {formatDuration(currentTrack.duration)}
          </Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View className="flex-row justify-center items-center mt-8 mb-12">
        <TouchableOpacity
          onPress={PlayPrevSong}
          className="p-4">
          <SkipBack size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayPause}
          className="w-20 h-20 rounded-full bg-white items-center justify-center mx-8"
        >
          {isPlaying ? (
            <Pause size={32} color="#000" />
          ) : (
            <Play size={32} color="#000" fill="#000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={PlayNextSong}
          className="p-4">
          <SkipForward size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 
      // Volume Control
      <View className="flex-row items-center mb-8">
        <Volume2 size={20} color="#fff" />
        <View className="h-1 bg-gray-700 rounded-full overflow-hidden flex-1 mx-4">
          <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={0}
            maximumValue={1}
            value={currentVolume}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#707070"
            thumbTintColor="#FFFFFF"
            onValueChange={(value) => {
              setCurrentVolume(value);
              Audio.setVolumeAsync(value);
            }}
          />
        </View>
      </View> */}
    </View>
  );
};

export default NowPlaying;
