# Scholar Tinder

Scholar Tinder is a Tinder-like interface for discovering relevant research papers based on your academic interests. The application allows researchers to find their Semantic Scholar profile, fetch their published papers, and receive paper recommendations that they can browse through with a swipe interface.

## Features

- Search for authors using the Semantic Scholar API
- View author profiles with publication metrics
- Fetch papers authored by the selected researcher
- Receive paper recommendations based on authored and liked papers
- Swipe right to like papers and left to dislike papers
- View a list of liked papers for reference
- Modern and responsive UI built with Next.js and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/scholar-tinder.git
cd scholar-tinder
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **API Integration**: Semantic Scholar API
- **Deployment**: Vercel

## How It Works

1. **Author Search**: Users search for their name on Semantic Scholar and select their profile
2. **Paper Fetching**: The app fetches all papers authored by the selected researcher
3. **Recommendations**: The application uses these papers as positive inputs for the recommendation algorithm
4. **Paper Browsing**: Users can swipe right (like) or left (dislike) on recommended papers
5. **Feedback Loop**: Liked papers are added to positive inputs for future recommendations, while disliked papers are added to negative inputs
6. **Paper Collection**: Users can view their liked papers in a sidebar for later reference

## Semantic Scholar API

This application uses the Semantic Scholar API to:
- Search for authors
- Fetch papers by authors
- Get paper recommendations

For more information, visit the [Semantic Scholar API documentation](https://api.semanticscholar.org/api-docs/).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Semantic Scholar](https://www.semanticscholar.org/) for providing the API
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) for the fantastic framework
- [Vercel](https://vercel.com/) for hosting and deployment
