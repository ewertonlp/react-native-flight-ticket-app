import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
 
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";


const WelcomeScreen = () => {
     const navigation = useNavigation();
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-between pt-32">
      <ImageBackground
        source={require("../assets/images/sky.jpg")}
        className="w-[178px] h-[302] bg-indigo-50 rounded-[110px] items-center justify-center relative"
        imageStyle={{ borderRadius: 110 }}
      >
        <Image
          source={require("../assets/images/airplane.png")}
          className="absolute w-96 h-96 -top-10"
          resizeMode="contain"
        />
      </ImageBackground>
      <Animated.View entering={FadeInDown.duration(300).delay(200).springify()} className="items-center mt-5">
        <Text className="text-4xl font-extrabold text-[#364c97] mb-2">
          Ready To Take Off ?
        </Text>
        <Text className="text-lg text-[#676060]">
          Book and saving made easy
        </Text>
      </Animated.View>

<Animated.View entering={FadeInDown.duration(200).delay(400).springify()}>

      <TouchableOpacity
        className="bg-[#6F86D6] w-[350px] py-4 rounded-xl mt-[110px] mb-[56px] items-center justify-center"
        onPress={() => router.push('/(tabs)')} // ou outra tela
      >
        <Text className="text-white font-semibold text-[1.25rem]">Get started</Text>
      </TouchableOpacity>
</Animated.View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
