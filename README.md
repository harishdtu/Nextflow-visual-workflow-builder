# NextFlow AI

A visual AI workflow builder inspired by [Krea.ai](https://krea.ai), built with Next.js 16, React Flow, and Google Gemini API. Drag, drop, and connect nodes to build powerful AI pipelines — no code required.




##Screenshots 

sample workflow
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b0b6d5a8-d24b-4e8d-bffb-3a1b43b68b00" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1b4cc48a-67ed-48f3-8e2f-15d75e95a315" />



History
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1e45d059-df99-4b8d-a02b-1f687a7fa5f6" />


failed 
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6501518c-c0bb-4311-8a2e-edb5cfdf82cc" />

VideoNode
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c185c59e-ef7b-4e20-aeae-987a877a18bc" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/dc2368ac-b507-48e6-b79c-feeb76a516a9" />

ImageNode
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/dc3717c4-16d5-4590-be48-09ab2cff0263" />

VideoNode and ImageNode
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/34ddd0ee-87ab-486b-a9b0-f9f771b06a8d" />

---

## ✨ Features

- **Visual Canvas** — Drag and drop nodes onto a React Flow canvas with dot grid background, smooth pan/zoom, and MiniMap
- **6 Node Types** — Text, Upload Image, Upload Video, LLM, Crop Image, Extract Frame
- **Gemini API** — Multi-model support (Gemini 2.0 Flash, 2.5 Flash, 2.5 Pro) with multimodal image + text inputs
- **Parallel Execution** — Independent workflow branches run concurrently via `Promise.all`
- **Type-Safe Connections** — Invalid node connections are blocked (e.g. video → text input)
- **Workflow History** — Every run saved to PostgreSQL with per-node execution details
- **Undo / Redo** — Full undo/redo support (Ctrl+Z / Ctrl+Y)
- **Export / Import** — Save and load workflows as JSON files
- **Collapsible Sidebar** — Clean UI with icon-only collapsed mode
- **Authentication** — Clerk-powered sign in/sign up with protected routes
- **Cloudinary** — Video uploads and frame extraction via Cloudinary transformations

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Canvas | React Flow |
| AI | Google Gemini API |
| Auth | Clerk |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Media | Cloudinary |
| Image Processing | Sharp |
| Styling | Tailwind CSS |
| Validation | Zod |
| Deployment | Vercel |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/harishdtus/NextFlow-App.git
cd NextFlow-App
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
# Database
DATABASE_URL="postgres://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Gemini API
GEMINI_API_KEY=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Set up the database

```bash
npx prisma db push
npx prisma generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Sample Workflow — Product Marketing Kit Generator

A pre-built sample workflow is included that demonstrates all 6 node types, parallel execution, and input chaining.

**To load it:**
1. Click **Import** in the toolbar
2. Select `sample-workflow.json` from the project root
3. Upload a product image in the Image node
4. Upload a product video in the Video node
5. Click **Run Workflow**

**What it does:**

```
Branch A (runs in parallel):
  Text Node (system prompt)  ──┐
  Text Node (product details) ──┤──► LLM Node 1 (product description)
  Image Node ──► Crop Node ───┘                    │
                                                    │
Branch B (runs in parallel):                        │
  Video Node ──► Extract Frame ───────────────────┐ │
                                                  ▼ ▼
                              Text Node (tweet prompt) ──► LLM Node 2
                                                              │
                                                              ▼
                                                    Final marketing tweet
```

---

## 🗂 Project Structure

```
├── app/
│   ├── api/
│   │   ├── crop/          # Image cropping with Sharp
│   │   ├── frame/         # Frame extraction with Cloudinary
│   │   ├── history/       # Workflow run history CRUD
│   │   ├── llm/           # Gemini API integration
│   │   └── upload-video/  # Cloudinary video upload
│   ├── dashboard/         # Main canvas page
│   ├── sign-in/           # Clerk auth pages
│   └── sign-up/
├── components/
│   ├── BaseNode.tsx        # Shared node wrapper
│   ├── FlowCanvas.tsx      # Main canvas + workflow engine
│   ├── HistoryPanel.tsx    # Right sidebar
│   └── Sidebar.tsx         # Left sidebar (collapsible)
├── nodes/
│   ├── TextNode.tsx
│   ├── LLMNode.tsx
│   ├── ImageNode.tsx
│   ├── VideoNode.tsx
│   ├── CropNode.tsx
│   └── FrameNode.tsx
├── lib/
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
└── sample-workflow.json    # Pre-built sample workflow
```

---

## 🔑 API Keys Setup

| Service | Link |
|---|---|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) |
| Clerk | [clerk.com](https://clerk.com) |
| Cloudinary | [cloudinary.com](https://cloudinary.com) |
| Neon PostgreSQL | [neon.tech](https://neon.tech) |

---

## 📦 Deployment

The app is deployed on Vercel. To deploy your own:

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy

---

## 📝 License

MIT
