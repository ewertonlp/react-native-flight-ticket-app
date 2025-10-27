import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- 1. Tipos de Dados ---
interface SearchData {
  // Dados de Display (Nomes das Cidades)
  originCity: string;
  destinationCity: string;
  // 💡 CORREÇÃO: Adicionando a data para fins de exibição
  departureDate: string; 
}

interface FlightOfferParams {
  // Parâmetros para a API (Códigos IATA, Data, Assentos, etc.)
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string; // YYYY-MM-DD
  adults: number;
  max: number; 
}

interface SearchContextType {
  searchData: SearchData;
  flightOfferParams: FlightOfferParams;
  flightOffersResult: any;
  
  // Funções de atualização
  updateOrigin: (city: string, iataCode: string) => void;
  updateDestination: (city: string, iataCode: string) => void;
  updateDepartureDate: (date: Date) => void;
  updateAdults: (count: number) => void;
  setFlightOffersResult: (result: any) => void;
}

// --- 2. Valores Iniciais ---
const initialSearchData: SearchData = {
  originCity: "City",
  destinationCity: "City",
  // 💡 CORREÇÃO: Valor inicial para a data de exibição
  departureDate: "", 
};

const initialFlightOfferParams: FlightOfferParams = {
  originLocationCode: "",
  destinationLocationCode: "",
  departureDate: "",
  adults: 1,
  max: 10,
};

// --- 3. Criação do Contexto ---
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// --- 4. Criação do Provider ---
interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchData, setSearchData] = useState<SearchData>(initialSearchData);
  const [flightOfferParams, setFlightOfferParams] = useState<FlightOfferParams>(initialFlightOfferParams);
  const [flightOffersResult, setFlightOffersResult] = useState<any>(null); 

  // --- Funções de Atualização (SETTERS) ---

  const updateOrigin = (city: string, iataCode: string) => {
    setSearchData(prev => ({ ...prev, originCity: city }));
    setFlightOfferParams(prev => ({ ...prev, originLocationCode: iataCode }));
  };

  const updateDestination = (city: string, iataCode: string) => {
    setSearchData(prev => ({ ...prev, destinationCity: city }));
    setFlightOfferParams(prev => ({ ...prev, destinationLocationCode: iataCode }));
  };

  const updateDepartureDate = (date: Date) => {
    // Garante que apenas a string YYYY-MM-DD seja salva nos parâmetros da API
    const dateString = date.toISOString().split("T")[0];

    // Atualiza o estado de display (AGORA COM departureDate definido)
    setSearchData(prev => ({ ...prev, departureDate: dateString }));
    // Atualiza o estado de parâmetros da API
    setFlightOfferParams(prev => ({ ...prev, departureDate: dateString }));
  };
  
  const updateAdults = (count: number) => {
    setFlightOfferParams(prev => ({ ...prev, adults: count }));
  }

  // --- Efeitos de Persistência ---

  useEffect(() => {
    const loadLastSearch = async () => {
      try {
        const storedData = await AsyncStorage.getItem('@lastSearchData');
        if (storedData) {
          const { searchData: storedSearchData, flightOfferParams: storedFlightOfferParams } = JSON.parse(storedData);
          setSearchData(storedSearchData);
          setFlightOfferParams(storedFlightOfferParams);
        }
      } catch (error) {
         console.error("Error loading last search data:", error);
      }
    };
    loadLastSearch();
  }, []);

  useEffect(() => {
    if (flightOfferParams.originLocationCode || flightOfferParams.destinationLocationCode) {
        AsyncStorage.setItem(
            '@lastSearchData', 
            JSON.stringify({ searchData, flightOfferParams })
        );
    }
  }, [searchData, flightOfferParams]);
  

  // --- Retorno do Provider ---
  return (
    <SearchContext.Provider
      value={{
        searchData,
        flightOfferParams,
        flightOffersResult,
        updateOrigin,
        updateDestination,
        updateDepartureDate,
        updateAdults,
        setFlightOffersResult
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// --- 5. Criação do Hook Customizado para Consumir o Contexto ---
export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};