import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react-native";

interface NowPlayingProps {
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentTrack?: {
    title: string;
    artist: string;
    album: string;
    albumArt: string;
    duration: number; // in seconds
    currentTime: number; // in seconds
  };
}

const NowPlaying = ({
  isPlaying = false,
  onPlayPause = () => { },
  onNext = () => { },
  onPrevious = () => { },
  currentTrack = {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    albumArt:
      "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&q=80",
    duration: 355, // in seconds
    currentTime: 127, // in seconds
  },
}: NowPlayingProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progress = (currentTrack.currentTime / currentTrack.duration) * 100;

  return (
    <View className="flex-1 bg-gray-900 p-6 justify-between">
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
            {formatTime(currentTrack.currentTime)}
          </Text>
          <Text className="text-gray-400">
            {formatTime(currentTrack.duration)}
          </Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View className="flex-row justify-center items-center mt-8 mb-12">
        <TouchableOpacity className="p-4" onPress={onPrevious}>
          <SkipBack size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPlayPause}
          className="w-20 h-20 rounded-full bg-white items-center justify-center mx-8"
        >
          {isPlaying ? (
            <Pause size={32} color="#000" />
          ) : (
            <Play size={32} color="#000" fill="#000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity className="p-4" onPress={onNext}>
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
