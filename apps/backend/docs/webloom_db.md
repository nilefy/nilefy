# Project Documentation

## Overview

This documentation provides an overview of the backend db, explaining the structure, components, and functionality.

## Table Management System

### Introduction

The Table Management System is designed to create and manage tables dynamically. It consists of various components that work together to facilitate table creation, management, and data handling.

### Database Schema

The project uses a PostgreSQL database and defines two main tables:

1. `tables` table: Stores information about tables.
2. `columns` table: Stores information abuot columns that can be associated with tables along with thier type.

### LoomTable Model

The `LoomTable` model represents a table entry. It includes the following fields:

- `name` (string, required)
- `created_at`
- `columns` (one-to-many relationship with the `columns` table)

### Controllers

#### `TablecxController`

The controller handles HTTP requests and interacts with the `TablecxService`. It provides the following endpoints:

- `GET /tables/:id`: Retrieves data for a specific table by its `id`.
- `GET /tables`: Retrieves data for all tables.
- `POST /tables/insert/:id`: Inserts data into a specific table. -not complete
- `POST /tables`: Creates a new table.
- `DELETE /tables/:id`: Deletes a table by its `id`.

### Services

#### `TablecxService`

The service layer contains business logic and communicates with the database using the `DbService`.

- `getAllTablecxs`: Retrieves data for all tables.
- `createTablecx`: Creates a new table and validates its structure.
- `deleteTablecx`: Deletes a table by its `id`.
- `getAllDataByTableId`: Retrieves data for a specific table by its `id`.
- `insertDataByTableId`: Inserts data into a specific table, validating the data structure.

### DbService

The `DbService` interacts directly with the database using the `drizzle-orm` library. It provides methods for CRUD operations on tables and columns, as well as generating SQL queries for table creation dynamiclly.

## Data Validation

Data validation is an essential part of the project. The `isDataValid` function checks if data adheres to the table structure and data types defined in the schema. It ensures that data is suitable for insertion into the database.

## Helper Methods

- `_getTableNameById`: Retrieves the name of a table by its `id`.
- `_generateCreateTableQuery`: Generates an SQL query to create a table based on its structure.

## Conclusion

The Table Management System project allows for dynamic table creation and data handling in a PostgreSQL database. The architecture includes controllers, services, and a database service that ensures data integrity and table management.

[Project Repository](#your-repo-link)

---

## API Documentation

[API Endpoints and Usage](#your-api-doc-link)