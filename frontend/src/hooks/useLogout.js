import { useAuthContext } from './useAuth';
import { apiRequest } from '../utils/api';

export const useLogout = () => {
    const { dispatch, user } = useAuthContext();

    const logout = async () => {
        // server logout
        await apiRequest(
            '/api/user/logout',
            { method: 'POST' },
            { user },
        );

        // clear client auth
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });

        return true;
    };

    return { logout };
};
