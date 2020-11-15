import React, {
    createContext,
    useCallback,
    useState,
    useContext,
    useEffect,
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

interface AuthState {
    token: string;
    user: object;
}

interface Request {
    email: string;
    password: string;
}

interface AuthContextData {
    user: object;
    signIn(credentials: Request): Promise<void>;
    signOut(): void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
    const [data, setData] = useState<AuthState>({} as AuthState);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStoragedData(): Promise<void> {
            // const token = await AsyncStorage.getItem('@GoBarber:token');
            // const user = await AsyncStorage.getItem('@GoBarber:user');

            const [token, user] = await AsyncStorage.multiGet([
                '@GoBarber:token',
                '@GoBarber:user',
            ]);

            if (token[1] && user[1]) {
                setData({ token: token[1], user: JSON.parse(user[1]) });
            }
            setLoading(false);
        }

        loadStoragedData();
    });

    const signIn = useCallback(async ({ email, password }: Request) => {
        const response = await api.post('/sessions', { email, password });

        const { token, user } = response.data;

        // await AsyncStorage.setItem('@GoBarber:token', token);
        // await AsyncStorage.setItem('@GoBarber:user', JSON.stringify(user));

        await AsyncStorage.multiSet([
            ['@GoBarber:token', token],
            ['@GoBarber:user', JSON.stringify(user)],
        ]);

        setData({ token, user });
    }, []);

    const signOut = useCallback(async () => {
        // await AsyncStorage.clear()

        // await AsyncStorage.removeItem('@GoBarber:token');
        // await AsyncStorage.removeItem('@GoBarber:user');

        await AsyncStorage.multiRemove(['@GoBarber:token', '@GoBarber:user']);

        setData({} as AuthState);
    }, []);

    return (
        <AuthContext.Provider
            value={{ user: data.user, signIn, signOut, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth(): AuthContextData {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
