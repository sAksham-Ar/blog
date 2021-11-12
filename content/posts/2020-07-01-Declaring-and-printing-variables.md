+++
title="Declaring and printing variables"
date=2020-07-01

[taxonomies]
categories = ["C++"]

[extra]
toc = true
comments = true
+++

Today we will learn how to declare and print variables in C++. In C++, variables can basically  be declared of four types namely `int`,`char`,`double` and `float`.`int` is for integers,`char` for characters,`float` for decimals and `double` for decimals with higher precision and range.`int x` declares a variable `x` of type `int`. `x=10` assigns the value of 10 to x.Then we use `cout` to print the value of x.

```cpp
#include<iostream>
using namespace std;
int main()
{
    int x;
    x=10;
    cout<<"x="<<x;
    return 0;
}
```
**OUTPUT:**

![output](/assets/Declaring-and-printing-variables.png)