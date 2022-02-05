import { createConnection, getConnectionOptions } from 'typeorm';

export default async (host = "database_postgres") => {
  const defaultOptions = await getConnectionOptions();

    return createConnection(
        Object.assign(defaultOptions, {
            host: process.env.NODE_ENV ? "localhost" : host,
            database:
                process.env.NODE_ENV === "test"
                    ? "fin_api_test"
                    : defaultOptions.database,
        })
    );
};
