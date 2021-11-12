+++
title="Basic Logical Operations"
date=2020-07-14

[taxonomies]
categories = ["C++"]

[extra]
toc = true
comments = true
+++

The are 3 basic logical operations in C++ i.e. `&&`(AND), `||` (OR) and `!`(NOT).AND means that  if and only if both of the statements are true then the result is true, while OR means that if only one of the statements is true then the result is true and NOT just reverses the result.

```cpp
#include<iostream>
using namespace std;
int main()
{
    int a;
    cout<<"Enter the number:\n";
    cin>>a;
    if((a>50)&&(!(a>75)))
    {
        cout<<"The number is between 50 and 75";
    }
    else
    {
        cout<<"The number is not between 50 and 75";
    }
    return 0;
}
```
**OUTPUT:**

![output](/assets/Basic-Logical-Operations.png)
