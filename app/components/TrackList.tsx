import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Play, MoreVertical, Clock3 } from "lucide-react-native";
import { useRouter } from "expo-router";

type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  albumArt: string;
  uri?: string; // URI for the audio file
};

type TrackListProps = {
  tracks?: Track[];
  onTrackSelect?: (track: Track) => void;
  onDeleteTrack?: (trackId: string) => void;
  sortBy?: "artist" | "album" | "recent";
};

const TrackList = ({
  tracks = undefined,
  onTrackSelect = () => { },
  onDeleteTrack = () => { },
  sortBy = "artist",
}: TrackListProps) => {
  const router = useRouter();

  const handleTrackPress = (track: Track) => {
    onTrackSelect(track);
  };

  const handleLongPress = (track: Track) => {
    Alert.alert("Track Options", `${track.title} by ${track.artist}`, [
      {
        text: "Delete",
        style: "destructive",
        onPress: () => confirmDelete(track),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const confirmDelete = (track: Track) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${track.title}"? This cannot be undone.`,
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteTrack(track.id),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  // Sort tracks based on sortBy prop
  const sortedTracks = [...tracks].sort((a, b) => {
    if (sortBy === "artist") {
      return a.artist.localeCompare(b.artist);
    } else if (sortBy === "album") {
      return a.album.localeCompare(b.album);
    }
    // For 'recent', we would normally sort by date added
    // But since we don't have that field, we'll just return the original order
    return 0;
  });

  const renderTrackItem = ({ item }: { item: Track }) => (
    <TouchableOpacity
      className="flex-row items-center p-3 border-b border-gray-200 bg-white"
      onPress={() => handleTrackPress(item)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
    >
      <Image source={item.albumArt} className="w-12 h-12 rounded-md" />
      <View className="flex-1 ml-3">
        <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-sm text-gray-500" numberOfLines={1}>
          {item.artist} • {item.album}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-sm text-gray-500 mr-3">{item.duration}</Text>
        <TouchableOpacity onPress={() => handleLongPress(item)} className="p-1">
          <MoreVertical size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {tracks.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-gray-500 text-center">
            No music tracks found on your device.
          </Text>
          <Text className="text-sm text-gray-400 text-center mt-2">
            Add music to your device or check app permissions.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedTracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }} // Space for mini player
        />
      )}
    </View>
  );
};

export default TrackList;
