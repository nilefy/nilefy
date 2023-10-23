When dragging a node (call it x) in a proximity of another node (call it y) assuming y isn't a container node (a canvas node) it could fall into on of these mutually exclusive categories (sorted by precedence):

* 1\. mouse is over y 
    * 1.1\. if over first half of y then x is inserted before y
    * 1.2\. if over second half of y then x is inserted after y
* 2\. x's top (row number) is between y's top and bottom
    * 2.1\. if mouse is under y and between y's left and right then x is inserted after y
    * 2.2\. else x is cut the amount of horziontal space it intersects with y and inserted next to y (left or right)
* 3\. any other case of overlap y is inserted after x's new position


