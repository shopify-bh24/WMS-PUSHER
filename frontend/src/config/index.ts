interface Config {
    backendUrl: string;
}

const config: Config = {
    backendUrl: import.meta.env.BACKEND_URL || 'http://localhost:3000',
};

export default config; 