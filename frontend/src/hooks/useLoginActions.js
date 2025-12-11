import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { apiRequest } from '../utils/api';

export const useLogin = () => {
    const { dispatch } = useAuthContext();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);

        const { success, data } = await apiRequest(
            '/api/user/login',
            {
                method: 'POST',
                body: { email, password },
            }
        );

        if (!success) {
            setError(data?.error || 'Login failed');
            setIsLoading(false);
            return false;
        }

        localStorage.setItem('user', JSON.stringify(data));
        dispatch({ type: 'LOGIN', payload: data });

        setIsLoading(false);
        return true;
    };

    return { login, isLoading, error };
};
