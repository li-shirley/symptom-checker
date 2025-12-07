export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload }
        case 'LOGOUT':
            return { user: null }
        case 'REFRESH_TOKEN':
            return { user: { ...state.user, token: action.payload } };
        default:
            return state
    }
}