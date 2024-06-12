# Google Cloud Storage

This document provides guidance on how to perform various operations on a connected Google Cloud Storage (GCS) data source in Nilefy. You will learn how to connect to GCS, perform various operations, and configure actions based on the operations's success, failure, and mutation. Additionally, how to set the trigger mode to run the operation manually or on app load.

## Step-by-Step Guide

### 1. Connecting to Google Cloud Storage Data Source

To connect your Google Cloud Storage to your workspace, follow these steps:

1. **Navigate to Data Source Configuration**:
   - Go to the data source configuration section.

    ![Nilefy](img/ds.png)

2. **Add a New Data Source**:
   - Choose Google CLoud Storage from the list of available data sources.
   - Select the option to add a new data source.
   - Provide a name for the connection.

   ![Nilefy](img/ds_name.png)


3. **Provide Connection Details**:

    ![Nilefy](img/gcs/ds_config.png)

   - **Name**: You can change the connection name.
   - **Private Key String**: Enter the private key string from your GCS service account.

    The key has the following format:

    ```bash
    {
        "type": "service_account",
        "project_id": "PROJECT_ID",
        "private_key_id": "KEY_ID",
        "private_key": "-----BEGIN PRIVATE KEY-----\nPRIVATE_KEY\n-----END PRIVATE KEY-----\n",
        "client_email": "SERVICE_ACCOUNT_EMAIL",
        "client_id": "CLIENT_ID",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://accounts.google.com/o/oauth2/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/SERVICE_ACCOUNT_EMAIL"
    }
    ```

4. **Test the Connection**:
   - Ensure that the connection details are correct and that you can successfully connect to the Google Cloud Storage data source.

5. **Save the Connection**:
   - Save the connection configuration. This connection will now be available for use in your queries.


### 2. Running a Query

Once your Google Cloud Storage is connected, you can perform various operations as follows:

1. **Navigate to the Query Section**:
   - Go to the query configuration section in your application.
    
    ![Nilefy](img/query_config.png)
   

2. **Create a New Query**:
   - Select the option to add a new query.
   - Select your connected Google CLoud Storage data source.

    ![Nilefy](img/gcs/query_add.png)

   - Select the operation you want to perform and enter the required information.
    
    ![Nilefy](img/gcs/query.png)

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

### 1. Delete File

To delete a file from a specific bucket:

- **Bucket Name**: Specify the name of the bucket.
- **File Name**: Specify the name of the file to be deleted.

### 2. Upload File

To upload a file to a specific bucket:

- **Bucket Name**: Specify the name of the bucket.
- **File Path**: Provide the local file path of the file to be uploaded.

### 3. List Buckets

List all buckets in your Google Cloud Storage.

### 4. List Files

To list files in a specific bucket with an optional prefix:

- **Bucket Name**: Specify the name of the bucket.
- **Prefix (optional)**: Provide a prefix to filter the files listed.

### 5. Download File

To download a file from a specific bucket:

- **Bucket Name**: Specify the name of the bucket.
- **File Name**: Specify the name of the file to be downloaded.
- **Destination (optional)**: Provide the local destination path where the file will be saved.

By following these steps, you can effectively connect to Google Cloud Storage and perform various operations. This allows you to manage and interact with your storage seamlessly within your applications.