export interface AuthProvider {
    parseToken(token: string): Promise<string>;
}

export const AuthProvider = Symbol("AuthProvider");
