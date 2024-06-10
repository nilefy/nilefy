---
title: 'Overview'
sidebar_position: 1
---

# Overview of Data Sources in *Nilefy*

One of the crucial aspects of Nilefy is its ability to connect with various data sources, enabling users to integrate, manipulate, and display data seamlessly within their applications. This document provides an overview of the data sources available in Nilefy and guides users on how to connect and utilize these data sources in their applications.

## Types of Data Sources

### 1. Databases
- **Relational Databases**: Nilefy supports SQL databases like PostgreSQL. Users can connect to the database to fetch and manipulate structured data using SQL queries.
- **NoSQL Databases**: For unstructured data, Nilefy supports NoSQL databases such as MongoDB.

### 2. APIs
- **REST APIs**: Nilefy allows users to connect to external RESTful services using API endpoints. This enables integration with third-party services, cloud platforms, and microservices.

### 3. Cloud Services
- **Cloud Storage**: Integration with cloud storage services like Google Cloud Storage, and Azure Blob Storage allows users to manage and utilize large volumes of data.

### 4. Spreadsheets
- **Google Sheets**: Nilefy supports real-time integration with Google Sheets, enabling dynamic data fetching and updating.

## Connecting Data Sources

To connect a data source to your application, follow these general steps:

1. **Select the Data Source Type**:
   - Navigate to the data source configuration section.
   - Choose the data source you want to connect.

   ![Nilefy](img/ds.png)

2. **Provide Connection Details**:
   - For databases, enter the necessary connection parameters such as host, port, database name, username, and password.
   - For APIs, specify the endpoint URL, authentication method, and any required headers.
   - For cloud services, provide the necessary credentials and configuration details specific to the service.

    ![Nilefy](img/postgresql/ds_config.png)

4. **Test the Connection**:
   - Ensure the connection is successful and data can be retrieved without issues.

5. **Configure Data Access**:
   - Set up queries on your application to fetch specific data as needed.

   ![Nilefy](img/query_config.png)


Once connected, you can utilize the data in your applications. By leveraging the data source capabilities of Nilefy, you can create robust, data-driven applications that streamline business processes and deliver valuable insights.