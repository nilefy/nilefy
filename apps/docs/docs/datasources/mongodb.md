# MongoDB 

Nilefy provides powerful tools to perform operations on connected databases, including MongoDB. This document provides guidance on how to perform various operations on a connected MongoDB data source, and configure actions based on the operations's success, failure, and mutation. Additionally, how to set the trigger mode to run the operation manually or on app load.

## Step-by-Step Guide

### 1. Connecting to MongoDB Database

To connect your MongoDB database to your workspace, follow these steps:

1. **Navigate to Data Source Configuration**:
   - Go to the data source configuration section.

    ![Nilefy](img/ds.png)

2. **Add a New Data Source**:
   - Choose MongoDB from the list of available data sources.
   - Select the option to add a new data source.
   - Provide a name for the connection.

   ![Nilefy](img/ds_name.png)


3. **Provide Connection Details**:

    ![Nilefy](img/mongodb/ds_config.png)

   - **Name**: You can change the connection name.
   - **URI Connection String**: Enter the URI connection string of your MongoDB server, e.g., `mongodb://username:password@host:port/database`.

4. **Test the Connection**:
   - Ensure that the connection details are correct and that you can successfully connect to the MongoDB database.

5. **Save the Connection**:
   - Save the connection configuration. This connection will now be available for use in your queries.

### 2. Running a Query

Once your MongoDB database is connected, you can perform various operations as follows:

1. **Navigate to the Query Section**:
   - Go to the query configuration section in your application.
    
    ![Nilefy](img/query_config.png)
   

2. **Create a New Query**:
   - Select the option to add a new query.
   - Select your connected MongoDB database.

    ![Nilefy](img/mongodb/query_add.png)

   - Select the operation you want to perform and enter the required information.
    
    ![Nilefy](img/mongodb/query.png)

3. **Configuring Actions**: Configure the actions to be performed based on the query's result.

    ![Nilefy](img/interactions.png)

    - **Define Success Actions**: Specify the actions to be performed when the query executes successfully, e.g., refresh a data table to display the retrieved data. 

    - **Define Failure Actions**: Specify the actions to be performed when the query fails, e.g., display an error notification or message to the user.

    - **Define Mutation Actions**: Specify the actions to be performed when data is mutated as a result of the query, e.g., reload other related data sources to ensure consistency or start secondary actions that depend on the data change.

4. **Setting the Trigger Mode**: determine how and when the query should be triggered.
    
    ![Nilefy](img/trigger.png)

    - **Manual Trigger**: The query will only run when explicitly called by the user or through specific actions, such as button clicks.

    - **App Load Trigger**: The query will run automatically when the application or specific page loads.

## Available Operations

### 1. Create Document/s

To create a document in a specific collection:

- **Database Name**: Specify the name of the database.
- **Collection Name**: Specify the name of the collection.
- **Document(s)**: Provide the document or documents to be created, e.g., `[ { _id: 0, role: "user" } ]`

### 2. Find Document

To find documents based on a specified filter:

- **Database Name**: Specify the name of the database.
- **Collection Name**: Specify the name of the collection.
- **Filter**: Provide the filter criteria, e.g., `{ "rating": { $gt: 5 } }`
- **Multiple**: Specify whether to find one document or multiple documents.

### 3. View Database Collections

To view all collections in a database:

- **Database Name**: Specify the name of the database.

### 4. Count Documents

To count documents in a collection based on a matching filter:

- **Database Name**: Specify the name of the database.
- **Collection Name**: Specify the name of the collection.
- **Filter**: Provide the matching filter, e.g., `{ "rating": { $gt: 5 } }`

### 5. Update Document

To update documents that match the provided filter with the provided modifications:

- **Database Name**: Specify the name of the database.
- **Collection Name**: Specify the name of the collection.
- **Filter**: Provide the selection criteria for the update, e.g., `{ "rating": { $gt: 5 } }`
- **Update Object**: Provide the modifications to apply, e.g., `{ $set: { <field1>: <value1>, ... } }`
- **Multiple**: Specify whether to update one document or multiple documents.

### 6. Replace Document

To replace a document that matches the filter with the provided replacement document:

- **Database Name**: Specify the name of the database.
- **Collection Name**: Specify the name of the collection.
- **Filter**: Provide the selection criteria for the update, e.g., `{ "role": "admin" }`
- **Replacement Document**: Provide the replacement document, e.g., `{ role: "user" }`

### 7. Delete Document

To delete documents from a collection based on the filter provided:

- **Database Name**: Specify the name of the database.
- **Collection Name**: Specify the name of the collection.
- **Filter**: Provide the deletion criteria or an empty document to delete the first document returned in the collection.
- **Multiple**: Specify whether to delete one document or multiple documents.

By following these steps, you can effectively connect to a MongoDB database, perform various operations, handle different outcomes, and control when the queries are executed in your application.