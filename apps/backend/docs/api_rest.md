# REST API Query Service Documentation

## Overview

This is documentation for the `RESTful API` plugin, specifically the `RESTQueryService` class. This class is designed to facilitate the execution of queries against a RESTful API, implementing the `QueryRunnerI` interface and supporting various authentication methods.

## Usage

To use the `RESTQueryService`, you need to create an instance of the class and call the `run` method with the appropriate configuration and query parameters.

```typescript
import RESTQueryService from 'path/to/RESTQueryService';

// Create an instance of the RESTQueryService
const queryService = new RESTQueryService();

// Define configuration and query parameters
const dataSourceConfig = /* Configuration object of type ConfigT */;
const queryConfig = /* Query configuration object of type QueryConfig<QueryT> */;

// Execute the query
const result = await queryService.run(dataSourceConfig, queryConfig);

// Access the result properties
console.log(result.status); // HTTP status code
console.log(result.data);   // Response data
console.log(result.error);  // Error message (if any)
```


## Query Structure

The query object (`QueryT`) is a crucial part of the RESTQueryService and defines the details of the specific query to be executed against the `RESTful API`. Here is an in-depth explanation of its structure:

## Properties

- **name** (`Type: string`): A unique identifier for the query. It helps in distinguishing different queries within the service.

- **endpoint** (`Type: string`): The API endpoint to execute the query against. It represents the specific resource or path on the RESTful API server. It is joined with the `base URL` from the config when executing the query.

- **method** (`Type: string`): The HTTP method to be used for the query (e.g., GET, POST, PUT, DELETE). It determines the type of operation to be performed on the specified endpoint.

- **headers** (`Type: Array<[string, string]>`): An array of key-value pairs representing HTTP headers. Each pair consists of a header name and its corresponding value.

- **params** (`Type: Record<string, unknown>`): Query parameters to be included in the request URL. These parameters typically affect the behavior of the API endpoint.

- **body** (`Type: string`): The request body for the query. It is used for operations like POST or PUT where data needs to be sent to the server.