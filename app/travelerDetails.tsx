import { View, Text, Pressable, ScrollView, Alert, TextInput, Platform, Switch, Button, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const formSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phoneNumber: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  birth: z.date().refine(date => date <= new Date(), 'Data de nascimento inválida'),
  gender: z.string().min(1, 'Selecione um gênero'),
  passportNumber: z.string().min(5, 'Número do passaporte inválido'),
  issuanceDate: z.date(),
  expiryDate: z.date(),
  countryCallingCode: z.string().min(1, 'Código do país obrigatório'),
  isPassportHolder: z.boolean(),
}).refine(data => data.expiryDate > data.issuanceDate, {
  message: 'Data de expiração deve ser posterior à data de emissão',
  path: ['expiryDate'],
});

type FormData = z.infer<typeof formSchema>;

export default function TravelerDetails() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryCallingCode: '+55',
      gender: '',
      isPassportHolder: false,
    },
  });

  // Estados para controlar a visibilidade dos DatePickers
  const [showBirthPicker, setShowBirthPicker] = useState(false);
  const [showIssuancePicker, setShowIssuancePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

const onSubmit = async (data: FormData) => {
  setIsLoading(true);
  // Simula processamento
  await new Promise(resolve => setTimeout(resolve, 1500));
  Alert.alert('Success!', 'Your information has been submitted successfully.');
  setIsLoading(false);
};

  // Função para formatar a data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <View className="w-full h-full bg-white">
      <View className="justify-center w-full bg-[#9BB5E9] relative rounded-b-[25px] px-2 pt-16 pb-4">
        <View>
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
                Traveler Details
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
          paddingHorizontal: 16,
        }}
      >
        <View className="flex-1 bg-white w-full pt-8">
            <View className=" p-4 rounded-lg">

           
          {/* Nome Completo */}
          <Text className="text-sm text-slate-500 font-medium mb-2">Full Name</Text>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="w-full rounded-lg border border-[#d0dbff] p-4 mb-4 bg-[#E7F0FD]"
                value={value}
                onChangeText={onChange}
                placeholder="Your Full Name"
              />
            )}
          />
          {errors.fullName && <Text className="text-red-500 text-sm mb-4">{errors.fullName.message}</Text>}

          {/* Email */}
          <Text className="text-sm text-slate-500 font-medium mb-2">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="w-full rounded-lg border border-[#d0dbff] p-4 mb-4 bg-[#E7F0FD]"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                placeholder="your.email@example.com"
              />
            )}
          />
          {errors.email && <Text className="text-red-500 text-sm mb-4">{errors.email.message}</Text>}

          {/* Telefone */}
          <Text className="text-sm text-slate-500 font-medium mb-2">Phone Number</Text>
          <View className="flex-row mb-4">
            <View className="w-1/5 mr-2">
              <Controller
                control={control}
                name="countryCallingCode"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="w-full rounded-lg border border-[#d0dbff] p-4 bg-[#E7F0FD]"
                    value={value}
                    onChangeText={onChange}
                    placeholder="+55"
                    maxLength={5}
                  />
                )}
              />
            </View>
            <View className="w-4/5">
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="w-full rounded-lg border border-[#d0dbff] p-4 bg-[#E7F0FD]"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Phone Number"
                  />
                )}
              />
            </View>
          </View>
          {errors.phoneNumber && <Text className="text-red-500 text-sm mb-4">{errors.phoneNumber.message}</Text>}

          {/* Data de Nascimento */}
          <Text className="text-sm text-slate-500 font-medium mb-2">Date of Birth</Text>
          <Controller
            control={control}
            name="birth"
            render={({ field: { value } }) => (
              <View>
                <Pressable
                  onPress={() => setShowBirthPicker(true)}
                  className="w-full rounded-lg border border-[#d0dbff] p-4 mb-4 bg-[#E7F0FD]"
                >
                  <Text>{value ? formatDate(value) : "Select your birth date"}</Text>
                </Pressable>
                {showBirthPicker && (
                  <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowBirthPicker(false);
                      if (selectedDate) {
                        setValue('birth', selectedDate);
                      }
                    }}
                  />
                )}
              </View>
            )}
          />
          {errors.birth && <Text className="text-red-500 text-sm mb-4">{errors.birth.message}</Text>}

          {/* Gênero */}
          <Text className="text-sm text-slate-500 font-medium mb-2">Gender</Text>
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <View className="border border-[#d0dbff] rounded-lg mb-4 bg-[#E7F0FD]">
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                >
                  <Picker.Item label="Select your gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            )}
          />
          {errors.gender && <Text className="text-red-500 text-sm mb-4">{errors.gender.message}</Text>}

          {/* Número do Passaporte */}
          <Text className="text-sm text-slate-500 font-medium mb-2">Passport Number</Text>
          <Controller
            control={control}
            name="passportNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="w-full rounded-lg border border-[#d0dbff] p-4 mb-4 bg-[#E7F0FD]"
                value={value}
                onChangeText={onChange}
                placeholder="Passport Number"
              />
            )}
          />
          {errors.passportNumber && <Text className="text-red-500 text-sm mb-4">{errors.passportNumber.message}</Text>}

          {/* Data de Emissão */}
          <Text className="text-sm text-slate-500 font-medium mb-2">Issuance Date</Text>
          <Controller
            control={control}
            name="issuanceDate"
            render={({ field: { value } }) => (
              <View>
                <Pressable
                  onPress={() => setShowIssuancePicker(true)}
                  className="w-full rounded-lg border border-[#d0dbff] p-4 mb-4 bg-[#E7F0FD]"
                >
                  <Text>{value ? formatDate(value) : "Select issuance date"}</Text>
                </Pressable>
                {showIssuancePicker && (
                  <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowIssuancePicker(false);
                      if (selectedDate) {
                        setValue('issuanceDate', selectedDate);
                      }
                    }}
                  />
                )}
              </View>
            )}
          />

          {/* Data de Expiração */}
          <Text className="text-sm text-slate-500 font-medium mb-2">Expiry Date</Text>
          <Controller
            control={control}
            name="expiryDate"
            render={({ field: { value } }) => (
              <View>
                <Pressable
                  onPress={() => setShowExpiryPicker(true)}
                  className="w-full rounded-lg border border-[#d0dbff] p-4 mb-4 bg-[#E7F0FD]"
                >
                  <Text>{value ? formatDate(value) : "Select expiry date"}</Text>
                </Pressable>
                {showExpiryPicker && (
                  <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowExpiryPicker(false);
                      if (selectedDate) {
                        setValue('expiryDate', selectedDate);
                      }
                    }}
                  />
                )}
              </View>
            )}
          />
          {errors.expiryDate && <Text className="text-red-500 text-sm mb-4">{errors.expiryDate.message}</Text>}

          {/* Switch de Confirmação */}
          <View className="flex-row items-center justify-between mb-6 py-2 px-4 bg-[#E7F0FD] rounded-lg border border-[#d0dbff]">
            <Text className="text-sm text-slate-500 font-medium">Are you the holder of the passport?</Text>
            <Controller
              control={control}
              name="isPassportHolder"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  style={{}}
                />
              )}
            />
          </View>

          {/* Botão de Envio */}
          <View className="w-full mt-6 mb-8">
  <Pressable
    onPress={handleSubmit(onSubmit)}
    disabled={isLoading}
    className={`
      w-full py-4 rounded-lg 
      ${isLoading 
        ? 'bg-gray-400' 
        : 'bg-[#495990] active:bg-[#5c70b3] active:scale-95'
      }
      transition-all duration-200
    `}
  >
    <View className="flex-row items-center justify-center">
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text className="text-white text-center font-bold text-lg ml-3">
            Processing...
          </Text>
        </>
      ) : (
        <>
          <MaterialIcons name="send" size={20} color="white" />
          <Text className="text-white text-center font-bold text-lg ml-2">
            Submit Traveler Details
          </Text>
        </>
      )}
    </View>
  </Pressable>
</View>
        </View>
         </View>
      </ScrollView>
    </View>
  );
}