import { Box, Text, Input, Button, useToast, FormControl, FormErrorMessage } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { maskCPF, validateCPF } from '../../utils/validators';
import { login } from '../../services/auth.service';
import { setSession } from '../../utils/session';

function Login({ loggedIn }) {
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    function handleCpfChange(e) {
        const masked = maskCPF(e.target.value);
        setCpf(masked);
        if (errors.cpf) setErrors(prev => ({ ...prev, cpf: '' }));
    }

    function validate() {
        const newErrors = {};
        if (!cpf) {
            newErrors.cpf = 'Informe o CPF.';
        } else if (!validateCPF(cpf)) {
            newErrors.cpf = 'CPF inválido.';
        }
        if (!password) newErrors.password = 'Informe a senha.';
        return newErrors;
    }

    const handleClick = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        const cleanCpf = cpf.replace(/\D/g, '');
        setIsLoading(true);

        try {
            const data = await login({ cpf: cleanCpf, senha: password });
            setSession({ token: data.token, user: data.user });
            toast({ title: 'Bem-vindo!', status: 'success', duration: 3000, isClosable: true, position: 'top' });
            loggedIn(true);
            navigate('/dashboard');
        } catch (error) {
            const invalidCredentials = error?.status === 401;
            toast({
                title: invalidCredentials ? 'CPF ou senha inválidos.' : 'Não foi possível fazer login. Tente novamente.',
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter') handleClick(); };

    return (
        <Box width="100vw" height="100vh" margin="auto" backgroundColor='#1C3451'
            justifyContent='space-between' display='flex' flexDirection='column'
            alignItems='center' fontFamily='sans-serif'>

            <Box display='flex' justifyContent='space-between' width='100%'>
                <Box backgroundColor="#E0E7FF" height='200px' width='200px' borderBottomRightRadius="100%" />
                <Box backgroundColor="#E0E7FF" height='200px' width='200px' borderBottomLeftRadius="100%" />
            </Box>

            <Box w='480px' display='flex' flexDirection='column' alignItems='center'>
                <Box textAlign='center' marginBottom='4vh'>
                    <Text lineHeight='0.5' fontWeight='bold' fontSize='40' textColor='#ffffff' marginBottom='20px'>
                        Faça seu login
                    </Text>
                    <Text fontWeight='semibold' fontSize='24' textColor='#61B4DD'>
                        Bem-vindo de volta!
                    </Text>
                </Box>

                <Box w='100%' display='flex' flexDirection='column' gap='3' mb='3'>
                    <FormControl isInvalid={!!errors.cpf}>
                        <Input
                            placeholder='Digite seu CPF'
                            backgroundColor='#ffffff'
                            height='56px'
                            type='text'
                            value={cpf}
                            onChange={handleCpfChange}
                            onKeyDown={handleKeyDown}
                        />
                        <FormErrorMessage color="red.300" fontSize="xs">{errors.cpf}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.password}>
                        <Input
                            placeholder='Senha'
                            backgroundColor='#ffffff'
                            type='password'
                            height='56px'
                            value={password}
                            autoComplete='current-password'
                            onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: '' })); }}
                            onKeyDown={handleKeyDown}
                        />
                        <FormErrorMessage color="red.300" fontSize="xs">{errors.password}</FormErrorMessage>
                    </FormControl>
                </Box>

                <Box display='flex' flexDirection='column' alignItems='center' w='100%'>
                    <Text textAlign='center' textColor="#ffffff" lineHeight='1.2' marginBottom='2vh' fontSize='10' fontWeight='semibold'>
                        Ao entrar você está concordando com os termos de uso
                    </Text>
                    <Button backgroundColor='#61B4DD' width='220px' height='48px' onClick={handleClick} isLoading={isLoading} loadingText='Entrando...'>
                        Entrar
                    </Button>
                </Box>
            </Box>

            <Box display='flex' justifyContent='space-between' width='100%'>
                <Box backgroundColor="#E0E7FF" height='200px' width='200px' borderTopRightRadius="100%" />
                <Box backgroundColor="#E0E7FF" height='200px' width='200px' borderTopLeftRadius="100%" />
            </Box>
        </Box>
    )
}

export default Login
