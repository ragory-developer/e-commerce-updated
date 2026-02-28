declare const _default: () => {
    nodeEnv: string;
    port: number;
    jwt: {
        secret: string | undefined;
        accessTokenExpiration: string;
        refreshTokenExpiration: string;
    };
    bcrypt: {
        saltRounds: number;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
    superAdmin: {
        email: string | undefined;
        password: string | undefined;
        firstName: string;
        lastName: string;
    };
};
export default _default;
