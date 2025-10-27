import { View, Text, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSearchContext } from "@/contexts/SearchContexts";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DepartureDate = () => {
  const { searchData, updateDepartureDate } = useSearchContext();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const loadDepartureDate = async () => {
      try {
        const savedDate = await AsyncStorage.getItem("departureDate");
        if (savedDate) {
          const date = new Date(savedDate);
          setSelectedDate(date);
          updateDepartureDate(date); // Atualiza o context
        }
      } catch (error) {
        console.error("Error loading departure date", error);
      }
    };
    loadDepartureDate();
  }, []);

  const saveDepartureDate = async () => {
    if (!selectedDate) {
      Alert.alert("Warning", "Please select a date first.");
      return;
    }
    try {
      await updateDepartureDate(selectedDate);
      Alert.alert("Success", "Departure date saved successfully");
    } catch (error) {
      console.error("Error saving departure date", error);
    }
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
                  Select Departure Date
                </Text>
              </View>
              <View>
                <Pressable
                  className="h-10 w-10 justify-center items-center"
                  onPress={saveDepartureDate}
                >
                  <Text className="text-white text-md font-semibold">Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Calendar View */}
        <Calendar
          onDayPress={async (day: any) => {
            if (!day?.dateString) return;
            const date = new Date(day.dateString);
            setSelectedDate(date);
            
            try {
              await updateDepartureDate(date);
              await AsyncStorage.setItem("departureDate", date.toISOString().split("T")[0]);
              router.back();
            } catch (error) {
              console.error("Error saving departure date", error);
              Alert.alert("Error", "Could not save the departure date.");
            }
          }}
          markedDates={
            selectedDate
              ? {
                  [selectedDate.toISOString().split("T")[0]]: {
                    selected: true,
                    selectedColor: "#6F86D6",
                    selectedTextColor: "white",
                  },
                }
              : {}
          }
        />
      </View>
    </View>
  );
};

export default DepartureDate;
