# Queries

Query object properties and JavaScript API methods.

each object must has unique name from all other queries and even widgets you can access query like this `query1.run()`

## Properties

| Field       | Description                                                           | Type  |
|-------------|-----------------------------------------------------------------------|-------|
| data        | Data returned from the query. *(Starts with undefined)*               | unknown |
| type        | DataSource type.                                                      | string |
| statusCode  | StatusCode of the query call to the other backend, or 505 if our server faced an error. | number |
| error       | If the plugin returned an error, it will be here.                      | string |
| config      | CompleteQueryI['query']                                               | unknown |
| queryState  | 'idle' \| 'loading' \| 'success' \| 'error'                           | 'idle' \| 'loading' \| 'success' \| 'error' |

## Methods

Methods you can use in your JavaScript code to customize your application.

### `Query.run`

Run the query.

- interface: `(void) => void`

- example: `postgres.run()`


### `Query.reset`

Clear all the query props to their initial values

- interface: `(void) => void`

- example: `postgres.reset()`
