import { Box, Text, Input, Button } from '@chakra-ui/react'
import { useState } from 'react'

function Login() { 

    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');

    return(
        <Box width="100vw" 
            height="100vh" 
            margin="auto" 
            backgroundColor='#1C3451' 
            justifyContent='space-between' 
            display='flex' 
            flexDirection='column' 
            alignItems='center'
            fontFamily='sans-serif poppins' >
            
            <Box display='flex' justifyContent='space-between' width='100%'>
                <Box backgroundColor="#E0E7FF" height='200px' width='200px' borderBottomRightRadius="100%">
                </Box>
                <Box backgroundColor="#E0E7FF" height='200px' width='200px' borderBottomLeftRadius="100%">
                </Box>
            </Box>

            <Box w='720px' 
                 h='720px' 
                 display='flex'
                 flexDirection='column'
                 alignItems='center'
                 >

                <Box textAlign='center'
                     marginBottom='4vh'>

                    <Text lineHeight='0.5'
                          fontWeight='bold' 
                          fontSize='40' 
                          textColor='#ffffffff' 
                          marginBottom='20px'
                          >Faça seu login
                    </Text>
                    <Text fontWeight='semibold' 
                          fontSize='24'
                          textColor='#61B4DD'
                          >Bem-vindo de volta! 
                    </Text>
                </Box>

                <Box maxWidth='50%' 
                     alignSelf='center' 
                     marginBottom='1vh'>
                        
                    <Input placeholder='Digite seu CPF' 
                           backgroundColor='#ffffff' 
                           marginBottom='3vh' 
                           height='56px' 
                           value={cpf}
                           onChange={(e) => setCpf(e.target.value)} />

                    <Input placeholder='Senha' 
                           backgroundColor='#ffffff' 
                           type='password' 
                           height='56px' 
                           value={password}
                           onChange={(e) => setPassword(e.target.value)} />
                </Box>

                <Box maxWidth='60%' alignSelf='center' display='flex' flexDirection='column' alignItems='center'>
                    <Text textAlign='center'
                          textColor="#ffffffff"
                          lineHeight='1.2'
                          marginBottom='2vh'
                          fontSize='10'
                          fontWeight='semibold'>Ao entrar você está concordando com os termos de uso</Text>
                    <Button backgroundColor='#61B4DD'
                            width='220px'
                            height='48px'
                            
                            onClick={handleClick}>Entrar</Button>
                </Box>
            </Box>

            <Box display='flex' justifyContent='space-between' width='100%'>
                <Box backgroundColor="#E0E7FF" height='200px' width='200px' borderTopRightRadius="100%">
                </Box>
                <Box backgroundColor="#E0E7FF" height='200px' width='200px' borderTopLeftRadius="100%">
                </Box>
            </Box>
        </Box> 

    )
}


function handleClick() {
 
}



export default Login