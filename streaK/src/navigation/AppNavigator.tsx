import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/App/HomeScreen";
import ProfileScreen from "../screens/App/ProfileScreen";

type AppTabs = {
  Home: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabs>();

export default function AppNavigator() {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
