import React, { useCallback, useRef } from 'react';
import * as yup from 'yup';

import {
    Image,
    View,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';

import Input from '../../components/Input';
import Button from '../../components/Button';

import logoImg from '../../assets/logo.png';

import { Container, Title, BackToSignIn, BackToSignInText } from './styles';

interface SignUpFormData {
    email: string;
    password: string;
}

const SignUp: React.FC = () => {
    const navigation = useNavigation();

    const formRef = useRef<FormHandles>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const handleSignUp = useCallback(
        async (data: SignUpFormData) => {
            try {
                formRef.current?.setErrors({});

                const schema = yup.object().shape({
                    name: yup.string().required('Nome obrigatório'),
                    email: yup
                        .string()
                        .required('E-mail obrigatório')
                        .email('Digite um e-mail válido'),
                    password: yup.string().min(8, 'No mínimo 8 digitos'),
                });

                await schema.validate(data, {
                    abortEarly: false,
                });

                await api.post('/users', data);

                Alert.alert(
                    'Cadastro realizado com sucesso!',
                    'Você já pode fazer login na aplicação.',
                );

                navigation.navigate('SignIn');
            } catch (err) {
                if (err instanceof yup.ValidationError) {
                    const errors = getValidationErrors(err);

                    formRef.current?.setErrors(errors);

                    return;
                }

                Alert.alert(
                    'Erro no cadastro',
                    'Ocorreu um erro ao fazer cadastrro, tente novamente.',
                );
            }
        },
        [navigation],
    );

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
                    <Image source={logoImg} />

                    <View>
                        <Title>Crie sua conta</Title>
                    </View>

                    <Form onSubmit={handleSignUp} ref={formRef}>
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
                                passwordInputRef.current?.focus();
                            }}
                        />
                        <Input
                            ref={passwordInputRef}
                            name="password"
                            icon="lock"
                            placeholder="Senha"
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
                        Entrar
                    </Button>
                </Container>

                <BackToSignIn
                    onPress={() => {
                        navigation.goBack();
                    }}
                >
                    <BackToSignInText>
                        Voltar para logon
                        <Icon name="arrow-left" size={20} color="#fff" />
                    </BackToSignInText>
                </BackToSignIn>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SignUp;
