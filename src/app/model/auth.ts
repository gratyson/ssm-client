export interface User {
    username: string | undefined;
    password: string | undefined;
}

export interface AuthResponse {
    success: boolean | undefined;
    errorMsg: string | undefined;
}

export interface UserInput {
    username: string;
    password: string;
}