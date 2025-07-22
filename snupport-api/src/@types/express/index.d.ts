export {};

declare global {
    namespace Express {
        interface Request {
            cleanBody: any
            cleanParams: any
            cleanQuery: any
            user: any
        }
    }
}