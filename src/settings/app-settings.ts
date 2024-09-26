import { config } from 'dotenv';

config();

export type EnvironmentVariable = { [key: string]: string | undefined };
export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING';
export const Environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TESTING'];

export class EnvironmentSettings {
  constructor(private env: EnvironmentsTypes) {}

  getEnv() {
    console.log(this.env);
    return this.env;
  }

  isProduction() {
    return this.env === 'PRODUCTION';
  }

  isDevelopment() {
    return this.env === 'DEVELOPMENT';
  }

  isTesting() {
    return this.env === 'TESTING';
  }
}

export class AppSettings {
  constructor(
    public env: EnvironmentSettings,
    public api: APISettings,
  ) {}
}

class APISettings {
  public readonly APP_PORT: number;
  public readonly HASH_ROUNDS: number;
  public readonly ADMIN_LOGIN: string;
  public readonly ADMIN_PASSWORD: string;
  public readonly JWT_SECRET: string;

  public readonly MONGO_CONNECTION_URI: string;
  public readonly MONGO_CONNECTION_URI_FOR_TESTS: string;

  constructor(private readonly envVariables: EnvironmentVariable) {
    this.APP_PORT = this.getNumberOrDefault(
      envVariables.APP_PORT as string,
      7840,
    );
    this.HASH_ROUNDS = this.getNumberOrDefault(envVariables.HASH_ROUNDS, 10);
    this.ADMIN_LOGIN = envVariables.ADMIN_LOGIN ?? 'admin';
    this.ADMIN_PASSWORD = envVariables.ADMIN_PASSWORD ?? 'qwerty';
    this.JWT_SECRET = envVariables.JWT_SECRET ?? '1231qweqwe';

    this.MONGO_CONNECTION_URI =
      envVariables.MONGO_CONNECTION_URI ?? 'mongodb://localhost/nest';
    this.MONGO_CONNECTION_URI_FOR_TESTS =
      envVariables.MONGO_CONNECTION_URI_FOR_TESTS ?? 'mongodb://localhost/test';
  }

  private getNumberOrDefault(value: any, defaultValue: number): number {
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      return defaultValue;
    }

    return parsedValue;
  }
}

const env = new EnvironmentSettings(
  (Environments.includes((process.env.ENV as string)?.trim())
    ? (process.env.ENV as string).trim()
    : 'DEVELOPMENT') as EnvironmentsTypes,
);

const api = new APISettings(process.env);
export const appSettings = new AppSettings(env, api);
