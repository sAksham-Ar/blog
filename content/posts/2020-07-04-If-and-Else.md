+++
title="If and Else"
date=2020-07-04

[taxonomies]
categories = ["C++"]

[extra]
toc = true
comments = true
+++

The way `if` works in C++ is that we put a condition in bracket  if that is satisfied the code in `if` executes otherwise if `else` is there its code executes.If there is no `else` present then nothing happens.Relational operators in C++ are `>`(greater than),`<`(less than),`>=`(greater than or equal to),`<=`(less than or equal to),`==`(equal to),`!=`(not equal to).

```cpp
#include<iostream>
using namespace std;
int main()
{
    int x;
    cout<<"enter the number:\n";
    cin>>x;
    if(x>=10)
    {
        cout<<"The number is greater than or equal to 10\n";
    }
    else
    {
        cout<<"The number is less than 10";
    }
    return 0;
}
```
**OUTPUT:**

![output](/assets/If-and-Else.png)