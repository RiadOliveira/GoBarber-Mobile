import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import {
    Container,
    Header,
    HeaderTitle,
    UserName,
    ProfileButton,
    UserAvatar,
    ProvidersList,
    ProviderAvatar,
    ProviderContainer,
    ProviderInfo,
    ProviderName,
    ProviderMeta,
    ProviderMetaText,
    ProvidersListTitle,
} from './styles';

export interface Provider {
    id: string;
    name: string;
    avatarUrl: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [providers, setProviders] = useState<Provider[]>([]);
    const navigation = useNavigation();

    useEffect(() => {
        api.get('/providers').then(response => {
            setProviders([...response.data]);
        });
    }, []);

    const navigateToProfile = useCallback(() => {
        navigation.navigate('Profile');
    }, [navigation]);

    const navigateToCreateAppointment = useCallback(
        (providerId: string) => {
            navigation.navigate('CreateAppointment', { providerId });
        },
        [navigation],
    );

    return (
        <Container>
            <Header>
                <HeaderTitle>
                    Bem vindo, {'\n'}
                    <UserName>{user.name}</UserName>
                </HeaderTitle>

                <ProfileButton onPress={navigateToProfile}>
                    <UserAvatar source={{ uri: user.avatarUrl }} />
                </ProfileButton>
            </Header>

            <ProvidersList
                data={providers}
                keyExtractor={provider => provider.id}
                ListHeaderComponent={
                    <ProvidersListTitle>Cabeleireiros</ProvidersListTitle>
                }
                renderItem={({ item: provider }) => (
                    <ProviderContainer
                        onPress={() => {
                            navigateToCreateAppointment(provider.id);
                        }}
                    >
                        <ProviderAvatar source={{ uri: provider.avatarUrl }} />

                        <ProviderInfo>
                            <ProviderName>{provider.name}</ProviderName>

                            <ProviderMeta>
                                <Icon
                                    name="calendar"
                                    size={14}
                                    color="#ff9000"
                                />
                                <ProviderMetaText>
                                    Segunda à sexta
                                </ProviderMetaText>
                            </ProviderMeta>

                            <ProviderMeta>
                                <Icon name="clock" size={14} color="#ff9000" />

                                <ProviderMetaText>8h às 18h</ProviderMetaText>
                            </ProviderMeta>
                        </ProviderInfo>
                    </ProviderContainer>
                )}
            />
        </Container>
    );
};

export default Dashboard;
