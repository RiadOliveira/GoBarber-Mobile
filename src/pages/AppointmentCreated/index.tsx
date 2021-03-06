import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import React, { useCallback, useMemo } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import {
    Container,
    Title,
    Description,
    OkButton,
    OkButtonText,
} from './styles';

interface RouteParams {
    date: number;
}

const AppointmentCreated: React.FC = () => {
    const { reset } = useNavigation();
    const { date } = useRoute().params as RouteParams;

    const handleOkPressed = useCallback(() => {
        reset({
            routes: [
                {
                    name: 'Dashboard',
                },
            ],
            index: 0,
        });
    }, [reset]);

    const formattedDate = useMemo(() => {
        return format(
            date,
            "EEEE',' 'dia' d 'de' MMMM 'de' yyyy',' 'às' H:'00'",
            {
                locale: ptBr,
            },
        );
    }, [date]);

    return (
        <Container>
            <Icon name="check" size={80} color="#04d361" />

            <Title>Agendamento concluído</Title>
            <Description>{formattedDate}</Description>

            <OkButton onPress={handleOkPressed}>
                <OkButtonText>Ok</OkButtonText>
            </OkButton>
        </Container>
    );
};

export default AppointmentCreated;
