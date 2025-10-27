import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { amadeusApi } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CityItem } from "@/Types/cityType";
import { useSearchContext } from "@/contexts/SearchContexts";

// const clearDestinationCities = async () => {
//   try {
//     await AsyncStorage.removeItem('destinationCities');
//     console.log('✅ destinationCities removido!');
//   } catch (error) {
//     console.error('Erro ao remover destinationCities:', error);
//   }
// };


const DestinationScreen = () => {
  const [searchInput, setSearchInput] = useState("");
  const [autoCompleteResults, setAutoCompleteResults] = useState<CityItem[]>([]);
  // const [flightOfferData, setFlightOfferData] = useState<any>({
  //   desinationLocationCode: "",
  // });
 const [previousSelectedDestination, setPreviousSelectedDestination] = useState<
  { city: string; iataCode: string }[]
>([]);
const { updateDestination } = useSearchContext();

  const loadPreviousSelectedCities = async () => {
  try {
    const cities = await AsyncStorage.getItem("departureCities");
    if (cities !== null) {
      const parsed = JSON.parse(cities);
      if (Array.isArray(parsed)) {
        setPreviousSelectedDestination(parsed);
      }
    }
  } catch (error) {
    console.error("Error loading previous selected cities", error);
  }
};

  useEffect(() => {
    // clearDestinationCities()
    loadPreviousSelectedCities();
  }, []);

  const debounce = (func: any, delay: number) => {
    let timeoutId;
    return function (...args: any) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const autoCompleteSearch = async (searchInput: string) => {
    if (!searchInput || searchInput.length < 3) {
    setAutoCompleteResults([]);
    return;
  }
    try {
      // CORREÇÃO: Não precisa montar headers aqui, o interceptor do amadeusApi faz isso.
      const url = `v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${searchInput}`;

      // CORREÇÃO: Use a instância amadeusApi
      console.log("LOG: Enviando requisição para:", url);
      const response = await amadeusApi.get(url);

      console.log("LOG: Dados recebidos. Quantidade:", response.data.data.length);

      setAutoCompleteResults(response.data.data);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.error(
          "Limite de taxa Amadeus excedido. Tente novamente em um minuto."
        );
      } else {
        console.error(error);
      }
    }
  };

  const debounceSearch = debounce(autoCompleteSearch, 500);

  const handleInputChange = (value: string) => {
    setSearchInput(value);
    debounceSearch(value);
  };

  const handleSelectAutoComplete = async (item: CityItem) => {
    const newCity = {
      city: item.name,
      iataCode: item.iataCode,
    };

    updateDestination(newCity.city, newCity.iataCode);

    const updatedCities = [...previousSelectedDestination, newCity];

    await AsyncStorage.setItem(
      "destinationCities",
      JSON.stringify(updatedCities)
    );
    setPreviousSelectedDestination(updatedCities);

    setSearchInput(`${item.name} (${item.iataCode})`);
    setAutoCompleteResults([]);
    router.back()
  };


  return (
    <View className="flex-1 items-center bg-[#f5f7fa]">
      <View className="w-full h-full">
        <View className="justify-start w-full bg-[#9BB5E9] relative rounded-b-[25px] px-6 pt-16 pb-8">
          <View>
            {/* Header */}
            <View className="flex-row gap-4 justify-between items-center px-1">
              <Pressable
                onPress={() => router.back()}
                className="flex-row items-center justify-start h-10 w-[10%]"
              >
                <View className="rounded-full bg-white h-10 w-10 justify-center items-center">
                  <MaterialIcons
                    name="keyboard-arrow-left"
                    size={30}
                    color="#9BB5E9"
                  />
                </View>
              </Pressable>

              <View className="w-[60%] justify-center items-center flex-row">
                <Text className="text-lg text-white font-extrabold">
                  Select Destination
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
          </View>

          {/* Airport or City Search */}
        </View>
        <View className="w-full py-4 px-4 relative">
          <View className="flex-row justify-between items-center bg-white border border-gray-300 rounded-xl h-14 overflow-hidden">
            <View className="w-full h-full justify-center">
              <TextInput
                placeholder="Search for airport or city"
                placeholderTextColor={"gray"}
                value={searchInput}
                onChangeText={handleInputChange}
                className="bg-transparent text-gray-600 h-full px-2 capitalize"
              />
            </View>
          </View>

          {autoCompleteResults.length > 0 && (
            <View className="border border-gray-400 bg-white rounded-lg shadow-sm mt-4">
              <FlatList
                data={autoCompleteResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelectAutoComplete(item)}
                    className="px-2 py-2 rounded-xl my-1"
                  >
                    <Text className="text-gray-500 capitalize">
                      {item.name} ({item.iataCode})
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* Previous Selected Cities */}
          <View className="px-3 w-full">
            <Text className="text-gray-500 text-lg font-semibold mt-4">
              Previous Selected
            </Text>
            {previousSelectedDestination.map((city, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  updateDestination(city.city, city.iataCode);

                  setSearchInput(`${city.city} (${city.iataCode})`);
                  router.back()
                }}
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 mt-4"
              >
                <Text className="text-gray-500 capitalize">
                  {city.city} ({city.iataCode})
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default DestinationScreen;
