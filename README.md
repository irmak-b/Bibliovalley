🏰 BIBLIOVALLEY-THE REALM FOR YOUR WHIMSICAL READING EXPERIENCE
Bibliovalley is an enchanted web application created to celebrate the beauty of reading, books, and imaginary worlds through a cozy, fantasy RPG interface.

This website has been implemented for to point how important it is, to embrace the beauty of reading, books and the imaginary worlds.

The site's design was developed to create a fantastic atmosphere. In the first, landing page, you will be welcomed by a wise tree that holds hundreds of fairy lights on. One of those fairy lights is the guardian of the valley: "BIBI".

BIBI-The Guardian of The Valley is a chatbot designed in the form of a wise fairy to guide wanderers visiting the site in their explorations.

In the exploration wanderers will come across to 4 different side of the walley:

First The Reading Tracker, being watched over by friendly frogs. You can compile and review the books you have read on a monthly basis, select a "champion book" for each month, organize your monthly templates, and even share these templates on social media. Also The Reading Tracker holds a schedule for to track your daily reading log. You can select how many pages you read in a day!

Second Playoffs, the champion books you choose for every month will be displayed in this modal and with your selection, you can decide your favorite book of the year.

Third TBR, is the modal where you can list the books you want to read in future with priority selection.

Fourth The Map, the real muse for the website. This section is developed in the form of a shop-lined street with a "well" (Scriptorium) in the center. Each of these shops are representing a different genre and the Scriptorium is the place where you customize your book page. With selecting the genre the Parchment you created will be directed to the shop it belongs. And you can check the shop after and even delete the parchement if you want. Every shop is designed as a shelf to hold the parchments of the books you wrote.

Now it is your turn the come check the valley where scrolls breathe, shops thrive, and legends are transcribed.

Architecture and Technology Breakdown of Bibliovalley
1. Technology-Stack

Frontend
*React.js: Component based SPA Architecture
*Vite: Fast compiling and development
*Axios: REST API HTTP Client
*Lucide React: Icon Set
*CSS-in-JS:RPG/Cinzel based UI

Backend
*Node.js & Express.js:RESTFUL API Server and Migration management
*PostgreSQL:Database
*Prisma ORM:Type-safe database modeling and migration management
*@google/genai: Gemini AI SDK
*CORS & Dotenv:Safety and variables

External Services
*Open Library API

2. Prisma Database Models

Model	Description	Relations
User	Stores wanderer accounts, credentials, and guild titles (guildClass).	Shop[], Parchment[], TbrItem[], DailyLog[], MonthlyBook[], FairyMessage[]
Shop	Represents the 11 genre-based shop coordinates (positionX, positionY) on the interactive valley map.	Belongs to User, has many Parchment[]
Parchment	Sealed book reviews, ratings, thoughts, and quotes attached to specific shops.	Belongs to User and Shop
TbrItem	Reading quest queue entries (Queue, Reading, Completed) on the TBR Scroll.	Belongs to User
DailyLog	Daily page reading logs for the dynamic calendar heatmap (@@unique([userId, year, month, day])).	Belongs to User
MonthlyBook	Books shelved across the 12-month reading vault, including Playoff champions (isFavorite).	Belongs to User
FairyMessage	Chat logs and enchanted advice exchanged with Bibi, the Library Fairy (user / fairy).	Belongs to User
3. Backend API Endpoint List

System and Authorization:
*GET /api/test-db -> PostgreSQL Data Control
*POST /api/auth/register -> New Wanderer Registration
*POST /api/auth/login -> Sign, Login

BIBI:
*GET /api/fairy/history/:userId -> Brings user's chat with fairy
*POST /api/fairy/chat -> Chat organization

Open Library Proxy:
*GET /api/books/search?q={query} -> Searches on Open Library and gathers the data

Scriptorium, Parchments and Map:
*POST /api/parchments -> Linkes the parchment
*GET /api/shops/:genre/parchments -> Brings the parchments to the related genre shops
*DELETE /api/parchments/:id -> Deletes the parchments

TBR Scroll:
*GET /api/tbr/:userId -> Brings TBR queue
*POST /api/tbr/add -> Adds the searched book to the queue due to its priority
*PUT /api/tbr/status/:id -> Organized the book status : Queue → Reading → Completed
*DELETE /api/tbr/:id -> Deletes book from the list

Reading Tracker and Playoffs:
*GET /api/tracker/:userId — Returns all books on the shelves for the 12-month period
*POST /api/tracker/add — Places a new book on the shelf for the relevant month
*PUT /api/tracker/favorite — Points the best book of the month as the "Champion" (Playoff contender)
*GET /api/tracker/daily — Returns the user's daily page-reading logs for the calendar heatmap
*POST /api/tracker/daily — Updates the page count for the day clicked on the calendar

Shop & Type Matching (11 Map Zone):
fantasy, scifi, romance, horror, mystery, historical, dystopian, classics, gothic, ya (Young Adult), mythology
