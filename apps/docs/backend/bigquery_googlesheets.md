# Big Query

### First approach
  - OAuth 2.0 to Sign in using google
  - Initiate linking google sheets (google sheets integration)
  - google sheets api
    - [google workspace - connect using bigQuery](https://developers.google.com/sheets/api/guides/connected-sheets#add_a_bigquery_data_source)

 ```"":{
   "dataSource":{
      "spec":{
         "bigQuery":{
            "projectId":"<YOUR_PROJECT_ID>",
            "tableSpec":{
               "tableProjectId":"bigquery-public-data",
               "datasetId":"samples",
               "tableId":"shakespeare"
            }
         }
      }
   }
}
```
### Adding source datatable 
```
"":{
   "rows":{
      "values":[
         {
            "dataSourceTable":{
               "dataSourceId":"<YOUR_DATA_SOURCE_ID>",
               "columns":[
                  {
                     "name":"word"
                  },
                  {
                     "name":"word_count"
                  }
               ],
               "rowLimit":{
                  "value":1000 
               },
               "columnSelectionType":"SELECTED"
            }
         }
      ]
   },
   "fields":"dataSourceTable"
} 
``` 