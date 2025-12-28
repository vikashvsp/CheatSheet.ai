# CheatSheet.ai 🚀

**Turn technical documentation into beautiful, visual cheat sheets in seconds.**

CheatSheet.ai is a powerful, AI-driven tool that instantly converts dry technical docs into concise, readable, and beautifully formatted cheat sheets.

Built for **Hack This Fall 2024**.

![CheatSheet.ai Banner](/public/htf-logo.png)

## ⚡ Powered by Apify

**This project relies heavily on [Apify](https://apify.com/) to perform its magic.**

While LLMs are great at reasoning, they often lack up-to-date knowledge of specific libraries or frameworks. **Apify bridges this gap.**
We use Apify's trusted **Puppeteer Scraper** to instantly crawl, scrape, and extract clean documentation content from any live URL. This content is then fed into Google Gemini to generate accurate, verified cheat sheets.

- **Real-time Knowledge:** No hallucinations; data comes directly from the source.
- **Scalable Scraping:** Apify handles the complexity of headless browsers and proxies.
- **Seamless Integration:** The Apify Client (`apify-client`) connects our Next.js app to the world's data.

## ✨ Features

- **Instant Generation:** Just enter a topic (e.g., "Python Regex", "Next.js Routing") and get a cheat sheet in seconds.
- **Visual & Clean UI:** A modern, distraction-free interface designed for readability.
- **PDF Export:** Download your generated cheat sheets as high-quality PDFs with a single click.
- **Smart Formatting:** AI-powered layout ensures tables, code blocks, and best practices are organized logically.

## 🛠️ Tech Stack

- **Data Layer:** **Apify (Puppeteer Scraper)** 🕷️
- **AI Engine:** Google Gemini Pro 🧠
- **Framework:** Next.js 16 (App Router) ⚛️
- **Styling:** Tailwind CSS + Framer Motion 🎨

## 🚀 Getting Started

Follow these steps to run the project locally:

### Prerequisites

- Node.js 18+
- An [Apify Account](https://console.apify.com/) (Get your API Token)
- A [Google Gemini](https://ai.google.dev/) API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vikashvsp/CheatSheet.ai.git
    cd CheatSheet.ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory:
    ```env
    # The backbone of our data fetching
    APIFY_TOKEN=your_apify_token_here
    
    # The brain for processing content
    GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contribution

Contributions are welcome! Feel free to fork the repo and submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

Running with ❤️ by **CheatSheet.ai Team**