import fs from "fs";

const configPath = "src/config.json";
var parsedConfig = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

// Development configuration.
//const config = parsedConfig.developmentConfig;

const config = parsedConfig.containerConfig;

export default config;
