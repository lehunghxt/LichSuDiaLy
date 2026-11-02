# MASTER PROMPT — BUILD INTERACTIVE VIETNAM HISTORY & GEOGRAPHY LEARNING WEBSITE

## ROLE

You are a Senior Frontend Architect, Senior React Engineer, UI/UX Designer, and Educational Product Designer.

Your task is to design and implement a production-ready educational website for Vietnamese primary school students.

Project name: **EM KHÁM PHÁ LỊCH SỬ VÀ ĐỊA LÍ VIỆT NAM**

Target users:
- Vietnamese Grade 4 students (approximately 9–10 years old)
- Primary school teachers
- Parents supporting children at home

Primary language: Vietnamese.

All interfaces, navigation, instructions, quizzes, error messages, and educational content must use natural, age-appropriate Vietnamese with correct spelling and diacritics.

The website must be simple, attractive, interactive, responsive, educationally accurate, maintainable, and extensible.

---

# 1. CORE REQUIREMENTS

Build the entire project using:

- ReactJS
- TypeScript with strict typing
- TSX components
- Vite
- Tailwind CSS
- React Router
- Leaflet and React Leaflet
- GeoJSON
- Lucide React
- Static JSON files
- LocalStorage for local progress tracking
- Vitest and React Testing Library for testing

Use current stable, mutually compatible versions of dependencies. Verify APIs and configuration against the installed versions.

IMPORTANT RESTRICTIONS:

1. The website must be a fully static web application.
2. DO NOT implement any backend.
3. DO NOT implement ASP.NET Core, Node.js API, Express, NestJS, or other API servers.
4. DO NOT use SQL Server, PostgreSQL, MongoDB, Firebase, Supabase, or external databases.
5. DO NOT require user authentication.
6. DO NOT require server-side rendering.
7. DO NOT require runtime secrets or private API keys.
8. All core educational data must work using local static files.
9. The website must build into a static `dist` directory.
10. The website must support deployment to Cloudflare Pages, Netlify, Vercel, or GitHub Pages.

Prefer simple architecture over unnecessary abstractions.

Do not introduce Redux, React Query, Zustand, or other state-management libraries unless there is a clear technical reason.

React state, Context API, custom hooks, and pure TypeScript utilities should be sufficient.

---

# 2. EDUCATIONAL OBJECTIVE

Create a digital learning experience where students explore Vietnamese history and geography through interactive maps.

The initial version must focus on:

**Vùng Trung du và miền núi Bắc Bộ**

Students should be able to:

1. View a map of Vietnam.
2. Identify the Northern Midlands and Mountains region.
3. Click the region to explore its characteristics.
4. Explore selected provinces, locations, and geographical features.
5. Discover festivals, cultural traditions, minerals, landscapes, and historical sites.
6. Read short educational explanations.
7. View images and listen to optional narration.
8. Answer interactive questions.
9. Receive immediate feedback.
10. Review their learning progress.

Content must be suitable for Grade 4 and aligned with the applicable Vietnamese primary-school History and Geography curriculum.

Do not blindly equate current administrative provinces with geographical regions presented in textbooks.

Administrative geography and textbook regions must be modeled separately.

Ensure data can support the current 34-province/city administrative structure while preserving academically appropriate regional geography.

Use verified geographical datasets and authoritative educational sources. Do not fabricate geographical boundaries, coordinates, facts, festival origins, or historical information.

If a required source is unavailable, implement an honest placeholder and clearly document what needs verification.

---

# 3. APPLICATION PAGES

Implement the following pages.

## 3.1. HOME PAGE

Route: `/`

Display:

- Website name
- Friendly educational introduction
- Vietnam-themed illustrations
- Main action: "Bắt đầu khám phá"
- Featured learning region
- Featured learning topics
- Navigation to interactive map
- Navigation to quizzes
- Learning progress summary

Suggested layout:

Hero section:
"EM KHÁM PHÁ LỊCH SỬ VÀ ĐỊA LÍ VIỆT NAM"

Subtitle:
"Cùng khám phá những vùng đất, danh lam thắng cảnh và nét đẹp văn hóa của quê hương!"

Primary action:
"Khám phá bản đồ"

Secondary action:
"Thử tài kiến thức"

Design must appeal to Grade 4 students without looking childish or cluttered.

## 3.2. INTERACTIVE MAP PAGE

Route: `/explore`

This is the most important feature.

Display a full interactive map of Vietnam.

Requirements:

- Show Vietnam's geographical outline.
- Highlight the Northern Midlands and Mountains region.
- Allow students to select the region.
- Support zoom and pan.
- Provide reset map action.
- Show selected region information.
- Display markers for educational locations.
- Provide visual hover and click feedback.
- Support desktop, tablet, and mobile devices.

When a region is selected:

1. Update selected region state.
2. Highlight the selected polygon.
3. Focus the map on the selected region.
4. Display the region's name.
5. Display its educational content categories.
6. Show relevant location markers.
7. Allow students to explore each marker.

Content categories:

- Đặc điểm tự nhiên
- Lễ hội và văn hóa
- Khoáng sản
- Danh lam thắng cảnh
- Di tích lịch sử

Build a region-focused MVP, but design the application to support other Vietnamese regions later.

## 3.3. REGION DETAIL PAGE

Route: `/regions/:regionId`

Display:

- Region name
- Short introduction
- Regional map
- Natural characteristics
- Representative festivals
- Mineral resources
- Landscapes
- Historical sites
- Image gallery
- Related quizzes

Use cards, tabs, or a similarly simple navigation mechanism.

Avoid long blocks of academic text.

Provide concise explanations appropriate for primary school students.

## 3.4. LOCATION DETAIL

Route: `/locations/:locationId`

Each geographical or cultural location must have:

- Title
- Category
- Region
- Province if applicable
- Coordinates if appropriate
- Verified short description
- Image gallery
- Optional narration audio
- Related educational facts
- Back-to-map action

Location categories must be strongly typed.

Suggested categories:

- FESTIVAL
- MINERAL
- LANDMARK
- HISTORICAL_SITE
- CULTURE
- NATURAL_FEATURE

Only display fields that are relevant to the location category.

For example, a festival does not need the same detail layout as a mineral deposit.

## 3.5. QUIZ PAGE

Route: `/quiz`

Implement an interactive quiz system.

Initial question types:

1. Single-choice multiple choice
2. True/False
3. Map location identification

Quiz requirements:

- Vietnamese questions
- Four answer options for multiple-choice questions
- Only one correct answer per single-choice question
- Immediate answer feedback
- Explanation after answering
- Question progress indicator
- Final score
- Restart quiz
- Review incorrect answers
- LocalStorage result persistence

Use encouraging educational feedback.

Correct answer:
"Chính xác! Em đã trả lời đúng."

Incorrect answer:
"Em hãy cùng tìm hiểu lại nội dung này nhé!"

Do not use negative, humiliating, or discouraging feedback.

Map-identification questions must use verified geographical targets.

Do not use fabricated boundaries or approximate clickable areas as if they were accurate.

## 3.6. LEARNING PROGRESS PAGE

Route: `/progress`

Display:

- Number of explored locations
- Completed quizzes
- Most recent score
- Best score
- Completion percentage for available learning content
- Recently viewed locations

Persist progress using LocalStorage.

Progress belongs to the current browser/device only.

Do not claim that progress is synchronized across devices.

Implement an option to clear locally stored learning progress with confirmation.

---

# 4. UI/UX DESIGN SYSTEM

Target audience: Primary school Grade 4.

Visual direction:

- Bright but harmonious colors
- Clean layout
- Friendly illustrations
- Large interaction targets
- Clear Vietnamese typography
- Responsive cards
- Rounded corners
- Subtle animations
- Consistent spacing
- Easy navigation

Suggested color palette:

Primary: #2563EB
Secondary: #16A34A
Accent: #F59E0B
Background: #F8FAFC
Text: #1E293B
Surface: #FFFFFF

Use a Vietnamese-compatible font, preferably Be Vietnam Pro.

Requirements:

- Minimum comfortable text size for children.
- Buttons large enough for touch interaction.
- Clear visual hierarchy.
- Text labels alongside important icons.
- Good color contrast.
- Visible keyboard focus states.
- Support keyboard navigation.
- Use semantic HTML.
- Provide accessible labels for interactive components.
- Respect `prefers-reduced-motion`.
- Avoid animations that cause distraction.

Responsive breakpoints:

- Mobile
- Tablet
- Desktop

Desktop map layout:

Left side: Interactive map

Right side: Selected region details and learning categories

Mobile map layout:

Map occupies available width.

Selected content appears below the map or inside an accessible bottom sheet.

Do not allow map interaction to make page navigation unusable on mobile.

---

# 5. MAP ARCHITECTURE

Use Leaflet, React Leaflet, and GeoJSON.

Create reusable components:

- VietnamMap
- RegionLayer
- ProvinceLayer
- LocationMarkers
- MapControls
- MapLegend
- MapInformationPanel
- MapLoadingState
- MapErrorState

Implement the following interactions:

## 5.1. Region Selection

When a student clicks the Northern Midlands and Mountains region:

- Highlight the region
- Update selected region
- Show region information
- Display regional educational markers
- Fit the map to region bounds

## 5.2. Province Selection

Support selecting province polygons if verified province boundaries are available.

When selected:

- Highlight the province
- Show province name
- Filter related locations
- Display available educational content

Province selection must not depend on hardcoded screen coordinates.

## 5.3. Location Selection

Display map markers for educational locations.

When clicking a marker:

- Open a concise popup
- Display location name
- Display category
- Show thumbnail when available
- Provide action to open location details

## 5.4. Map State

Define state for:

- Selected region
- Selected province
- Selected location
- Active content category
- Current zoom level if necessary

Avoid duplicating state unnecessarily.

Use type-safe React hooks.

## 5.5. IMPORTANT GEOJSON REQUIREMENTS

Use real GeoJSON datasets with documented sources.

Do not invent GeoJSON coordinates.

Do not use fake geographical polygons in the production map.

Separate:

- Geographical region polygons
- Administrative province polygons
- Educational location markers

Document:

- Data source
- Data version
- Administrative reference date
- Geographic coordinate system
- License
- Known limitations

Prefer WGS84 longitude/latitude coordinates.

Avoid displaying incorrect administrative boundaries.

If reliable GeoJSON is not yet available, provide a clearly labeled loading/unavailable state and document the integration process.

Core map functionality must not depend on external commercial map APIs. Leaflet and locally hosted vector datasets should provide the main experience.

Optional online map tiles may be used only if the provider's terms, attribution requirements, and usage policy are respected.

---

# 6. CONTENT DATA ARCHITECTURE

All educational content must be maintained separately from React components.

Use JSON files and TypeScript interfaces.

Suggested data files:

- regions.json
- provinces.json
- festivals.json
- minerals.json
- landmarks.json
- historical-sites.json
- quizzes.json

Suggested TypeScript models:

```ts
export type ContentCategory =
  | "festival"
  | "mineral"
  | "landmark"
  | "historical_site"
  | "culture"
  | "natural_feature";

export interface LearningRegion {
  id: string;
  name: string;
  description: string;
  image?: string;
  provinceIds: string[];
}

export interface LearningLocation {
  id: string;
  title: string;
  category: ContentCategory;
  regionId: string;
  provinceId?: string;
  description: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  audioUrl?: string;
  facts: string[];
  sources?: string[];
}

export interface QuizQuestion {
  id: string;
  regionId: string;
  question: string;
  type: "single_choice" | "true_false" | "map";
  options?: string[];
  correctAnswer: string;
  explanation: string;
}
```

These models are a starting point.

Refine them where necessary while maintaining strict typing.

Create a centralized data repository layer.

Example methods:

- getAllRegions
- getRegionById
- getLocationsByRegion
- getLocationsByCategory
- getLocationById
- getQuizQuestionsByRegion

The repository layer must read from local static data.

Do not introduce HTTP API endpoints for local content.

Do not over-engineer generic repository interfaces.

Validate loaded JSON data where it meaningfully prevents runtime errors.

Do not use `any` or unsafe type assertions to silence TypeScript errors.

---

# 7. INITIAL EDUCATIONAL CONTENT

Focus on the Northern Midlands and Mountains region.

Content groups:

## 7.1. NATURAL CHARACTERISTICS

Topics:

- Geographical position
- Mountains and hills
- Rivers
- Climate
- Terraced fields
- Relationship between natural conditions and people's lives

## 7.2. FESTIVALS AND CULTURE

Potential topics to verify:

- Lễ hội Lồng Tồng
- Nghệ thuật Xòe Thái
- Representative cultural activities of local ethnic communities

## 7.3. MINERAL RESOURCES

Potential topics to verify:

- Coal
- Iron
- Copper
- Other minerals specifically discussed by the applicable Grade 4 curriculum

## 7.4. LANDMARKS

Potential topics to verify:

- Sa Pa
- Ruộng bậc thang Mù Cang Chải
- Cao nguyên đá Đồng Văn
- Other appropriate northern geographical sites

## 7.5. HISTORICAL SITES

Add representative historical sites only after verifying their geographical location, significance, and relevance to the lesson.

IMPORTANT:

These are candidate topics, not automatically approved educational content.

Verify each item against authoritative sources and relevant textbooks before marking it as production content.

Do not fabricate coordinates, descriptions, images, or attributions.

Each educational item should contain:

- A short introduction
- Important facts
- Image if legally usable
- Geographical location where applicable
- Relevant learning objective
- Reference/source information

Keep writing understandable to Grade 4 students.

---

# 8. LOCAL LEARNING PROGRESS

Implement LocalStorage persistence.

Suggested storage key:

`vn-history-geography-progress-v1`

Suggested model:

```ts
export interface LearningProgress {
  version: number;
  exploredLocationIds: string[];
  completedQuizIds: string[];
  quizResults: QuizResult[];
  lastVisitedLocationId?: string;
}
```

Define `QuizResult` with typed fields for quiz ID, score, question count, completion date, and related information.

Requirements:

- Safe JSON parsing
- Handle missing storage
- Handle corrupted storage
- Handle restricted storage access
- Version stored data
- Avoid redundant writes
- Reset progress safely
- Keep persistence logic separate from UI components

Do not store sensitive student information.

---

# 9. CODE ARCHITECTURE

Use feature-based organization.

Suggested structure:

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/
├── components/
│   ├── ui/
│   └── layout/
├── features/
│   ├── map/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── regions/
│   ├── locations/
│   ├── quiz/
│   └── progress/
├── pages/
├── data/
├── hooks/
├── lib/
├── types/
├── styles/
└── main.tsx

public/
├── maps/
├── images/
├── audio/
└── data/
```

Architecture principles:

1. Separation of concerns.
2. Single responsibility.
3. Reusable components.
4. Strong TypeScript typing.
5. Minimal dependencies.
6. Easy unit testing.
7. Easy data extension.
8. No duplicated business logic.
9. No unnecessary abstractions.
10. No circular dependencies.

Recommended component rules:

- Keep page components focused on composition.
- Extract complex map logic into hooks.
- Extract pure calculations into utilities.
- Keep data querying outside visual components.
- Avoid giant components.
- Avoid excessive prop drilling.
- Use React Context only when justified.
- Use stable IDs for rendered lists.

When implementing React Leaflet, account for the fact that some GeoJSON props are not dynamically reapplied after initialization. Use a reliable approach for changing active GeoJSON datasets, selections, and styles.

---

# 10. PERFORMANCE REQUIREMENTS

Optimize for typical school computers, tablets, and smartphones.

Requirements:

- Use route-level code splitting.
- Lazy-load heavy map functionality.
- Lazy-load images.
- Avoid rendering unnecessary markers.
- Minimize re-renders.
- Compress and simplify GeoJSON without losing necessary boundary accuracy.
- Use appropriately sized image assets.
- Prefer WebP/AVIF where supported.
- Avoid expensive calculations during render.
- Cache static educational data in memory when appropriate.
- Clean up event listeners.
- Avoid memory leaks.
- Keep JavaScript bundles reasonably small.

Do not add Redis or server-side caching.

Consider marker clustering only if the number of markers makes it necessary.

Evaluate performance using production builds, not only the development server.

---

# 11. ERROR HANDLING

Handle the following cases:

1. GeoJSON loading failure
2. Invalid GeoJSON
3. Missing region ID
4. Missing location ID
5. Missing images
6. Missing audio
7. Empty content category
8. Corrupted LocalStorage
9. Unsupported browser features
10. Invalid quiz data
11. Unknown application routes
12. Network unavailable when optional external assets are used

Provide friendly Vietnamese messages.

Never leave the UI as a blank white screen.

Create reusable empty states and error states.

Ensure essential educational content remains usable if optional images, narration, or external map tiles fail.

---

# 12. TESTING STRATEGY

Set up:

- Vitest
- React Testing Library
- ESLint
- TypeScript checking

Test at minimum:

## Data layer

- Region lookup
- Location filtering
- Invalid IDs
- Missing data
- JSON validation

## Quiz engine

- Correct answer evaluation
- Score calculation
- Quiz completion
- Restart behavior
- Incorrect answer review

## LocalStorage

- Initial state
- Save progress
- Load progress
- Corrupted data recovery
- Reset progress

## UI

- Region selection
- Category selection
- Location detail display
- Empty states
- Invalid routes
- Keyboard interactions for essential controls

Use mocks appropriately for browser-dependent Leaflet behavior.

Do not rely exclusively on snapshots.

---

# 13. SEO AND STATIC DEPLOYMENT

Configure:

- Appropriate page title
- Vietnamese meta description
- Favicon
- Open Graph metadata where useful
- Accessible document language
- SPA route fallback
- Production build optimization
- Correct Vite base path configuration

Ensure compatibility with:

- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages

Document that GitHub Pages may require a suitable routing strategy or fallback handling for direct navigation to nested routes.

Static hosting must not require running a Node.js backend.

---

# 14. IMPLEMENTATION PLAN

Implement the project in clear phases.

## PHASE 1 — PROJECT SETUP

Tasks:

1. Initialize React + Vite + TypeScript.
2. Configure TypeScript strict mode.
3. Configure Tailwind CSS.
4. Configure ESLint.
5. Configure React Router.
6. Configure folder structure.
7. Create design tokens.
8. Create shared layout.
9. Verify development/build commands.

Deliverables:

- Running application
- Working navigation
- Responsive base layout
- Passing type check

## PHASE 2 — STATIC DATA LAYER

Tasks:

1. Define TypeScript models.
2. Create static JSON data structure.
3. Add content query utilities.
4. Add appropriate data validation.
5. Document data source requirements.
6. Prepare regional and province GeoJSON integration.

Deliverables:

- Typed data models
- Centralized local content access
- Safe missing-data handling

## PHASE 3 — INTERACTIVE VIETNAM MAP

Tasks:

1. Integrate Leaflet.
2. Load verified Vietnam GeoJSON.
3. Render geographical regions.
4. Highlight Northern Midlands and Mountains.
5. Implement region selection.
6. Implement province selection where valid data exists.
7. Add educational location markers.
8. Add popup and information panel.
9. Add zoom and reset controls.
10. Implement responsive map behavior.

Deliverables:

- Interactive map
- Working region selection
- Working educational markers
- Accurate displayed locations

## PHASE 4 — EDUCATIONAL CONTENT

Tasks:

1. Implement category navigation.
2. Implement region detail.
3. Implement location detail.
4. Implement image gallery.
5. Add optional audio player.
6. Implement related content navigation.
7. Verify content presentation on mobile.

Deliverables:

- Complete regional exploration experience

## PHASE 5 — QUIZ SYSTEM

Tasks:

1. Build typed quiz engine.
2. Implement single-choice questions.
3. Implement True/False questions.
4. Implement map-identification questions where reliable map targets exist.
5. Add instant feedback.
6. Add scoring.
7. Add result screen.
8. Add retry and review features.

Deliverables:

- Functional interactive educational quizzes

## PHASE 6 — LEARNING PROGRESS

Tasks:

1. Implement LocalStorage service.
2. Track explored locations.
3. Track completed quizzes.
4. Track quiz scores.
5. Implement progress dashboard.
6. Add reset functionality.

Deliverables:

- Persistent learning progress per browser

## PHASE 7 — OPTIMIZATION AND TESTING

Tasks:

1. Add unit tests.
2. Add component tests.
3. Fix TypeScript errors.
4. Fix ESLint errors.
5. Optimize images.
6. Optimize GeoJSON delivery.
7. Test responsive layouts.
8. Test keyboard interaction.
9. Validate production build.
10. Review educational content quality.

Deliverables:

- Stable, maintainable production build

## PHASE 8 — DEPLOYMENT

Tasks:

1. Configure Vite production build.
2. Configure SPA route fallback.
3. Add deployment documentation.
4. Validate built asset paths.
5. Prepare production checklist.

Deliverables:

- Static deployment-ready `dist`
- README
- Deployment guide

---

# 15. DEFINITION OF DONE

The project is considered complete when:

- ReactJS + TypeScript application runs successfully.
- Strict TypeScript checking passes.
- Production build passes.
- Vietnam map renders using verified map data.
- Northern Midlands and Mountains can be selected.
- Students can explore relevant content.
- Location details render correctly.
- Quizzes calculate scores correctly.
- Learning progress persists locally.
- Responsive layouts work.
- Basic accessibility requirements are met.
- No backend or database is needed.
- No fabricated geographical datasets are used.
- Important tests pass.
- Static deployment is documented.

If external map or educational assets are unavailable, report the missing assets transparently rather than pretending they are complete.

---

# 16. CODING AG