import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo, AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from "@/components/useColorScheme";
import useUser from '@/hooks/useUser';
import Search from './search'; 
import HomeStack from '../navigators/Navigators';
import ChronologyScreen from '../LandingPage/ChronologyScreen';
import StatisticsScreen from './statistics'
import ProfileScreen from './profile';
import MyShelfScreen from './myshelf';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const { user, session, loading } = useUser();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if ((session && !session.access_token) || (!loading && !session)) {    
    }
  }, [session, loading]);

  return (
    <NavigationContainer independent>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => <Entypo name="home" size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name='Search'       
          component={Search} 
          options={{
            // tabBarButton:()=> null,
          headerShown:false,
          tabBarIcon: ({ color }) => <AntDesign name="search1" size={22} color={color} />,
          }}
        />
        <Tab.Screen name='chronology' component={ChronologyScreen} options={{
          headerShown: false,
          tabBarIcon: ({ color }) => null,
          tabBarButton: () => null,
        }}/>
            <Tab.Screen
        name="myshelf"
        component={MyShelfScreen}
        options={{
          title: "MyShelf",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bookshelf" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="statistics"
        component={StatisticsScreen}
        options={{
          title: "Statistics",
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart-sharp" size={24} color="black" />
          ),
          // tabBarButton: () => null,
        }}
      /><Tab.Screen
      name="profile"
      component={ProfileScreen}
      options={{
        title: "Profile",
        tabBarIcon: ({ color }) => (
          <Ionicons name="person-circle" size={24} color="black" />
        ),
        // tabBarButton: () => null,
      }}
    />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
