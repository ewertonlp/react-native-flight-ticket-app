import { View, Text, Pressable, ScrollView } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";

// ✈️ Nome das companhias aéreas
const airlineNames: Record<string, string> = {
  UX: "Air Europa",
  IB: "Iberia",
  LH: "Lufthansa",
  AF: "Air France",
  BA: "British Airways",
  KL: "KLM Royal Dutch Airlines",
  AZ: "ITA Airways",
  TP: "TAP Air Portugal",
  LX: "SWISS",
  EK: "Emirates",
  QR: "Qatar Airways",
  TK: "Turkish Airlines",
  AA: "American Airlines",
  DL: "Delta Air Lines",
  UA: "United Airlines",
  G3: "GOL Linhas Aéreas",
  LA: "LATAM Airlines",
  AD: "Azul Linhas Aéreas",
  TG: "Thai Airways",
  MU: "China Eastern",
};

// 🛩️ Mapeamento de códigos de aeronaves
const getAircraftName = (code: string): string => {
  const aircraftMap: Record<string, string> = {
    "320": "Airbus A320",
    "321": "Airbus A321",
    "77W": "Boeing 777-300ER",
    "738": "Boeing 737-800",
    "788": "Boeing 787-8 Dreamliner",
    "789": "Boeing 787-9 Dreamliner",
    E90: "Embraer 190",
    E95: "Embraer 195",
    "7M8": "Boeing 737-MAX 8",
    "73L": "Boeing 737",
  };
  return aircraftMap[code] || "Aeronave desconhecida";
};

// 🕒 Formata duração do voo (ex: PT9H45M → 9h 45min)
const formatDuration = (duration: string | undefined): string => {
  if (!duration) return "N/A";

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);

  if (!match) return "N/A";

  const hours = match[1] ? match[1] : "0";
  const minutes = match[2] ? match[2] : "0";

  return `${hours}h ${minutes}m`;
};

const FlightDetails = () => {
  const params = useLocalSearchParams<any>();
  console.log("📦 Parâmetros recebidos em FlightDetails:", params);

  // Captura o parâmetro corretamente
  const flightOfferParam = params.flightOfferData || null;

  let parsedFlightOffer: any = {};
  try {
    if (typeof flightOfferParam === "string") {
      parsedFlightOffer = JSON.parse(flightOfferParam);
    } else if (
      typeof flightOfferParam === "object" &&
      flightOfferParam !== null
    ) {
      parsedFlightOffer = flightOfferParam;
    }
  } catch (error) {
    console.error("❌ Erro ao parsear flightOfferData:", error);
  }

  console.log("🔍 Dados parseados:", parsedFlightOffer);

  // Acessa os dados de forma mais segura
  const offers = parsedFlightOffer?.data || [];
  const firstOffer = offers[0] || {};
  const itineraries = firstOffer?.itineraries || [];
  const firstItinerary = itineraries[0] || {};
  const segments = firstItinerary?.segments || [];

  console.log("✈️ Segmentos encontrados:", segments);

  // Se não há segmentos, mostra mensagem de erro
  if (segments.length === 0) {
    return (
      <View className="flex-1 items-center bg-[#f5f7fa] relative">
        <View className="w-full h-full">
          {/* Header */}
          <View className="justify-start w-full bg-[#9BB5E9] relative rounded-b-[25px] px-6 pt-16 pb-8">
            <View className="flex-row gap-4 justify-between items-center px-1">
              <Pressable
                onPress={() => router.back()}
                className="flex-row items-center justify-start h-10 w-[10%]"
              >
                <View className="rounded-full h-10 w-10 justify-center items-center">
                  <MaterialIcons
                    name="keyboard-arrow-left"
                    size={30}
                    color="#fff"
                  />
                </View>
              </Pressable>

              <View className="w-[60%] justify-center items-center flex-row">
                <Text className="text-lg text-white font-extrabold">
                  Flight Details
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

          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-500">
              Nenhum dado de voo disponível
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const firstSegment = segments[0] || {};
  const lastSegment = segments[segments.length - 1] || {};
  const price = firstOffer?.price || {};

  const fareDetailsBySegment =
    firstOffer?.travelerPricings?.[0]?.fareDetailsBySegment || [];

  // 🔹 CORREÇÃO: Calcular duração total do voo
  const calculateTotalDuration = (): string => {
    if (!segments.length) return "N/A";

    const firstDeparture = new Date(segments[0]?.departure?.at);
    const lastArrival = new Date(segments[segments.length - 1]?.arrival?.at);

    if (isNaN(firstDeparture.getTime()) || isNaN(lastArrival.getTime())) {
      return "N/A";
    }

    const totalMs = lastArrival.getTime() - firstDeparture.getTime();
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const flightDuration = calculateTotalDuration();

  // 🔹 Formatadores de data/hora
  const formatDate = (timestamp: string) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
        weekday: "long",
      });
    } catch (error) {
      return "";
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    try {
      return new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  const calculateLayoverTime = (
    currentSegment: any,
    nextSegment: any
  ): string => {
    if (!currentSegment || !nextSegment) return "N/A";

    try {
      const currentArrival = new Date(currentSegment.arrival?.at);
      const nextDeparture = new Date(nextSegment.departure?.at);

      if (isNaN(currentArrival.getTime()) || isNaN(nextDeparture.getTime())) {
        return "N/A";
      }

      const layoverMs = nextDeparture.getTime() - currentArrival.getTime();
      const hours = Math.floor(layoverMs / (1000 * 60 * 60));
      const minutes = Math.floor((layoverMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours === 0 && minutes === 0) return "Sem escala";

      return `${hours}h ${minutes}m`;
    } catch (error) {
      return "N/A";
    }
  };

  // No seu componente FlightDetails, após parsear os dados:

  // Acessa o dicionário de localizações
  const locations = parsedFlightOffer?.dictionaries?.locations || {};

  console.log("🏙️ Dicionário de localizações:", locations);

  // Função para obter o nome da cidade a partir do código do aeroporto
  const getCityName = (iataCode: string): string => {
    if (!iataCode) return "N/A";

    const location = locations[iataCode];
    console.log(`🔍 Buscando cidade para ${iataCode}:`, location);

    if (location) {
      // A estrutura pode variar, tente diferentes propriedades
      return (
        location.cityName || location.cityCode || location.name || iataCode
      );
    }

    return iataCode; // Fallback para o código se não encontrar
  };

  // Função para obter o nome completo do aeroporto
  const getAirportName = (iataCode: string): string => {
    if (!iataCode) return "N/A";

    const location = locations[iataCode];
    if (location) {
      return location.name || iataCode;
    }

    return iataCode;
  };

  // 🔹 Função para renderizar cada segmento
  const renderSegment = (segment: any, index: number) => {
    const segmentCarrierCode = segment.carrierCode;
    const segmentAirlineName =
      airlineNames[segmentCarrierCode] || segmentCarrierCode;
    const segmentFlightNumber = `${segmentCarrierCode}${segment?.number || ""}`;
    const aircraftCode = segment?.aircraft?.code || "";
    const aircraftName = getAircraftName(aircraftCode);

    // Busca a classe específica deste segmento
    const segmentFareDetail = fareDetailsBySegment[index] || {};
    const segmentCabinClass = segmentFareDetail.cabin || "N/A";
    const segmentDuration = formatDuration(segment.duration);

    return (
      <View key={index} className="mb-4">
        {/* Header do segmento */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-slate-600 font-semibold text-sm">
            Segment {index + 1} • {segmentDuration}
          </Text>
        </View>

        {/* Card do segmento - MANTENDO SEU LAYOUT ORIGINAL */}
        <View
          className="flex-row justify-between items-start  rounded-lg p-4 "
          style={{
            marginTop: 6,
            padding: 10,
            backgroundColor: "#E7F0FD", // orange-50
            borderRadius: 6,
            borderWidth: 1,
            borderColor: "#d0dbff", // orange-200
          }}
        >
          <View className="w-3/4 flex-row justify-between">
            <View
              className="justify-between items-end mr-2"
              style={{ minHeight: 120 }}
            >
              <Text className="text-slate-500 font-extrabold text-sm capitalize">
                {formatDate(segment.departure?.at)}
              </Text>
              <Text className="text-slate-500 font-extrabold text-sm capitalize">
                {formatDate(segment.arrival?.at)}
              </Text>
            </View>

            <View className="flex-col justify-center items-center mx-1">
              <Octicons name="dot-fill" size={20} color="#ff8859" />
              <View
                className="border-l-2 border-[#ff8859] flex-1"
                style={{ minHeight: 40 }}
              />
              <Octicons name="dot" size={20} color="#ff8859" />
            </View>

            <View
              className="flex-1 justify-between ml-2"
              style={{ minHeight: 120 }}
            >
              <View>
                <Text className="font-extrabold text-base text-slate-800">
                  {formatTime(segment.departure?.at)}
                </Text>
                <Text className="font-medium text-sm text-slate-500">
                  {segment.departure?.iataCode} Airport{" "}
                  {segment.departure?.city}
                </Text>
              </View>

              <View className="py-4">
                <Text className="text-slate-700 font-semibold text-sm">
                  {segmentAirlineName} {segmentFlightNumber}
                </Text>
                <Text className="text-slate-700 text-sm">
                  <MaterialIcons
                    name="flight-class"
                    size={14}
                    color="#495990"
                  />{" "}
                  {segmentCabinClass}
                </Text>
                <Text className="text-slate-700 text-sm">
                  <FontAwesome5 name="plane" size={12} color="#495990" />{" "}
                  {aircraftName} ({aircraftCode})
                </Text>
              </View>

              <View>
                <Text className="font-extrabold text-base text-slate-800">
                  {formatTime(segment.arrival?.at)}
                </Text>
                <Text className="font-medium text-sm text-slate-500">
                  {segment.arrival?.iataCode} Airport
                </Text>
              </View>
            </View>
          </View>

          <View className="w-1/4 justify-start items-end">
            <Text className="text-slate-500 text-sm text-right">
              ⏱️ {segmentDuration}
            </Text>
          </View>
        </View>

        {/* Tempo de escala (se houver próximo segmento) */}
        {index < segments.length - 1 && (
          <View
            style={{
              marginTop: 8,
              padding: 6,
              backgroundColor: "#fff7ed",
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#fed7aa",
            }}
          >
            <Text
              style={{
                color: "#ea580c",
                fontSize: 14,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              ⏰ Connection time:{" "}
              {calculateLayoverTime(segment, segments[index + 1])}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 items-center bg-[#f5f7fa] relative">
      <View className="w-full h-full">
        {/* Header */}
        <View className="justify-start w-full bg-[#9BB5E9] relative rounded-b-[25px]  pt-16 pb-8">
          <View className="flex-row gap-4 justify-between items-center px-1">
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center justify-start h-10 w-[10%]"
            >
              <View className="rounded-full h-10 w-10 justify-center items-center">
                <MaterialIcons
                  name="keyboard-arrow-left"
                  size={30}
                  color="#fff"
                />
              </View>
            </Pressable>

            <View className="w-[60%] justify-center items-center flex-row">
              <Text className="text-lg text-white font-extrabold">
                Flight Details
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

        {/* Conteúdo */}
        <ScrollView
          className="w-full h-full"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
        >
          <View className="px-4 pt-4 w-full">
            <View className="flex-row justify-between items-center mb-4">
              {firstSegment.departure && lastSegment.arrival ? (
                <View className="flex">
                  <View className="flex-row">
                    <Text className="text-lg font-semibold">
                      {firstSegment.departure?.iataCode} {"- "}
                    </Text>
                    <Text className="text-lg font-semibold">
                      {lastSegment.arrival?.iataCode}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-slate-500 text-sm">
                      {segments.length} segment(s)
                    </Text>
                  </View>
                </View>
              ) : (
                <Text className="text-gray-500 text-center">
                  Flight details unavailable.
                </Text>
              )}
              <View>
                <Text className="text-blue-600">Fare Rules</Text>
              </View>
            </View>

            {/* Lista de segmentos */}
            <View className="mt-4">
              {segments.map((segment: any, index: number) =>
                renderSegment(segment, index)
              )}
            </View>

            {/* Resumo do voo */}
            {price?.total && (
              <View
                className="mb-6 p-4 bg-[#E7F0FD] rounded-lg"
                style={{ borderWidth: 1, borderColor: "#d0dbff" }}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-slate-700 font-semibold">
                      Journey duration: {flightDuration}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xl text-slate-800 font-bold">
                      {price.total} {price.currency || ""}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View className="flex-row w-full justify-end">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/travelerDetails",
                    params: {
                      flightOfferData: JSON.stringify(parsedFlightOffer),
                    },
                  })
                }
                className="bg-[#495990] rounded-lg px-8 py-4 items-center justify-center gap-1"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-bold text-white">
                    Continue Booking
                  </Text>
                  <FontAwesome5 name="arrow-right" size={16} color="white" />
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default FlightDetails;
