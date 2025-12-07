import { useState } from 'react';
import { useAuthContext } from './useAuth';
import { apiRequest } from '../utils/api';

export const useSignup = () => {
    const { dispatch } = useAuthContext();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const signup = async (email, password, birthDate, sex) => {
        setIsLoading(true);
        setError(null);

        const { success, data } = await apiRequest(
            '/api/user/signup',
            {
                method: 'POST',
                body: { email, password, birthDate, sex },
            }
        );

        if (!success) {
            setError(data?.error || 'Signup failed. Please try again.');
            setIsLoading(false);
            return false;
        }

        localStorage.setItem('user', JSON.stringify(data));
        dispatch({ type: 'LOGIN', payload: data });

        setIsLoading(false);
        return true;
    };

    return { signup, isLoading, error };
};
