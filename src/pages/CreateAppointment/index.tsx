import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import {
    Container,
    Header,
    BackButton,
    HeaderTitle,
    UserAvatar,
    Content,
    ProvidersList,
    ProviderContainer,
    ProviderAvatar,
    ProviderName,
    ProvidersListContainer,
    Calendar,
    Title,
    OpenDatePickerButton,
    OpenDatePickerButtonText,
    Schedule,
    Section,
    SectionTitle,
    SectionContent,
    Hour,
    HourText,
    CreateAppointmentButton,
    CreateAppointmentButtonText,
} from './styles';

interface RouteParams {
    providerId: string;
}

export interface Provider {
    id: string;
    name: string;
    avatarUrl: string;
}

interface AvailabilityItem {
    hour: number;
    available: boolean;
}

const CreateAppointment: React.FC = () => {
    const route = useRoute();
    const { user } = useAuth();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [providers, setProviders] = useState<Provider[]>([]);
    const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
    const [selectedHour, setSelectedHour] = useState(0);

    const routeParams = route.params as RouteParams;

    const [selectedProvider, setSelectedProvider] = useState(
        routeParams.providerId,
    );
    const { goBack, navigate } = useNavigation();

    useEffect(() => {
        api.get('/providers').then(response => {
            setProviders([...response.data]);
        });
    }, []);

    useEffect(() => {
        api.get(`/providers/${selectedProvider}/day-availability`, {
            params: {
                day: selectedDate.getDate(),
                month: selectedDate.getMonth() + 1,
                year: selectedDate.getFullYear(),
            },
        }).then(response => {
            setAvailability(response.data);
        });
    }, [selectedDate, selectedProvider]);

    const handleSelectProvider = useCallback((providerId: string) => {
        setSelectedProvider(providerId);
    }, []);

    const navigateBack = useCallback(() => {
        goBack();
    }, [goBack]);

    const handleToggleDatePicker = useCallback(() => {
        setShowDatePicker(state => !state);
    }, []);

    const handleDateChange = useCallback((event, date: Date | undefined) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (date) {
            setSelectedDate(date);
        }
    }, []);

    const morningAvailability = useMemo(() => {
        return availability
            .filter(({ hour }) => hour < 12)
            .map(({ hour, available }) => {
                return {
                    hour,
                    available,
                    hourFormatted: format(new Date().setHours(hour), 'HH:00'),
                };
            });
    }, [availability]);

    const afternoonAvailability = useMemo(() => {
        return availability
            .filter(({ hour }) => hour >= 12)
            .map(({ hour, available }) => {
                return {
                    hour,
                    available,
                    hourFormatted: format(new Date().setHours(hour), 'HH:00'),
                };
            });
    }, [availability]);

    const handleSelectHour = useCallback((hour: number) => {
        setSelectedHour(hour);
    }, []);

    const handleCreateAppointment = useCallback(async () => {
        try {
            const date = new Date(selectedDate);

            date.setHours(selectedHour);
            date.setMinutes(0);

            await api.post('/appointments', {
                providerId: selectedProvider,
                date,
            });

            navigate('AppointmentCreated', { date: date.getTime() });
        } catch {
            Alert.alert(
                'Erro ao criar agendamento',
                'Ocorreu um erro ao tentar criar o agendamento, tente novamente.',
            );
        }
    }, [navigate, selectedDate, selectedHour, selectedProvider]);

    return (
        <Container>
            <Header>
                <BackButton onPress={navigateBack}>
                    <Icon name="chevron-left" size={24} color="#999591" />
                </BackButton>

                <HeaderTitle>Cabeleireiros</HeaderTitle>

                <UserAvatar source={{ uri: user.avatarUrl }} />
            </Header>

            <Content>
                <ProvidersListContainer>
                    <ProvidersList
                        data={providers}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={provider => provider.id}
                        renderItem={({ item: provider }) => (
                            <ProviderContainer
                                onPress={() => {
                                    handleSelectProvider(provider.id);
                                }}
                                selected={provider.id === selectedProvider}
                            >
                                <ProviderAvatar
                                    source={{ uri: provider.avatarUrl }}
                                />
                                <ProviderName
                                    selected={provider.id === selectedProvider}
                                >
                                    {provider.name}
                                </ProviderName>
                            </ProviderContainer>
                        )}
                    />
                </ProvidersListContainer>

                <Calendar>
                    <Title>Escolha a data</Title>

                    <OpenDatePickerButton onPress={handleToggleDatePicker}>
                        <OpenDatePickerButtonText>
                            Selecionar outra data
                        </OpenDatePickerButtonText>
                    </OpenDatePickerButton>
                    {showDatePicker && (
                        <DateTimePicker
                            display="calendar"
                            onChange={handleDateChange}
                            mode="date"
                            value={selectedDate}
                        />
                    )}
                </Calendar>

                <Schedule>
                    <Title>Escolha o horário</Title>

                    <Section>
                        <SectionTitle>Manhã</SectionTitle>

                        <SectionContent>
                            {morningAvailability.map(
                                ({ hour, hourFormatted, available }) => (
                                    <Hour
                                        enabled={available}
                                        selected={selectedHour === hour}
                                        onPress={() => {
                                            handleSelectHour(hour);
                                        }}
                                        available={available}
                                        key={hourFormatted}
                                    >
                                        <HourText
                                            selected={selectedHour === hour}
                                        >
                                            {hourFormatted}
                                        </HourText>
                                    </Hour>
                                ),
                            )}
                        </SectionContent>
                    </Section>

                    <Section>
                        <SectionTitle>Tarde</SectionTitle>

                        <SectionContent>
                            {afternoonAvailability.map(
                                ({ hour, hourFormatted, available }) => (
                                    <Hour
                                        enabled={available}
                                        selected={selectedHour === hour}
                                        onPress={() => {
                                            handleSelectHour(hour);
                                        }}
                                        available={available}
                                        key={hourFormatted}
                                    >
                                        <HourText
                                            selected={selectedHour === hour}
                                        >
                                            {hourFormatted}
                                        </HourText>
                                    </Hour>
                                ),
                            )}
                        </SectionContent>
                    </Section>
                </Schedule>

                <CreateAppointmentButton onPress={handleCreateAppointment}>
                    <CreateAppointmentButtonText>
                        Agendar
                    </CreateAppointmentButtonText>
                </CreateAppointmentButton>
            </Content>
        </Container>
    );
};

export default CreateAppointment;
