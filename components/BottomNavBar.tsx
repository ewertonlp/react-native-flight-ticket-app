// components/BottomNavBar.tsx
import React from "react";
import { View, Pressable } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { 
  MaterialIcons, 
  FontAwesome5, 
} from "@expo/vector-icons";

const BottomNavBar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    
    {
      name: "Buscar",
      icon: (focused: boolean) => (
        <FontAwesome5 
          name="search" 
          size={20} 
          color={focused ? "#495990" : "#A3BDED"} 
        />
      ),
      route: "/"
    },
    {
      name: "Favoritos",
      icon: (focused: boolean) => (
        <MaterialIcons 
          name="favorite" 
          size={24} 
          color={focused ? "#495990" : "#A3BDED"} 
        />
      ),
      route: "/favorites"
    },
    {
      name: "Tickets",
      icon: (focused: boolean) => (
        <MaterialIcons 
          name="airplane-ticket" 
          size={26} 
          color={focused ? "#495990" : "#A3BDED"} 
        />
      ),
      route: "/tickets"
    },
    {
      name: "Perfil",
      icon: (focused: boolean) => (
        <FontAwesome5 
          name="user-alt" 
          size={20} 
          color={focused ? "#495990" : "#A3BDED"} 
        />
      ),
      route: "/perfil"
    }
  ];

  return (
    <View 
      style={{
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#d0dbff',
        paddingTop: 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {navItems.map((item, index) => {
          const isFocused = pathname === item.route;
          
          return (
            <Pressable
              key={index}
              onPress={() => router.push(item.route as any)}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <View style={{ alignItems: 'center' }}>
                {item.icon(isFocused)}
                
                
                {/* Indicador de página ativa */}
                {isFocused && (
                  <View style={{ width: 4, height: 4, backgroundColor: "#495990", borderRadius: 2, marginTop: 4 }} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavBar;