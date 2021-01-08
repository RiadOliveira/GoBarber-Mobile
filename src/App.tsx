import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import Routes from './routes';
import AppProvider from './hooks';

const App: React.FC = () => {
    useEffect(() => {
        SplashScreen.hide();
    }, []);

    return (
        <NavigationContainer>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#312e38"
                translucent
            />
            <AppProvider>
                <View style={{ backgroundColor: '#312e38', flex: 1 }}>
                    <Routes />
                </View>
            </AppProvider>
        </NavigationContainer>
    );
};

export default App;
