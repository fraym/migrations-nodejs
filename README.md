# migrations-nodejs

Client implementation in javascript for the [migrations service](https://github.com/fraym/migrations).

## Installation

```shell
npm i @fraym/migrations
```

## CLI command

Use the `migrations` cli command to automatically apply all your Fraym schemas to the corresponding Fraym service.

Your type schemas have to match the glob you specify in the `MIGRATIONS_SCHEMA_GLOB` env variable (default: `./src/**/*.graphql`).

API: You can specify the address (and port) of the migrations service instance you use in the `MIGRATIONS_SERVER_ADDRESS` env variable (default: `://127.0.0.1`), to use secure connections (https / wss) set `MIGRATIONS_SECURE` to `true`. You will also need to set the `MIGRATIONS_API_TOKEN` variable. The value of that token has to match the token configured in the migrations service.

Use the `MIGRATIONS_NAMESPACE` env variable to restrict all migrations to your namespace. This is useful if multiple apps share the Fraym services. Note: You cannot name your type or namespace by a `Fraym` prefix. This is a reserved prefix for Fraym apps.

You need to add a file that contains all built-in directives to your type schemas. The latest version of this file can be found [here](base.graphql).

Best is to start with a structure like the one presented in our [example directory](./example).

### Config

Use a `.env` file or env variables to configure the command:

```env
MIGRATIONS_SERVER_ADDRESS=http://127.0.0.1
MIGRATIONS_API_TOKEN=change-me
MIGRATIONS_SCHEMA_GLOB=./**/*.graphql
MIGRATIONS_NAMESPACE=
```

## Env variable placeholders in migrations

You can use placeholders that match environment variables in argument strings in your schema definitions:

In the following example the `{{env.BACKEND_HOSTNAME}}` part will be replaced by the value of the `BACKEND_HOSTNAME` environment variable.
Please add your used env variables to the `.env` file that is used to [configure the migration command](#config).

```graphql
type TestType {
    value: String
        @webhook(
            url: "http://{{env.BACKEND_HOSTNAME}}/event-organizing/contingent/projections/frontend/contingent-management/webhook"
            method: "GET"
            header: [{ key: "Content-Type", value: "'application/json'" }]
            body: [
                { key: "metadata", value: "metadata" }
                { key: "payload", value: "payload" }
                { key: "projection", value: "projection" }
            ]
        )
}
```
