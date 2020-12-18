import styled from 'styled-components/native';
import { Platform } from 'react-native';

export const Container = styled.ScrollView`
    flex: 1;
    padding: 0 30px ${Platform.OS === 'android' ? '160' : '40'}px;
`;

export const BackButton = styled.TouchableOpacity`
    margin-top: 40px;
    width: 24px;
`;

export const Title = styled.Text`
    font-size: 20px;
    color: #f4ede8;
    font-family: 'RobotoSlab-Medium';
    margin: 24px 0;
`;

export const UserAvatarButton = styled.TouchableOpacity`
    margin-top: 16px;
    align-self: center;
    width: 186px;
`;

export const UserAvatar = styled.Image`
    width: 186px;
    height: 186px;
    border-radius: 98px;
`;
