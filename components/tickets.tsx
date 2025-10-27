import { View, Text, Alert } from "react-native";
import React, { useState } from "react";
import { useSearchContext } from "@/contexts/SearchContexts";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { amadeusApi } from "@/utils/api";
import { router } from "expo-router";
import axios from "axios";

const Tickets = ({ item }: any) => {
  const { searchData, flightOfferParams, flightOffersResult } =
    useSearchContext();



  const formatDuration = (segments: any) => {
    let totalDurationMs = 0;
    segments.forEach((segments: any) => {
      if (segments.departure && segments.arrival) {
        const departure = new Date(segments.departure.at);
        const arrivalTime = new Date(segments.arrival.at);

        const segmentDurationMs = arrivalTime - departure;
        totalDurationMs += segmentDurationMs;
      }
    });

    const totalDurationHours = Math.floor(totalDurationMs / (1000 * 60 * 60));
    const totalDurationMinutes = Math.floor(
      (totalDurationMs % (1000 * 60 * 60)) / (1000 * 60)
    );
    return `${totalDurationHours} hour${totalDurationHours !== 1 ? "s" : ""} ${totalDurationMinutes} minute${totalDurationMinutes !== 1 ? "s" : ""}`;
  };

  const formatTime = (time: string) => {
    if (!time) return "";

    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };



  return (
    <View className="bg-[#e0ebfa]  w-full p-4 py-2 rounded-lg">
      <View className="justify-between items-center flex-row py-2">
        <View className="w-16">
          <Text>{item?.itineraries[0]?.segments[0]?.carrierCode}</Text>
        </View>

        <View className="bg-[#A3BDED] rounded-md px-4 py-1">
          <Text className="text-sm font-semibold text-[#495990]">
            Recommended
          </Text>
        </View>
      </View>
      <View className="justify-between items-center flex-row py-2 w-full">
        <View className="w-1/4 items-start flex-row justify-start">
          <Text className="text-sm capitalize text-slate-600 font-semibold ">
            {searchData?.originCity}
          </Text>
        </View>

        <View className="w-2/4 justify-center items-center">
          <Text className="text-base text-[#495990] font-bold">
            {formatDuration(item?.itineraries[0]?.segments)}
          </Text>
        </View>

        <View className="w-1/4 items-start flex-row justify-end">
          <Text className="text-sm capitalize text-slate-600 font-semibold ">
            {searchData?.destinationCity}
          </Text>
        </View>
      </View>

      {/* Departure and Arrival Iata Code */}
      <View className="flex-row justify-between items-center py-2 w-full relative">
        <View className="w-1/3 flex-row items-start gap-1 justify-start">
          <Text>{item?.itineraries[0]?.segments[0]?.departure?.iataCode}</Text>
        </View>
        <View className="w-1/3 flex-row items-center  justify-center gap-1">
          <FontAwesome5 name="plane" size={18} color="#495990" />
        </View>
        <View className="w-1/3 flex-row items-end gap-1 justify-end">
          <Text>{item?.itineraries[0]?.segments[0]?.arrival?.iataCode}</Text>
        </View>
      </View>

      {/* Stops */}
      <View className="flex-row justify-between items-center py-2 w-full relative">
        <View className="w-1/3 items-start justify-center">
          <Text>
            {formatTime(item?.itineraries[0]?.segments[0]?.departure?.at)}
          </Text>
        </View>
        <View className="justify-center items-center w-1/3">
          <Text className="text-md text-slate-800 font-bold ">
            {item?.itineraries[0]?.segments.reduce(
              (total, segment, index) =>
                index === 0 ? total : total + total + 1,
              0
            )}{" "}
            Stops
          </Text>
        </View>

        <View className="justify-center items-end w-1/3">
          <Text>
            {formatTime(item?.itineraries[0]?.segments[0]?.arrival?.at)}
          </Text>
        </View>
      </View>

      {/* Type of ticket */}
      <View className="flex-row justify-between items-center py-2 w-full relative">
        <View className="flex-row items-center justify-start py-1 w-1/2 ">
          <MaterialIcons name="flight-class" size={24} color="#495990" />
          <Text className="text-md text-slate-600 font-bold capitalize">
            {item?.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin.length >
            15
              ? item?.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin.slice(
                  0,
                  15
                ) + "..."
              : item?.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin}
          </Text>
        </View>
        <View className="py-1 w-1/2 itemc-center flex-row justify-end space-x-1">
          <Text className="text-lg text-[#495990] font-bold">
            {item?.price?.currency} {item?.price?.grandTotal}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Tickets;
