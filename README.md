# Movie Watchlist App

This is a movie watchlist app built with React Native/Expo and Typescript. It is built so that users can view, search and manage movies on their watchlists.

### Tech Stack
**React Native**: UI Library
**Expo**: Framework
**Zustand**: State manager
**Async Storage**: Phone State manager
**Lucide React Native**: Icons manager
**Stylesheet**: Styles manager

### Functionalities
- Pull to refresh
- Optimistic watchlist save udpate
- Offline mode
- Movie search

### How to Run

**Prerequistes**
- Use bun (recommended), or any other package manager
- Ensure you have Expo SDK 54.0.0 or higher installed on your simulator or Expo Go app

**Then;**

1. Clone the app via github

```bash
git clone https://github.com/Franklivania/movie-watchlist-app
```

2. Create an `env.local` at the base of the project

3. Add these keys to the env

```bash
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_API_KEY=
```
the base (api) url is `http://www.omdbapi.com/`. Go there to get your API key

4. Run `bun install` to install all dependencies

5. Run `bunx expo` to start development environment, and follow the instructions to run on your simulator or Expo Go app

### Architectural decisions

- decided to use default stylesheet as the main styling library as Nativewind does not have support for current Expo SDK. Also, it adds no bundle size as it is natively built, and fully flexible

- used netinfo to manage online presence as it is the community maintained, and recommended method to handle offline and online states

- used tanstack query for data fetching and handling for it's roboust usecase. in my implementation, where I implemented near inifinte scroll via optimistic updates via the year, and continual page increase.

- **clear separation of concern and types management**: For this sort of application, it is necessary you do not second guess, hence, the request style, type and method of display is handled to avoid any cases of stale data and manage inconsistencies. leading to clear separation of concerns and marraige for easier use, do that people wpuld be able to use without the application breaking.

- **rendering the data**: by default, OMDb returns items based of queries made to it, via the stipulated query params. this was a hassle as large amounts of data could not be returned once by the API. So, I wrote functionality to render data semi-infinitely based of a chosen query, and auto functionality to continiously load data on scroll, then handling search roboustly with constraits to search term, or movie name.

### Handling persistent logic

For this issue, I decided to use zustand for it's atomic design, and simplistic api. It was easy to sync it to async storage, utilising the proper key, and managing the IDs of already stored content to save it to the user regardless of their online status.

**The Idea**
The issue was to be able to save the wishlist, and users to be able to check out the wishlist, and retain movie display even if they were online. 

**The Solution**
OMDb returns lists with unique ids, so the id is used as the primary key to store the content. This means once the data loads, it checks against what it has at the wishlist to know if the data is there or not then updates the UI to show checked items.

ReactQuery handles a way to be able to cache data, preserving it for offline state, so that regardless of if the user is online, the previous data still remains till connection is made so it updates