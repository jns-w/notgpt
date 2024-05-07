# NotGPT: Blazing-Fast Autocomplete with Rust and In-Memory Trie

Github: [https://github.com/jns-w/notgpt](https://github.com/jns-w/notgpt)\
Demo site: [https://notgpt.jonaswong.dev](https://notgpt.jonaswong.dev)

![](https://res.cloudinary.com/ds1s8ilcc/image/upload/v1706968350/Devsite/notgpt/Notgpt-main_p98wko.png)

> #### Backend Stack:
>
> - Rust
> - Actix
>
> #### Frontend Stack:
>
> - React, Vite
> - Framer Motion
> - Jotai
> - Sass

While studying algorithms, I came across many fascinating data structures that were both intriguing and satisfying to implement. However, after a while, I realized that repeatedly using them in sandboxed environments and solving coding challenges felt incomplete. I wanted to apply these structures to real-world problems.

## Goals

The primary goal of this project was to leverage algorithmic concepts to solve a practical problem. I decided to put myself in the shoes of a Google engineer during the company's founding years, tasked with implementing autocomplete suggestions for the search bar from scratch.
\
\
On the frontend, a simple search bar would serve as the interface for executing the concept. However, on the backend, a low-level, high-performance language would power the autocomplete functionality efficiently.

## Rustlang for backend

Rust, the multi-year voted favorite language, is renowned for its blazing speed and performance. It also boasts excellent libraries for serving APIs, such as [Actix](https://actix.rs/). Coupled with my desire to explore Rust, it became the natural choice for this project.

### In-memory database

Running a low-level language like Rust is excellent for performance, but accessing suggestion strings via a traditional storage database would bottleneck that performance, defeating the project's purpose. To optimize for speed, I created an in-memory database.

### Prefix Trie

The trie data structure is perfect for solving this problem. It's one of the most efficient ways to search for prefixes, and with some additional work, it's also possible to store auxiliary data like search counts to sort results.

![](https://res.cloudinary.com/ds1s8ilcc/image/upload/v1709875251/Devsite/notgpt/notgpt-trie-impl01_laym6r.png)

## Client

![](https://res.cloudinary.com/ds1s8ilcc/image/upload/v1709874471/Devsite/notgpt/notgpt-searchbar01_oblb7f.gif)

The frontend is a simple React app with a search bar that sends requests to the backend. The results are then displayed in a dropdown, allowing users to select a suggestion. Using framer motion, the dropdown elegantly animates in and out, creating a smooth and satisfying user experience.

> #### Possible improvements
>
> - Periodic snapshots to store the trie in persistent storage
> - Trending suggestions feature

Thank you for reading! To see my other works, do check out my portfolio [here](https://jonaswong.dev).
