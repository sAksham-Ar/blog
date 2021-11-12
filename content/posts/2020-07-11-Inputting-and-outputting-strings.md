+++
title="Inputting and outputting Strings"
date=2020-07-11

[taxonomies]
categories = ["C++"]

[extra]
toc = true
comments = true
+++

A string is basicallly a character array, it is written in double quotes.The end of the string is represented by `\0`.We can input a string by inputting it character by character or straight using cin or getline.The difference is in cin you cannot take spaces.Getline is from the strings library.for getline the variable must be declared as string which is also from the strings library while cin can use character arrays like:

```cpp
int word[80]
cin>>word
```
```cpp
#include<iostream>
#include<string>
using namespace std;
int main()
{
    int i;
    string word;
    getline(cin,word);
    for(i=0;word[i]!='\0';i++)
    {
        cout<<word[i];
    }
    return 0;
}
```
**OUTPUT:**

![output](/assets/Inputting-and-outputting-strings.png)