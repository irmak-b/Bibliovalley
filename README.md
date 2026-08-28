## 🏰 BIBLIOVALLEY-THE REALM FOR YOUR WHIMSICAL READING EXPERIENCE  ##

**Bibliovalley** is an enchanted web application created to celebrate the beauty of reading, books, and imaginary worlds through a cozy, fantasy RPG interface.

This website has been implemented for to point how important it is, to embrace the beauty of reading, books and the imaginary worlds.

The site's design was developed to create a fantastic atmosphere. In the first, landing page, you will be welcomed by a wise tree that holds hundreds of fairy lights on. One of those fairy lights is the guardian of the valley: **"BIBI"**. 

BIBI-The Guardian of The Valley is a chatbot designed in the form of a wise fairy to guide wanderers visiting the site in their explorations. 

In the exploration wanderers will come across to 4 different side of the walley:

*First* The Reading Tracker, being watched over by friendly frogs. You can compile and review the books you have read on a monthly basis, select a "champion book" for each month, organize your monthly templates, and even share these templates on social media. 
Also The Reading Tracker holds a schedule for to track your daily reading log. You can select how many pages you read in a day!

*Second* Playoffs, the champion books you choose for every month will be displayed in this modal and with your selection, you can decide your favorite book of the year.

*Third* TBR, is the modal where you can list the books you want to read in future with priority selection.

*Fourth* The Map, the real muse for the website. This section is developed in the form of a shop-lined street with a "well" (Scriptorium) in the center. Each of these shops are representing a different genre and the Scriptorium is the place where you customize your book page. With selecting the genre the Parchment you created will be directed to the shop it belongs. And you can check the shop after and even delete the parchement if you want. Every shop is designed as a shelf to hold the parchments of the books you wrote.

***Now it is your turn the come check the valley where scrolls breathe, shops thrive, and legends are transcribed.***


## Architecture and Technology Breakdown of Bibliovalley ##

**1. Technology-Stack**

***Frontend*** <br>
*React.js: Component based SPA Architecture <br>
*Vite: Fast compiling and development <br> 
*Axios: REST API HTTP Client <br>
*Lucide React: Icon Set <br>
*CSS-in-JS:RPG/Cinzel based UI 

***Backend*** <br>
*Node.js & Express.js:RESTFUL API Server and Migration management <br>
*PostgreSQL:Database <br>
*Prisma ORM:Type-safe database modeling and migration management <br>
*@google/genai: Gemini AI SDK <br>
*CORS & Dotenv:Safety and variables 

***External Services*** <br>
*Open Library API

**2. Prisma Database Models**

| Model | Description | Relations |
| :--- | :--- | :--- |
| **`User`** | Stores wanderer accounts, credentials, and guild titles (`guildClass`). | `Shop[]`, `Parchment[]`, `TbrItem[]`, `DailyLog[]`, `MonthlyBook[]`, `FairyMessage[]` |
| **`Shop`** | Represents the 11 genre-based shop coordinates (`positionX`, `positionY`) on the interactive valley map. | Belongs to `User`, has many `Parchment[]` |
| **`Parchment`** | Sealed book reviews, ratings, thoughts, and quotes attached to specific shops. | Belongs to `User` and `Shop` |
| **`TbrItem`** | Reading quest queue entries (`Queue`, `Reading`, `Completed`) on the TBR Scroll. | Belongs to `User` |
| **`DailyLog`** | Daily page reading logs for the dynamic calendar heatmap (`@@unique([userId, year, month, day])`). | Belongs to `User` |
| **`MonthlyBook`** | Books shelved across the 12-month reading vault, including Playoff champions (`isFavorite`). | Belongs to `User` |
| **`FairyMessage`** | Chat logs and enchanted advice exchanged with Bibi, the Library Fairy (`user` / `fairy`). | Belongs to `User` |


***3. Backend API Endpoint List***

System and Authorization: <br>
*GET /api/test-db -> PostgreSQL Data Control <br>
*POST /api/auth/register -> New Wanderer Registration <br>
*POST /api/auth/login -> Sign, Login <br>

BIBI: <br>
*GET /api/fairy/history/:userId -> Brings user's chat with fairy <br>
*POST /api/fairy/chat -> Chat organization <br>

Open Library Proxy: <br>
*GET /api/books/search?q={query} -> Searches on Open Library and gathers the data <br>

Scriptorium, Parchments and Map: <br>
*POST /api/parchments -> Linkes the parchment <br>
*GET /api/shops/:genre/parchments -> Brings the parchments to the related genre shops  <br>
*DELETE /api/parchments/:id -> Deletes the parchments <br>

TBR Scroll: <br>
*GET /api/tbr/:userId -> Brings TBR queue <br>
*POST /api/tbr/add -> Adds the searched book to the queue due to its priority <br>
*PUT /api/tbr/status/:id -> Organized the book status : Queue → Reading → Completed <br>
*DELETE /api/tbr/:id -> Deletes book from the list <br>

Reading Tracker and Playoffs:<br>
*GET /api/tracker/:userId — Returns all books on the shelves for the 12-month period <br>
*POST /api/tracker/add — Places a new book on the shelf for the relevant month <br>
*PUT /api/tracker/favorite — Points the best book of the month as the "Champion" (Playoff contender) <br>
*GET /api/tracker/daily — Returns the user's daily page-reading logs for the calendar heatmap <br>
*POST /api/tracker/daily — Updates the page count for the day clicked on the calendar <br>

Shop & Type Matching (11 Map Zone): <br>
fantasy, scifi, romance, horror, mystery, historical, dystopian, classics, gothic, ya (Young Adult), mythology

<h2> Introduction Video ✨ </h2>





https://github.com/user-attachments/assets/f17ca187-082b-46e4-b1c0-8cc6be72d9f0





Full video is available on my Linkedin. Check it out!











