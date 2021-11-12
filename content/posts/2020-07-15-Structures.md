+++
title="Structures"
date=2020-07-15

[taxonomies]
categories = ["C++"]

[extra]
toc = true
comments = true
+++

A structure can hold multiple variables similar to an array but while array can only hold one type of variables, structures can hold many types of variables including arrays.You can access inner elements using the `.` operator.Here we use the library `math.h` for the function `sqrt` (square root function) and 'pow' (power function).I use structures and the distance function to calculate distance between two points.The `2` in `pow` means raised to power 2.

```cpp
#include<iostream>
#include<math.h>
using namespace std;
struct coordinate
{
    float x, y;
};
float distance(coordinate c1,coordinate c2)
{
    return sqrt(pow(c1.x-c2.x,2)+pow(c1.y-c2.y,2));
}
int main()
{
    coordinate c1,c2;
    cout<<"Enter first point's x coordinate:\n";
    cin>>c1.x;
    cout<<"Enter first point's y coordinate:\n";
    cin>>c1.y;
    cout<<"Enter second point's x coordinate:\n";
    cin>>c2.x;
    cout<<"Enter second point's y coordinate:\n";
    cin>>c2.y;
    cout<<"Distance between the points:"<<distance(c1,c2);
    return 0;
}
```
**OUTPUT:**

![output](/assets/Structures.png)
