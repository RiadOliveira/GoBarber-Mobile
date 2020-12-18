import React, { useCallback, useRef } from 'react';
import * as yup from 'yup';

import Icon from 'react-native-vector-icons/Feather';
import {
    View,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    Alert,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import ImagePicker from 'react-native-image-picker';
import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';
import Input from '../../components/Input';
import Button from '../../components/Button';

import {
    Container,
    Title,
    UserAvatarButton,
    UserAvatar,
    BackButton,
} from './styles';
import { useAuth } from '../../hooks/auth';

interface ProfileFormData {
    name: string;
    email: string;
    oldPassword?: string;
    password?: string;
    passwordConfirmation?: string;
}

const Profile: React.FC = () => {
    const navigation = useNavigation();
    const { user, updateUser } = useAuth();

    const formRef = useRef<FormHandles>(null);
    const emailInputRef = useRef<TextInput>(null);
    const oldPasswordInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    const handleProfile = useCallback(
        async (data: ProfileFormData) => {
            try {
                formRef.current?.setErrors({});

                const schema = yup.object().shape({
                    name: yup.string().required('Nome obrigatório'),
                    email: yup
                        .string()
                        .required('E-mail obrigatório')
                        .email('Digite um e-mail válido'),
                    oldPassword: yup.string(),
                    password: yup.string().when('oldPassword', {
                        is: val => !!val.length,
                        then: yup.string().required('Campo obrigatório'),
                        otherwise: yup.string(),
                    }),
                    passwordConfirmation: yup
                        .string()
                        .when('oldPassword', {
                            is: val => !!val.length,
                            then: yup.string().required('Campo obrigatório'),
                            otherwise: yup.string(),
                        })
                        .oneOf([yup.ref('password')], 'Confirmação incorreta'),
                });

                await schema.validate(data, {
                    abortEarly: false,
                });

                const {
                    name,
                    email,
                    oldPassword,
                    password,
                    passwordConfirmation,
                } = data;

                const formData = {
                    name,
                    email,
                    ...(oldPassword
                        ? {
                              oldPassword,
                              password,
                              passwordConfirmation,
                          }
                        : {}),
                };

                const response = await api.put('/profile', formData);
                updateUser(response.data);

                Alert.alert('Perfil atualizado com sucesso!');

                navigation.goBack();
            } catch (err) {
                if (err instanceof yup.ValidationError) {
                    const errors = getValidationErrors(err);

                    formRef.current?.setErrors(errors);

                    return;
                }

                Alert.alert(
                    'Erro na atualização do perfil',
                    'Ocorreu um erro ao atualizar seu perfil, tente novamente.',
                );
            }
        },
        [navigation, updateUser],
    );

    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleUpdateAvatar = useCallback(() => {
        ImagePicker.showImagePicker(
            {
                title: 'Selecione um avatar',
                cancelButtonTitle: 'Cancelar',
                takePhotoButtonTitle: 'Usar câmera',
                chooseFromLibraryButtonTitle: 'Escolher da galeria',
            },
            response => {
                if (response.didCancel) {
                    return;
                }

                if (response.error) {
                    Alert.alert('Erro ao atualizar seu avatar.');
                    return;
                }

                const data = new FormData();

                data.append('avatar', {
                    uri: response.uri,
                    type: 'image/jpeg',
                    name: `${user.id}.jpg`,
                });

                api.patch('/users/avatar', data).then(apiResponse => {
                    updateUser(apiResponse.data);
                });
            },
        );
    }, [user.id, updateUser]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            enabled
        >
            <ScrollView
                contentContainerStyle={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <Container>
                    <BackButton onPress={handleGoBack}>
                        <Icon name="chevron-left" size={24} color="#999591" />
                    </BackButton>

                    <UserAvatarButton onPress={handleUpdateAvatar}>
                        <UserAvatar source={{ uri: user.avatarUrl }} />
                    </UserAvatarButton>

                    <View>
                        <Title>Meu perfil</Title>
                    </View>

                    <Form
                        initialData={{ name: user.name, email: user.email }}
                        onSubmit={handleProfile}
                        ref={formRef}
                    >
                        <Input
                            autoCorrect
                            autoCapitalize="words"
                            name="name"
                            icon="user"
                            placeholder="Nome"
                            returnKeyType="next"
                            onSubmitEditing={() => {
                                emailInputRef.current?.focus();
                            }}
                        />
                        <Input
                            ref={emailInputRef}
                            autoCorrect={false}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            name="email"
                            icon="mail"
                            placeholder="E-mail"
                            returnKeyType="next"
                            onSubmitEditing={() => {
                                oldPasswordInputRef.current?.focus();
                            }}
                        />
                        <Input
                            ref={oldPasswordInputRef}
                            name="oldPassword"
                            icon="lock"
                            containerStyle={{ marginTop: 16 }}
                            placeholder="Senha atual"
                            secureTextEntry
                            textContentType="password"
                            returnKeyType="next"
                            onSubmitEditing={() => {
                                passwordInputRef.current?.focus();
                            }}
                        />

                        <Input
                            ref={passwordInputRef}
                            name="password"
                            icon="lock"
                            placeholder="Nova senha"
                            secureTextEntry
                            textContentType="newPassword"
                            returnKeyType="next"
                            onSubmitEditing={() => {
                                confirmPasswordInputRef.current?.focus();
                            }}
                        />

                        <Input
                            ref={confirmPasswordInputRef}
                            name="passwordConfirmation"
                            icon="lock"
                            placeholder="Confirmação de senha"
                            secureTextEntry
                            textContentType="newPassword"
                            returnKeyType="send"
                            onSubmitEditing={() => {
                                formRef.current?.submitForm();
                            }}
                        />
                    </Form>

                    <Button
                        onPress={() => {
                            formRef.current?.submitForm();
                        }}
                    >
                        Confirmar alterações
                    </Button>
                </Container>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Profile;
