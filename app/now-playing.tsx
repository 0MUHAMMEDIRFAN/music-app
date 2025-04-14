import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react-native";
import { Stack } from "expo-router";

const NowPlaying = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack] = useState({
    ...params,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progress = ((Number(currentTrack.currentTime) || 0) / (Number(currentTrack.duration) || 0)) * 100;
  console.log(formatTime(currentTrack.duration))
  const togglePlayback = async () => {
    if (currentTrack.sound) {
      if (isPlaying) {
        await currentTrack.sound.pauseAsync();
      } else {
        await currentTrack.sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    };
  };

  return (
    <View className="flex-1 bg-gray-900 p-6 justify-between">
      <Stack.Screen options={{ title: "Now Playing", headerShown: true }} />

      {/* Album Art */}
      <View className="items-center mt-8">
        <Image
          source={currentTrack.albumArt}
          className="w-72 h-72 rounded-lg shadow-lg"
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
        <View className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <View className="h-full bg-white" style={{ width: `${progress}%` }} />
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-400">
            {currentTrack.currentTime}
          </Text>
          <Text className="text-gray-400">
            {currentTrack.duration}
          </Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View className="flex-row justify-center items-center mt-8 mb-12">
        <TouchableOpacity className="p-4">
          <SkipBack size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayback}
          className="w-20 h-20 rounded-full bg-white items-center justify-center mx-8"
        >
          {isPlaying ? (
            <Pause size={32} color="#000" />
          ) : (
            <Play size={32} color="#000" fill="#000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity className="p-4">
          <SkipForward size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Volume Control */}
      <View className="flex-row items-center mb-8">
        <Volume2 size={20} color="#fff" />
        <View className="h-1 bg-gray-700 rounded-full overflow-hidden flex-1 mx-4">
          <View className="h-full bg-white w-3/4" />
        </View>
      </View>
    </View>
  );
};

export default NowPlaying;
