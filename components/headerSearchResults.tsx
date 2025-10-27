import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSearchContext } from '@/contexts/SearchContexts';
import { FontAwesome5 } from '@expo/vector-icons';

const HeaderSearchResults = () => {
       const { searchData, flightOfferParams} = useSearchContext();

    console.log("Log em HeaderSearch", searchData)

    const originCity = searchData?.originCity || "Origin"
    const destinationCity = searchData?.destinationCity || "Destination"
    const departureDate = searchData?.departureDate || ""
    const adults = flightOfferParams?.adults || 0

     const formattedDate = departureDate 
        ? new Date(departureDate).toLocaleDateString('en-US') 
        : "Data Indefinida";

    // useEffect(() => {
    //     const fetchSearchFlightData = async () => {
    //         try {
    //             const data = await AsyncStorage.getItem('flightOffer')

    //             if (data !== null) {
    //                 setSearchFlightData(JSON.parse(data))
    //             }
    //         } catch (error) {
    //             console.error("Error", error)
    //         }
    //     }
    //     fetchSearchFlightData()
    // }, [])


  return (
    <>
      {(originCity && destinationCity) && (
        <View className='p-4'>
            <View className='flex-row justify-between items-center w-full mb-2'>
                <View className='flex-col items-start'>
                    <Text className='text-lg text-white font-bold capitalize'>{originCity}</Text>
                </View>
                <View className='flex-col items-start'>
                    <FontAwesome5 name="plane" size={20} color="#fff"/>
                </View>
                <View className='flex-col items-start'>
                    <Text className='text-lg text-white font-bold capitalize'>{destinationCity}</Text>
                </View>
            </View>
            <View className='mt-2 border-t border-slate-50 pt-2 flex-row justify-between'>
                    <View>
                        <Text className='text-sm text-white opacity-80'>When</Text>
                        <Text className='text-base text-white font-semibold'>{formattedDate}</Text>
                    </View>
                    <View>
                        <Text className='text-sm text-white opacity-80'>Seats</Text>
                        <Text className='text-base text-white font-semibold text-right'>{adults}</Text>
                    </View>
                </View>
        </View>
      )

      }
    </>
  )
}

export default HeaderSearchResults