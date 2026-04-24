import { Box } from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';

function Dashboard() {

    const isLoggedIn = localStorage.getItem('loggedIn') != 'true';

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    return (
        
        <Box>
            <h1>Dashboard - Bem-vindo!</h1>
        </Box>
    );
}

export default Dashboard;