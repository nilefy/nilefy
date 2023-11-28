# Components tree

we use relational database so we want as many structred data as possible, in the context of components tree, there's **props** that will be in any element like(name, id, x, y....), and unstructred data that backend cannot know for sure like different props each component needs.

so we gonna work on top of this concept, we gonna have a structured data that where each prop will be database column, and unstructred data will be a json object that will be stored in a json column.

another important thing we need to know is frontend store the component tree as `adjacancy list` but for sure we know there's no circular references between elements, so just keep this in mind no circles.

## How to represent tree in SQL database

- easiest solution is to store the tree as json, but why SQL database then?
    there's pros and cons
  - pros: easy to store no need to play around with sql all the logic will be application logic
  - cons: we lost everything database engine has to offer like indexing, joins, transactions, we lose the entire concept of referential integrity, etc. This also doesn’t scale very well. If we store the entire tree as a single record, there are limits on how big that record can get before it becomes too unwieldy to read and write.

- Storing Parent Keys: this way each component will be row in the database 
    > One way to achieve this is to store on every node the ID of its immediate parent. Nodes that don’t have a parent would then store NULL, and nodes with a parent can store a reference to that parent.

    > This gives us referential integrity within the database because we can ensure that values in the parent_id column are also present in the node_id column. We can also very easily insert records into the tree in the correct place using a single statement:

## Tree retrieving

i guess storing each component in database row is more effiecient, for performance atleast changing one component prop won't cause re-storing the entire tree again

but getting the tree is gonna be a bit tricky, without database support.

without database support the steps to get the tree will look something like the following

> we’d have to select each level of the tree individually and put it together in our application.

not so effecient right? and we would have the database server running anyway so why not use it a lil bit more!

### Retrieving Using Recursive Common Table Expressions

> Doing this involves writing a query that essentially joins the table back onto itself and informs the database engine that it should recursively do this until it runs out of rows.

```sql
WITH RECURSIVE rectree AS (
  SELECT * 
    FROM tree 
   WHERE node_id = 1 
UNION ALL 
  SELECT t.* 
    FROM tree t 
    JOIN rectree
      ON t.parent_id = rectree.node_id
) SELECT * FROM rectree;
```

## References

- [https://www.baeldung.com/cs/storing-tree-in-rdb](https://www.baeldung.com/cs/storing-tree-in-rdb)

- [https://www.draxlr.com/blogs/common-table-expressions-and-its-example-in-postgresql/](https://www.draxlr.com/blogs/common-table-expressions-and-its-example-in-postgresql/)

- [https://www.postgresql.org/docs/current/queries-with.html](https://www.postgresql.org/docs/current/queries-with.html)
