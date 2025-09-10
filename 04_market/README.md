# Product Market - Frontend

A modern React Single Page Application for managing products with full CRUD operations.

## Features

- **List Products**: View all products in a responsive table with sorting and pagination
- **Product Details**: View detailed information about each product
- **Add New Product**: Create new products with form validation
- **Edit Product**: Update existing product information
- **Delete Product**: Remove products with confirmation dialog
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Ant Design components

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Ant Design** for beautiful UI components
- **Axios** for API communication
- **CSS3** for custom styling

## Prerequisites

- Node.js 18+ and npm
- The FastAPI backend running on `http://localhost:8000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

### Starting the Backend API

Before using the frontend, make sure the FastAPI backend is running:

```bash
cd ../03_python_fastapi_project
uv run uvicorn main:app --reload
```

The backend should be available at `http://localhost:8000`.

### Using the Application

1. **View Products**: The main page displays all products in a table format
2. **Add Product**: Click the "Add New Product" button to create a new product
3. **View Details**: Click the eye icon to view detailed product information
4. **Edit Product**: Click the edit icon to modify product details
5. **Delete Product**: Click the delete icon and confirm to remove a product

## API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

- `GET /products` - Retrieve all products
- `GET /products/{id}` - Get a specific product
- `POST /products` - Create a new product
- `PUT /products/{id}` - Update an existing product
- `DELETE /products/{id}` - Delete a product

## Project Structure

```
src/
├── services/
│   └── api.ts          # API service and type definitions
├── App.tsx             # Main application component
├── App.css             # Custom styles
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Table Features
- Sortable columns (Price, Stock)
- Pagination with configurable page sizes
- Search and filtering capabilities
- Responsive design for mobile devices

### Form Features
- Real-time form validation
- Input formatting (currency for price)
- Required field indicators
- Error handling and user feedback

### UI/UX Features
- Loading states for better user experience
- Success/error notifications
- Confirmation dialogs for destructive actions
- Clean, modern design with consistent spacing
- Color-coded stock levels (green/orange/red)

## Customization

### Styling
- Modify `src/App.css` for component-specific styles
- Update `src/index.css` for global styles
- Ant Design theme can be customized through CSS variables

### API Configuration
- Update `API_BASE_URL` in `src/services/api.ts` to change the backend URL

## Troubleshooting

### CORS Issues
If you encounter CORS issues, make sure your FastAPI backend includes CORS middleware:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Connection Issues
- Ensure the FastAPI backend is running on `http://localhost:8000`
- Check that all required dependencies are installed
- Verify the API endpoints are working by testing them directly

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
