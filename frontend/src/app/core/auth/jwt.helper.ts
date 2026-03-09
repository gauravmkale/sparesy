export function jwtDecode(token: string | null): any | null {
    if(!token) return null;
    try {
        const payload = token.split('.')[1];
        if(!payload) return null;
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}