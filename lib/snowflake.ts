import snowflake from "snowflake-sdk";

type SnowflakeRow = Record<string, unknown>;

function createConnection() {
    const connection = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USERNAME,
        password: process.env.SNOWFLAKE_PASSWORD,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        database: process.env.SNOWFLAKE_DATABASE,
        schema: process.env.SNOWFLAKE_SCHEMA,
        role: process.env.SNOWFLAKE_ROLE,
    });

    return connection;
}

function connectAsync(connection: snowflake.Connection): Promise<void> {
    return new Promise((resolve, reject) => {
        connection.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function executeAsync(
    connection: snowflake.Connection,
    sqlText: string,
    binds: unknown[] = []
): Promise<SnowflakeRow[]> {
    return new Promise((resolve, reject) => {
        connection.execute({
            sqlText,
            binds,
            complete: (err, _stmt, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve((rows ?? []) as SnowflakeRow[]);
            },
        });
    });
}

function destroyAsync(connection: snowflake.Connection): Promise<void> {
    return new Promise((resolve, reject) => {
        connection.destroy((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export async function querySnowflake(
    sqlText: string,
    binds: unknown[] = []
): Promise<SnowflakeRow[]> {
    const connection = createConnection();

    try {
        await connectAsync(connection);
        const rows = await executeAsync(connection, sqlText, binds);
        return rows;
    } finally {
        try {
            await destroyAsync(connection);
        } catch {
            // avoid masking the real query error
        }
    }
}