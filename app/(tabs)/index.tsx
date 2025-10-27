import {
  ActivityIndicator,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import "../../global.css";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import Header from "@/components/header";
import {
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  Squares2X2Icon,
} from "react-native-heroicons/solid";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useSearchContext } from "@/contexts/SearchContexts";
import axios from "axios";
import { amadeusApi } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SearchFlightData {
  originCity: string;
  destinationCity: string;
  departureDate: string;
  seat: number;
}

export interface FlightOfferData {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: Date;
  returnDate: Date;
  adults: number;
  max: number;
}

interface TripOption {
  id: string;
  label: string;
  Icon: React.ElementType;
}

const tripOptions: TripOption[] = [
  { id: "oneWay", label: "One Way", Icon: ArrowRightIcon },
  { id: "roundTrip", label: "Round Trip", Icon: ArrowsRightLeftIcon },
  { id: "multiCity", label: "Multi City", Icon: Squares2X2Icon },
];

interface TripSelectorProps {
  activeOption: string;
  onChange: (optionId: string) => void;
}

export function TripSelector({ activeOption, onChange }: TripSelectorProps) {
  return (
    <View className="flex-row justify-between w-full px-1 py-3">
      {tripOptions.map(({ id, label, Icon }) => {
        const isActive = id === activeOption;

        // classes fixas e seguras pro tailwind
        const containerClass = isActive ? "bg-orange-200" : "bg-white";
        const textClass = isActive ? "text-orange-800" : "text-gray-600";

        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            className={`flex-1 mx-1 px-2 rounded-lg ${containerClass}`}
          >
            <View className="flex-row items-center justify-center py-2 px-3">
              <Icon
                color={isActive ? "#b8661a" : "#6b7280"}
                style={styles.icon}
              />
              <Text className={`font-semibold ml-1 ${textClass}`}>{label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 18, height: 18 },
});

// Location Component ///////////////////////////////////////////////////////////
interface LocationInputProps {
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onPress: () => void;
}
const LocationInput: React.FC<LocationInputProps> = ({
  placeholder,
  icon,
  value,
  onPress,
}) => (
  <View className="justify-center items-center mx-6 mb-4 border border-gray-300 bg-white rounded-lg">
    <Pressable onPress={onPress}>
      <View className="flex-row justify-between items-center px-4">
        <View className="w-[15%] border-r-2 border-gray-300">{icon}</View>
        <View className="w-[80%] py-3">
          {value ? (
            <Text className="bg-transparent text-gray-600 font-bold">
              {value}
            </Text>
          ) : (
            <Text className="bg-transparent text-lg text-gray-600 font-semibold">
              {placeholder}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  </View>
);

// Departure Date Component ///////////////////////////////////////////////////////
interface DepartureDatetProps {
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onPress: () => void;
}
const DepartureDateInput: React.FC<DepartureDatetProps> = ({
  placeholder,
  icon,
  value,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    className="border border-gray-300 bg-white mx-6 mb-4 rounded-lg justify-center py-3 flex-row items-center pl-4"
  >
    <View className="w-[15%] border-r-2 border-gray-300 px-2">{icon}</View>
    <View className="w-[85%] px-4 items-start justify-start">
      <Text className="bg-transparent text-gray-600 font-bold">
        {value || placeholder}
      </Text>
    </View>
  </Pressable>
);

export default function HomeScreen() {
  const { 
    searchData, // Para exibir (display)
    flightOfferParams, // Para a API (parâmetros)
    setFlightOffersResult, updateAdults // Para salvar o resultado
} = useSearchContext();

  const [isPending, setIsPending] = useState(false);
  const [tripType, setTripType] = useState("oneWay");
  // const [refreshData, setRefreshData] = useState(false);
 
  const [searchFlightData, setSearchFlightData] = useState<SearchFlightData>({
    originCity: "",
    destinationCity: "",
    departureDate: "",
    seat: 0,
  });
  
  const [flightOfferData, setFlightOfferData] = useState<FlightOfferData>({
    originLocationCode: "",
    destinationLocationCode: "",
    departureDate: new Date(),
    returnDate: new Date(),
    adults: 0,
    max: 5,
  });

  const handleParentSearch = async () => {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      max,
    } = flightOfferParams; // Use o estado flightOfferData para os parâmetros da API

    // 1. Validação
    if (
      !originLocationCode ||
      !destinationLocationCode ||
      !departureDate ||
      adults === 0
    ) {
      Alert.alert(
        "Erro",
        "Por favor, preencha todos os campos obrigatórios: Origem, Destino, Data e Assentos."
      );
      return;
    }

    // 2. Formatação da Data (A API Amadeus espera YYYY-MM-DD)
    // Certifica-se que $é$ um objeto Date ou converte a string
    const dateObject =
      typeof departureDate === "string"
        ? new Date(departureDate)
        : departureDate;
    if (isNaN(dateObject.getTime())) {
      Alert.alert("Erro", "Data de partida inválida.");
      return;
    }
    const formattedDepartureDate = dateObject.toISOString().split("T")[0]; // Ex: "2024-10-22"

    setIsPending(true);

    const endpoint = "v2/shopping/flight-offers"; // Endpoint de busca de voo Amadeus
    const params = {
      originLocationCode,
        destinationLocationCode,
        departureDate: formattedDepartureDate,
        adults,
        max,
      // Incluir returnDate (se necessário para 'roundTrip')
      // returnDate: tripType === 'roundTrip' ? formattedReturnDate : undefined
    };

    const stringParams = Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ) as Record<string, string>; // Garante a tipagem correta para URLSearchParams

    // Use o objeto de strings corrigido para o log:
    const queryString = new URLSearchParams(stringParams).toString();

    // ... (resto do log)
    const finalUrl = amadeusApi.defaults.baseURL + endpoint + "?" + queryString;
    console.log("✈️ URL de Requisição Amadeus - TESTE NO HANDLER:", finalUrl);

    try {
      const response = await amadeusApi.get(endpoint, {
        params: params,
      });

      if (response.data) {
        // Navegação e armazenamento de sucesso
        setFlightOffersResult(response.data);

        // NOVO LOG: Visualiza o objeto completo antes de salvar
        
        // await AsyncStorage.setItem(
        //   "searchFlightData",
        //   JSON.stringify(dataToSave)
        // );

        console.log("Flight Ticket Data", response.data);
        router.push({
          pathname: "/searchResult",
          params: {
            flightOfferData: JSON.stringify(response.data),
          },
        });
      }
    } catch (error: any) {
      console.error("Error fetching flights offers", error);

      // Trata erros de requisição (AxiosError)
      const status = error.response ? error.response.status : null;
      const errorMessage =
        error.response?.data?.errors?.[0]?.detail ||
        "An unexpected error occurred.";

      if (status === 401) {
        Alert.alert(
          "API Key Expirada",
          "Por favor, atualize seu token de acesso.",
          [{ text: "Ok" }]
        );
      } else if (status === 400) {
        // Mensagem de erro mais específica para 400 (Bad Request)
        Alert.alert(
          "Erro de Requisição (400)",
          `Verifique os parâmetros: ${errorMessage}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao buscar ofertas de voo.", [
          { text: "OK" },
        ]);
      }
    } finally {
      setIsPending(false);
    }
  };

  const originDisplayValue = searchData.originCity
    ? `${searchData.originCity} (${flightOfferParams.originLocationCode})`
    : "";

  return (
    <View className="flex-1 items-center bg-[#f5f7fa] relative">
      <StatusBar style="light" />

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
      <View className="h-72 mb-4 justify-start border-orange-600 w-full bg-[#9BB5E9] relative rounded-b-[25px] px-6 pt-8">
        <Header />
      </View>

      {/* Form Area */}
      <View className="w-full px-4 -mt-32 mx-4">
        <View
          className="rounded-2xl  bg-[#E7F0FD]  pt-2 pb-4 shadow-md shadow-slate-5]
        00 "
        >
          <View className="flex-row justify-between w-full px-4 py-2">
            <TripSelector activeOption={tripType} onChange={setTripType} />
          </View>

          {/* Origin City */}
          <Link href="/departure" asChild>
            <LocationInput
              placeholder={"Departure City"}
              icon={
                <FontAwesome5 size={18} color="gray" name="plane-departure" />
              }
              value={originDisplayValue}
              onPress={() => {}}
            />
          </Link>
          {/* Destination City */}
          <Link href="/destination" asChild>
            <LocationInput
              placeholder={"Destination City"}
              icon={
                <FontAwesome5 size={18} color="gray" name="plane-arrival" />
              }
              value={searchData.destinationCity}
              onPress={() => {}}
            />
          </Link>
          {/* Departure Date */}
          <Link href="/departureDate" asChild>
            <DepartureDateInput
              placeholder={"Departure Date"}
              icon={<FontAwesome5 size={20} color="gray" name="calendar-alt" />}
              value={
                searchData.departureDate
                  ? // Se for Date, converta para YYYY-MM-DD
                    typeof searchData.departureDate === "string"
                    ? searchData.departureDate
                    : searchData.departureDate.toISOString().split("T")[0]
                  : ""
              }
              onPress={() => {}}
            />
          </Link>
          {/* Seats */}
          <View className=" mx-6 py-[3px] pl-3 flex-row justify-center items-center border border-gray-300 bg-white rounded-lg">
            <View className="border-r-2 border-gray-300 px-4">
              <MaterialCommunityIcons
                size={24}
                color="gray"
                name="seat-passenger"
              />
            </View>
            <TextInput
              className="w-[85%] px-4 text-base font-semibold"
              placeholder="Seats"
              keyboardType="numeric"
              value={
                searchFlightData.seat > 0 ? String(searchFlightData.seat) : ""
              }
              onChangeText={(text) => {
                // 1. Remove caracteres não-numéricos (garantindo que $s\acute{\text{o}}$ $h\acute{\text{a}}$ $d\acute{\text{i}}$gitos)
                const numericText = text.replace(/[^0-9]/g, "");

                // 2. Tenta converter para número
                const seatValue = parseInt(numericText, 10);

                // 3. Define o valor final como 0 se o input estiver vazio, caso contrário, usa o valor numérico.
                const finalSeatValue = numericText === "" ? 0 : seatValue;

                // 4. Atualiza o estado local de exibição
                setSearchFlightData((prev) => ({
                  ...prev,
                  seat: finalSeatValue,
                }));

                // 5. Atualiza o Contexto (`flightOffer.adults`) para uso na API
                updateAdults(finalSeatValue); // <-- ESSENCIAL PARA O CONTEXTO

                // 6. O `setFlightOfferData` local $n\tilde{\text{a}}o$ $é$ mais $n$ecessário, pois a função de busca usar$á$ o Contexto.
              }}
            />
          </View>

          {/* Search Button */}
          <View className="w-full justify-center pt-4 mx-auto px-6">
            <Pressable
              className="bg-[#6F86D6] rounded-lg justify-center items-center py-3"
              onPress={handleParentSearch}
            >
              <Text className="text-white font-bold text-lg">
                Search Flights
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
