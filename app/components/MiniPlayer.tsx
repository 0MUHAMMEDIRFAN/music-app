import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Track } from "../types";

interface MiniPlayerProps {
  isPlaying?: boolean;
  currentTrack?: Track | null;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  sound?: any;
}

const MiniPlayer = ({
  isPlaying = false,
  currentTrack = undefined,
  onPlayPause = () => { },
  onNext = () => { },
  onPrevious = () => { },
  sound = undefined
}: MiniPlayerProps) => {
  const router = useRouter();

  const handleExpandPlayer = () => {
    // Navigate to the full player view with track info
    router.push({
      pathname: "/now-playing",
      params: { ...currentTrack, sound },
    });
  };

  return (
    currentTrack ?
      <View className="w-full h-[70px] bg-gray-900 border-t border-gray-800 px-4 flex-row items-center justify-between">
        {/* Track info and album art */}
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={handleExpandPlayer}
          activeOpacity={0.7}
        >
          <Image
            source={currentTrack?.albumArt}
            className="w-12 h-12 bg-gray-200 rounded-md mr-3"
          />
          <View className="flex-1 pr-2">
            <Text className="text-white font-medium text-sm" numberOfLines={1}>
              {currentTrack?.title}
            </Text>
            <Text className="text-gray-400 text-xs" numberOfLines={1}>
              {currentTrack?.artist}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Playback controls */}
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onPrevious}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <SkipBack size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPlayPause}
            className="w-10 h-10 rounded-full bg-white items-center justify-center mx-2"
          >
            {isPlaying ? (
              <Pause size={18} color="#000" />
            ) : (
              <Play size={18} color="#000" fill="#000" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNext}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <SkipForward size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View> : ""
  );
};

export default MiniPlayer;
