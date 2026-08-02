---
title: Pre and post increment
date: '2020-07-06'
description: An article on Pre and post increment
category: C++
tags:
- C++
toc: true
series: C++ Fundamentals
---

Both the pre(`++a`) and post increment(`a++`) in C++  means `a=a+1;` basically increasing the value of the variable by one but the difference between them is that in pre increment first value of `a` is increased by one then the line is executed whereas in post increment first the line is executed then the value of `a` is increased by one.Same can be said for pre(`--a`) and post decrement(`a--`).

```cpp
#include<iostream>
using namespace std;
int main()
{
    int a=8,b=8,x,y;
    x=++a;
    y=b++;
    cout<<x<<' '<<a<<'\n';
    cout<<y<<' '<<b;
    return 0;
}
```
**OUTPUT:**

![output](/assets/Pre-and-post-increment.png)