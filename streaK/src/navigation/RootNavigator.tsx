import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/Spinner";

export default function RootNavigator() {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;

    return <NavigationContainer>{user ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
}
