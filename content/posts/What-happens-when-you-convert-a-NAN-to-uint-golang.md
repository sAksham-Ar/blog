+++
title="What Happens when you convert a NAN to uint in Golang"
date=2025-12-28
description = "This blog describes the result of converting a NAN to Uint in Golang"

[taxonomies]
categories = ["golang"]

[extra]
toc = true
comments = true
+++

# Introduction

Have you ever wondered what happens when you convert a `NAN` in Golang to an `uint64`? I always assumed it would be a big garbage value or 0, but the actual value shocked me.

# The Program

Let's take a simple program in golang which, just outputs this value using `Printf`:

```go
package main

import "fmt"

func main() {
	a := 0.0
	b := 0.0
	fmt.Printf("The result is: %d\n", uint64(a/b))
}
```
# Output

On my laptop:

![output](/assets/laptop-output.png)

This output seems to confirm my assumption of a large garbage value. Let's try to run this again in a vm.

I am using QEMU for creating the VM, following [this](https://www.redhat.com/en/blog/vm-arm64-fedora) guide from Redhat.

And the output is:

![vm-output](/assets/vm-out.png)

**WAIT, WHAT?**

# Explanation

As some people may have guessed, the difference between the two machines is CPU architure. My laptop runs on x86 while the vm runs on ARM64.

I found [this](https://stackoverflow.com/questions/70425809/why-is-uint64-of-nan-and-maxfloat64-equal-in-golang) excellent stack overflow which explains the difference. Essentially, Golang just runs the hardware instruction required for converting `NAN` to `uint` and the value is depended on the CPU architecture.

# How do other languages fare? 

I tried the same with C++ and Rust, to see if they also show the same behaviour,

## C++

The program:

```cpp
#include <cstdint>
#include <cstdio>

int main () {
    double a, b = 0;
    printf("The value is: %d\n", (uint64_t)(a/b));
    return 0;
}
```

Output on my laptop:

![cpp-laptop-output](/assets/cpp-laptop-output.png)

Output on VM:

![cpp-vm-output](/assets/cpp-vm-output.png)

## Rust

The program:

```rust
fn main() {
    let a: f64 = 0.0;
    let b: f64 = 0.0;
    let c = (a/b) as u64;
    println!("The Value is: {}", c);
}
```

Output on my laptop:

![rust-laptop-output](/assets/rust-laptop-output.png)

Output on VM:

![rust-vm-output](/assets/rust-vm-output.png)

# Final Thoughts

Only rust shows same output on both platforms, while cpp and golang have different output.
This is the first time i noticed the output of a golang program changing based on the underlying CPU architecture. 

I find this very suprising given the focus of Simplicity in GO but `NAN` checks may not be there due to performance reasons. We should always avoid `NAN` value in our code as this can lead to undefined behaviour.

If there are any more platform dependent things in golang please feel free to share them in the comments.
