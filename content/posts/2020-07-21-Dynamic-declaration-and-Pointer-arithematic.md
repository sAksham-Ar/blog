+++
title="Dynamic declaration and Pointer arithematic"
date=2020-07-21

[taxonomies]
categories = ["C++"]

[extra]
toc = true
comments = true
+++

Dynamic declaration means that we do not give memory during declaration it gets allocated during execution.This is useful for thins like having an array of user inputted size.We do this using new.When pointer is dynamically allocated as an array it points to the 0th index(first element) of the array.If we add an integer to it it will point to that position in the array.After incrementing it by one ,it will point to first index(second element) of the array.if we put `*` only before the pointer then the value at that posiiton is changed.

```cpp
#include<iostream>
using namespace std;
int main()
{
    int *a,n,i;
    cout<<"enter size\n";
    cin>>n;
    a=new int[n];
    cout<<"Enter the elements:\n";
    for(i=0;i<n;i++)
    {
        cin>>a[i];
    }
    cout<<"The fifth element is:"<<*(a+4)<<"\n";
    cout<<"The fifth element plus 5 is:"<<*(a+4)+5<<"\n";
    a++;
    cout<<"The second element is:"<<*a;
    return 0;
}
```
**OUTPUT:**

![output](/assets/Dynamic-declaration-and-Pointer-arithematic.png)
