+++
title="While and do while loop"
date=2020-07-08

[taxonomies]
categories = ["C++"]

[extra]
toc = true
comments = true
+++

In while and do while there is only one statement in the brackets next to `while` ,a condiitonal statement, which specifies when the loop ends.The difference is that in while loop first the condition is checked then the code in the loop is executed whereas in do while loop first the code is executed then it checks the condition.In the do while loop the code executes one even though `i=10`.

```cpp
#include<iostream>
using namespace std;
int main()
{
    int i=0;
    while(i<10)
    {
        cout<<i<<' ';
        i++;
    }
    cout<<'\n';
    do
    {
        cout<<i<<' ';
    }while(i<10);
    return 0;
}
```
**OUTPUT:**

![output](/assets/While-and-do-while-loop.png)