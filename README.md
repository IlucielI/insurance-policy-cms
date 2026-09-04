# Insurance Policy Admin CMS

Admin panel untuk mengelola produk asuransi dan review aplikasi policy, dibangun menggunakan Next.js 14 dengan App Router dan Tailwind CSS.

## 🏗️ Tech Stack

- **Next.js 14** (App Router, Server-Side Rendering)
- **React 18** dengan TypeScript
- **Tailwind CSS** untuk styling
- **Drag & Drop** (HTML5 native API)

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- npm atau yarn

### 1. Clone Repository

```bash
git clone https://github.com/IlucielI/insurance-policy-cms.git
cd insurance-policy-cms
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Setup Environment Variables

Copy `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 4. Run Development Server

```bash
npm run dev
# atau
yarn dev
```

Aplikasi akan jalan di `http://localhost:3001`

### 5. Build for Production

```bash
npm run build
npm run start
# atau
yarn build
yarn start
```

## 📱 Pages & Features

### 🔐 Login Page (`/`)
- Email & password authentication UI
- "Remember me" checkbox
- Redirect to dashboard after login
- **Note**: Full auth implementation in progress (UI ready)

### 📊 Dashboard (`/dashboard`)
**Stats Cards (4 cards):**
- Total Applications (156)
- Active Products (12)
- Monthly Revenue (Rp 45.2M)
- Approval Rate (78%)

**Recent Applications Table:**
- Last 5 applications
- Columns: Application #, Name, Product, Premium, Status, Date
- Quick status badges (color-coded)

**Applications Trend Chart:**
- Line chart showing last 7 days
- Mock data visualization

### 📦 Product CRUD (`/dashboard/products`)
**Features:**
- **Grid View**: Product cards dengan category icons
- **Add Product**: Modal form
  - Nama produk
  - Kategori (Jiwa, Kesehatan, Kendaraan)
  - Deskripsi
  - Premi dasar (Rp)
  - Uang pertanggungan (Rp)
  - Status aktif/nonaktif
- **Edit Product**: Click "Edit" → modal dengan data pre-filled
- **Delete Product**: Confirmation dialog
- **Mock Data**: 3 sample products (fallback jika API down)

**Modal Form Validation:**
- All fields required (*)
- Numeric validation untuk premi & pertanggungan
- Min value: 0

### 📋 Applications Kanban Board (`/dashboard/applications`)
**4 Status Columns:**
1. **Diajukan** (Submitted)
2. **Review** (Under Review)
3. **Disetujui** (Approved)
4. **Ditolak** (Rejected)

**Drag & Drop Features:**
- Drag card antar kolom
- Auto-update status
- Count per kolom (real-time)

**Card Information:**
- Application number (APP-2026-0001)
- Applicant name
- Product name
- Premium amount
- Submission date

**Quick Actions:**
- **Diajukan** → "Review" button
- **Review** → "Setujui" / "Tolak" buttons
- Click action → optimistic UI update

**Table View (Filter: "Semua"):**
- Full list semua applications
- Sortable columns
- Status badges color-coded

**Filter Buttons:**
- Semua
- Diajukan
- Review
- Disetujui
- Ditolak

**Mock Data:**
- 12 sample applications
- Mixed statuses untuk demo

## 🎨 UI/UX Features

- **Responsive Design** (desktop-optimized, mobile-friendly)
- **Drag & Drop** (HTML5 native, smooth animations)
- **Modal Forms** (overlay dengan backdrop)
- **Optimistic UI** (instant feedback sebelum API response)
- **Loading States** (skeleton screens)
- **Color-coded Status**:
  - Draft: Gray
  - Submitted: Blue
  - Under Review: Yellow
  - Approved: Green
  - Rejected: Red

## 🔌 API Integration

**Backend endpoints used:**

```typescript
// Products
GET ${API_URL}/admin/products
POST ${API_URL}/admin/products
PUT ${API_URL}/admin/products/:id
DELETE ${API_URL}/admin/products/:id

// Applications
GET ${API_URL}/admin/applications
PUT ${API_URL}/admin/applications/:id/status
```

**Fallback strategy:**

```typescript
try {
  const response = await fetch(apiUrl, options)
  if (response.ok) {
    // Use real API data
  } else {
    // Use mock data
  }
} catch (err) {
  // Always return mock data for demo
  return generateMockData()
}
```

## 🐳 Docker

**Build image:**

```bash
docker build -t insurance-cms .
```

**Run container:**

```bash
docker run -d \
  -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL=http://api-url/api/v1 \
  --name insurance-cms \
  insurance-cms
```

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# E2E tests
npm run test:e2e
```

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx                         # Login page
│   ├── layout.tsx                       # Root layout
│   └── dashboard/
│       ├── page.tsx                     # Dashboard (stats + table)
│       ├── products/page.tsx            # Product CRUD
│       └── applications/page.tsx        # Kanban board
├── components/                          # Reusable components
└── styles/                              # Global styles
```

## 🎯 Key Features Implementation

### Drag & Drop Kanban

```typescript
const onDragStart = (e: React.DragEvent, appId: string) => {
  e.dataTransfer.setData('applicationId', appId)
}

const onDrop = (e: React.DragEvent, status: string) => {
  e.preventDefault()
  const appId = e.dataTransfer.getData('applicationId')
  updateStatus(appId, status) // API call
}
```

### CRUD Modal Form

```typescript
// Add mode
setShowModal(true)
setEditingProduct(null)

// Edit mode
setShowModal(true)
setEditingProduct(product)
setFormData(product) // Pre-fill form

// Submit
const method = editingProduct ? 'PUT' : 'POST'
const url = editingProduct ? `/products/${id}` : '/products'
```

## 🚨 Troubleshooting

**Problem: Drag & Drop not working**

Solution: Ensure `draggable={true}` on card element and `onDragOver={(e) => e.preventDefault()}` on column

**Problem: Modal form not showing**

Solution: Check `showModal` state, verify backdrop z-index

**Problem: Status update tidak persist**

Solution: Backend API may be down, app uses optimistic UI (updates locally first)

**Problem: Table view empty**

Solution: Click "Semua" filter button to show all applications

## 🔧 Configuration

**Environment variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080/api/v1` |

**Default Credentials (demo):**

```
Username: superadmin
Password: change-meee
```

(Note: Full authentication in progress)

## 📝 Development Workflow

1. Create feature branch: `git checkout -b feat/feature-name`
2. Make changes, test on `localhost:3001`
3. Commit: `git commit -m "feat(scope): description"`
4. Push & create PR
5. Code review via go-mr-reviewer
6. Merge after approval

## 🌐 Deployment

**Deployed to:** http://insurance-app-cms.bayuanugerah.my.id

**Production build:**

```bash
npm run build
# Output: .next/ folder (standalone mode)
```

**Environment (production):**

```env
NEXT_PUBLIC_API_URL=http://insurance-app-api.bayuanugerah.my.id/api/v1
```

## 🎨 Design System

**Colors:**
- Primary: Blue 600 (#2563eb)
- Success: Green 600 (#16a34a)
- Warning: Yellow 600 (#ca8a04)
- Danger: Red 600 (#dc2626)
- Gray scale: 50-900

**Typography:**
- Font: System font stack (sans-serif)
- Headings: Bold, 2xl-3xl
- Body: Regular, base-sm

**Spacing:**
- Base unit: 4px (Tailwind default)
- Container: max-w-7xl mx-auto

## 📄 License

MIT License - Bayu Anugerah

## 🔗 Related Repositories

- Backend API: https://github.com/IlucielI/insurance-policy-core-api
- Frontend App: https://github.com/IlucielI/insurance-policy-app

## 📧 Contact

**Bayu Anugerah**  
Email: bayu.anugerah99@gmail.com  
GitHub: https://github.com/IlucielI
