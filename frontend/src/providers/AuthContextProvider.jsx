import { useReducer, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { authReducer } from '../reducers/authReducer';
import api from '../utils/axios';

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user: null });
    const [loading, setLoading] = useState(true);

    // fetch new token
    const refreshToken = async () => {
        try {
            const { data } = await api.post('/api/user/refresh');
            return data?.token || null;
        } catch (err) {
            console.error('Refresh token failed', err);
            return null;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));

            if (!storedUser) {
                setLoading(false);
                return;
            }

            const newToken = await refreshToken();

            if (!newToken) {
                localStorage.removeItem('user');
                dispatch({ type: 'LOGOUT' });
                setLoading(false);
                return;
            }

            const updatedUser = { ...storedUser, token: newToken };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            dispatch({ type: 'LOGIN', payload: updatedUser });
            setLoading(false);
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                dispatch,
                loading,
                refreshToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
