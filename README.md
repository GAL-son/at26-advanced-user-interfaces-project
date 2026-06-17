# ACSM Portal

ACSM Portal is an advanced platform for visualizing ELO rankings for drivers competing on Assetto Corsa servers. The project aims to increase community engagement through transparent statistics and progress tracking.

## Demo Link
[Coming Soon - add your Vercel deployment link here]

## Technologies
The project was built using a modern technology stack:
* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **UI Components:** [MUI v9](https://mui.com/)
* **Animations:** [Framer Motion](https://www.framer.com/)
* **Validation:** [Zod](https://zod.dev/)
* **Internationalization:** i18n

## Getting Started

### 1. Environment Configuration
Create a `.env` file in the root directory of the project based on the following schema:

```env
# Link to your local SQLITE DB
DATABASE_URL="file:./dev.db"

# List of ACSM servers that will be used to fetch results separated with coma `,`
ACSM_SERVERS="server1,server2"

# List of ACSM servers that player can register from
NEXT_PUBLIC_ACSM_SERVERS_LIST="server1,server2"

# Optional discord server link
NEXT_PUBLIC_DISCORD_LINK="https://discord.gg"
```

### 2. Database Seeding
To initialize the data, run the sync script:

Windows (PowerShell):

```powershell
npx dotenv -e .env -- npx ts-node --esm src/scripts/full-sync.mts
```

Linux/macOS (Bash):

```Bash
npx dotenv -e .env -- npx ts-node --esm src/scripts/full-sync.mts
```

### 3. Local Development

```Bash
npm install
npm run dev
```

### 4. Building and Running Production Locally
```Bash
npm run build
npm run start
```

## UX Notes
### User Persona
**Primary User**: "Enthusiast Driver". A person participating in Assetto Corsa leagues who wants to track their progress (ELO), analyze recent race results, and monitor their improvements compared to other competitors.

**Needs:** Data clarity (result tables), fast access to information, sense of competition.

**Pain Points:** Lack of such functionality in the standard ACSM interface.

### UI/UX Design Rationale
**MUI v9 + Tailwind v4:** The combination of proven MUI components (accessibility, ready-made patterns) with the flexibility and speed of Tailwind v4 allows for creating an interface that is both professional and unique.

**Framer Motion:** Used for smooth transitions between ranking views, which reduces cognitive load when switching between statistics.

**Zod:** Applied on the client side to ensure "Type-Safety", minimizing the risk of errors when processing complex ELO data.

### Reference to Best Practices
**Nielsen's Heuristics:**

System Status Visibility: The user always sees which server they are currently viewing data from.

Aesthetic and Minimalist Design: Tailwind CSS v4 was used to remove unnecessary decorations, focusing attention on tabular data.

**UCD (User Centered Design):** Prioritization of "main actions" – The homepage displays quick actions that a competitor might want to access:
* 2 most recent events
* Top of the ranking list
* Virtual matchups

**Observations:** In the simracing community, response time is key. Therefore, Server-Side Rendering (Next.js) was applied for instant display of results, avoiding long data loading screens in the browser.

### Collaboration and Development
The project was realized with active participation from members of the [Night School Racing](https://nightschool.gg) community. Their feedback was crucial for the final shape of the functionality. The scope of the application is open and will be successively expanded based on community suggestions and needs.