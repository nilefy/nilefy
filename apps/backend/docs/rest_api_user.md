![Rest API USER Docs](./REST-API_banner.png)
In this quick guide you're going to learn how to integrate your `REST api` into your nilefy app.
### 1. Adding the datasource 
Start by navigating to datasources and adding a new one, choose the rest api. 
From there fill in the base URL then choose the auth method, you can also add custom headers if necessary:
![rest api example](./restapi_empty.png)
***
### 2. Add auth method if necessary and fill in necessary fields
Fill in the auth methods according to your RESTful api
![rest auth](./rest_auth.png)
***
### 3. Create queries to use it
Add a query using the rest api datasource you just created.
Add an endpoint if necessary

![query rest png](rest_api_query.png)

### 4. Use it (we'll use a table as an example)

drag and drop a table from the side menue.
click on it and in the data section retreive the query's results by accessing it's data property

![data table](./data%20table.png)

!! voila you used your RESTful api successfully ⚡⚡