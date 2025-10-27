import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BellIcon } from "react-native-heroicons/solid";

const header = () => {
  return (
    <View className="w-full h-full rounded-b-3xl pt-8 relative">
      {/* Background do mapa */}
      <Image
        source={require("../assets/images/map.png")} 
        className="absolute w-full h-full top-8 left-0 opacity-20"
        resizeMode="cover"
      />

      {/* Linha superior: saudação + avatar */}
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-white text-base">Hello Ewerton,</Text>
          <Text className="text-[#495990] text-[1.25rem] font-bold mt-1">
            Let’s book your next flight
          </Text>
        </View>

        {/* Avatar */}
        <Image
          source={require("../assets/images/avatar.jpg")}
          className="w-[36px] h-[54px] rounded-full border border-white"
        />
      </View>

      {/* Ícone de notificação */}
      <TouchableOpacity className="absolute pt-8 right-16 p-1.5">
        <BellIcon size={30} color="#fff" />
        <View className="absolute top-8 right-2 bg-red-500 w-3 h-3 rounded-full" />
      </TouchableOpacity>
    </View>
  )
}

export default header