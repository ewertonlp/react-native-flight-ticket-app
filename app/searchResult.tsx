import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import HeaderSearchResults from "@/components/headerSearchResults";
import { useSearchContext } from "@/contexts/SearchContexts";
import Tickets from "@/components/tickets";
import { amadeusApi, getAccessToken  } from "@/utils/api";
import axios from "axios";

const SearchResult = () => {
  const { searchData, flightOfferParams, flightOffersResult } =
  useSearchContext();
  const [isPending, setIsPending] = useState(false);
  const params = useLocalSearchParams<any>();
  console.log("Parâmetros recebidos:", params);

  useEffect(() => {
  (async () => {
    const token = await getAccessToken();
    console.log("Token válido:", token);
  })();
}, []);

  const handleUpsellRequest = async (items: any) => {
    try {
      setIsPending(true);
       const token = await getAccessToken();
      const apiUrl = `https://test.api.amadeus.com/v1/shopping/flight-offers/upselling`;

      const requestBody = {
        data: {
          type: "flight-offers-upselling",
          flightOffers: [items],
          payment: [
            {
              brand: "VISA_IXARIS",
              binNumber: 123456,
              flightOfferIds: [1],
            },
          ],
        },
      };

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      };

      const response = await fetch(apiUrl, requestOptions);
      const responseData = await response.json();

      if (response.ok) {
        setIsPending(false);
        router.push({
          pathname: "/flightDetails",
          params: {
            flightOfferData: JSON.stringify(responseData),
          },
        });
      } else if (
        responseData.errors &&
        (responseData.errors[0].code === 39397 ||
          responseData.errors[0].code === 4926)
      ) {
        console.log("No upsell offer found. Trying pricing request");
        await handlePricingRequest(items);
      } else {
        setIsPending(false);
        Alert.alert("Error", "Upsell request failed.");
      }
    } catch (error) {
      console.error(error);
      setIsPending(false);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const handlePricingRequest = async (item: any) => {
    try {
      const token = await getAccessToken();
      const response = await axios.post(
        "https://test.api.amadeus.com/v1/shopping/flight-offers/pricing?include=detailed-fare-rules",
        {
          data: {
            type: "flight-offers-pricing",
            flightOffers: [item],
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsPending(false);
      const FlightOfferPrice = response.data.data;
      

      router.push({
        pathname: "/flightDetails",
        params: {
          flightOfferData: JSON.stringify(FlightOfferPrice),
        },
      });
    } catch (error: any) {
      console.log("Pricing request error:", error.response?.data || error.message);
    setIsPending(false);
    Alert.alert("Error", "Pricing request failed.");
    }
  };

  const renderFlightOffer = (item: any, index: number) => (
    <Pressable
      key={index}
      onPress={() => handleUpsellRequest(item)}
      className="mb-8"
    >
      <Tickets key={index} item={item} />
    </Pressable>
  );

  return (
    <View className="flex-1 items-center bg-[#f5f7fa]">
      {isPending && (
        <View className="absolute z-50 h-full w-full justify-center items-center">
          <View className="bg-[#000] bg-opacity-50 w-full h-full justify-center items-center opacity-[0.45]">
            <View className="absolute">
              <ActivityIndicator
                size="large"
                color="#fff"
                style={{ paddingTop: 20 }}
              />
            </View>
          </View>
        </View>
      )}
      <View className="w-full h-full">
        <View className="justify-center w-full bg-[#9BB5E9] relative rounded-b-[25px] px-2 pt-16 pb-2">
          <View>
            <View className="flex-row gap-4 justify-between items-center px-1">
              <Pressable
                onPress={() => router.back()}
                className="flex-row items-center justify-start h-10 w-[10%]"
              >
                <View className="rounded-full  h-10 w-10 justify-center items-center">
                  <MaterialIcons
                    name="keyboard-arrow-left"
                    size={30}
                    color="#fff"
                  />
                </View>
              </Pressable>

              <View className="w-[60%] justify-center items-center flex-row">
                <Text className="text-lg text-white font-extrabold">
                  Search Results
                </Text>
              </View>
              <View>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={30}
                  color="white"
                />
              </View>
            </View>

            <HeaderSearchResults />
          </View>
        </View>

        <ScrollView
          className="w-full"
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View className="w-full py-2 justify-between items-center">
            <View className="w-full px-8 flex-row justify-between items-center py-2">
              <View>
                <Text className="text-md font-semibold text-slate-800">
                  Search Results
                </Text>
              </View>
              <View className="flex-row justify-center items-center">
                <Text className="text-base font-semibold text-slate-400">
                  {flightOffersResult?.data?.length} Results
                </Text>
              </View>
            </View>

            <View className="w-full">
              <View className="h-18 w-full px-4 space-y-4">
                {flightOffersResult?.data?.map(renderFlightOffer)}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default SearchResult;
