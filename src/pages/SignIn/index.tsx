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
import { useAuth } from '../../hooks/auth';
import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import logoImg from '../../assets/logo.png';

import {
    Container,
    Title,
    ForgotPassword,
    ForgotPasswordText,
    CreateAccountButton,
    CreateAccountButtonText,
} from './styles';

interface SignInFormData {
    email: string;
    password: string;
}

const SignIn: React.FC = () => {
    const navigation = useNavigation();
    const formRef = useRef<FormHandles>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const { signIn, user } = useAuth();
    // console.log(user);

    const handleSignIn = useCallback(
        async (data: SignInFormData) => {
            try {
                formRef.current?.setErrors({});

                const schema = yup.object().shape({
                    email: yup
                        .string()
                        .required('E-mail obrigatório')
                        .email('Digite um e-mail válido'),
                    password: yup.string().required('Senha obrigatória'),
                });

                await schema.validate(data, {
                    abortEarly: false,
                });

                await signIn({
                    email: data.email,
                    password: data.password,
                });
            } catch (err) {
                if (err instanceof yup.ValidationError) {
                    const errors = getValidationErrors(err);

                    formRef.current?.setErrors(errors);

                    return;
                }

                Alert.alert(
                    'Erro na autenticação',
                    'Ocorreu um erro ao fazer login, cheque suas credenciais.',
                );
            }
        },
        [signIn],
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
                        <Title>Faça seu logon</Title>
                    </View>

                    <Form ref={formRef} onSubmit={handleSignIn}>
                        <Input
                            name="email"
                            icon="mail"
                            placeholder="E-mail"
                            autoCorrect={false}
                            autoCapitalize="none"
                            keyboardType="email-address"
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

                    <ForgotPassword>
                        <ForgotPasswordText
                            onPress={() => {
                                console.log('Deu');
                            }}
                        >
                            Esqueci minha senha
                        </ForgotPasswordText>
                    </ForgotPassword>
                </Container>

                <CreateAccountButton
                    onPress={() => {
                        navigation.navigate('SignUp');
                    }}
                >
                    <CreateAccountButtonText>
                        Criar uma conta
                        <Icon name="log-in" size={20} color="#ff9000" />
                    </CreateAccountButtonText>
                </CreateAccountButton>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SignIn;
