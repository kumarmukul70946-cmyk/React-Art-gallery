# Art Institute of Chicago - Gallery Viewer

A modern, responsive React application for browsing the artwork collection from the Art Institute of Chicago. Built with **Vite**, **TypeScript**, and **PrimeReact**, featuring a premium glassmorphism design.

## 🚀 Features

- **Server-Side Pagination**: Efficiently browses thousands of artworks without loading all data at once.
- **Persistent Selection**: Select rows across different pages without losing state.
- **Custom Selection Panel**: sophisticated logic to select the first 'N' records instantly without mass pre-fetching.
- **Premium UI**: 
  - Deep glassmorphism styling.
  - Interactive hover effects.
  - Fully responsive layout.
  - Custom themed PrimeReact components.

## 🛠️ Tech Stack

- **Framework**: React 18+ (Vite)
- **Language**: TypeScript
- **UI Components**: PrimeReact, PrimeIcons
- **Styling**: Custom CSS (Glassmorphism), Flexbox

## 🏃‍♂️ Getting Started

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd art-gallery
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

## 📦 Deployment

This project is optimized for deployment on platforms like Netlify or Cloudflare Pages.

### Netlify
1.  Connect your GitHub repository.
2.  Build command: `npm run build`
3.  Publish directory: `dist`

### Cloudflare Pages
1.  Connect your GitHub repository.
2.  Build command: `npm run build`
3.  Build output directory: `dist`

## 📝 Assignment Compliance

- **No Mass Data Storage**: The application calculates selection state based on indices and sparse ID sets, preventing memory bloat.
- **No Pre-fetching**: Logic strictly adheres to fetching only the current page's data.
