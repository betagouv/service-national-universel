/**
 * Marqueurs de session portés par le JWT émis par la v1 (api/src/auth.ts).
 *
 * `__v` est la version de signature (api/src/jwt-options.js), `lastLogoutAt` et
 * `passwordChangedAt` figent l'état du compte au moment de l'émission : les comparer à la base
 * est ce qui permet de révoquer un jeton avant son expiration.
 */
export type AuthTokenPayload = {
    id: string;
    __v?: string;
    lastLogoutAt?: string | Date | null;
    passwordChangedAt?: string | Date | null;
};

export interface AuthProvider {
    parseToken(token: string): Promise<AuthTokenPayload>;
}

export const AuthProvider = Symbol("AuthProvider");
