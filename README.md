# LLM Wrapper Chat Node.js App

This is the LLM Wrapper Chat React/Next.js toy-project application.

## Prerequisites

Ensure you have the following installed before proceeding:
- [npm](https://www.npmjs.com/) (or `yarn`/`pnpm` if preferred)
- **Node.js**: `>=22.13.1`
- **Next.js**: `^14.2.20`
- **React**: `^18.3.1`
- **TypeScript**: `^5`

## Installation

### 1. Clone the Repository
git clone <repository-url>
- Replace `<repository-url>` with the actual GitHub repository link.

### 2. Navigate to the Project Directory
cd <project-folder>
- Replace `<project-folder>` with the actual folder name of your project.

### 3. Install Dependencies
Using npm:
- npm install

Using yarn:
- yarn install

Using pnpm:
- pnpm install

### 4. Generate a Hugging Face Token
- Navigate to https://huggingface.co/microsoft/Phi-3-mini-4k-instruct and craete an account
- Next, you need to generate a token by navigating to https://huggingface.co/settings/tokens
- Click "Create new token" 
- Check the following permissions
# Repositories
- Read access to contents of all repos under your personal namespace
- Read access to contents of all public gated repos you can access
- Write access to contents/settings of all repos under your personal namespace
# Inference
- Make calls to inference providers
- Make calls to Inference Endpoints
- Manage Inference Endpoints

### 5. .env.local File
- Create a file named .env.local in the root folder of the project
- Insert your Huggingface token as:
    - HUGGING_FACE_API_TOKEN=YOUR_HUGGINGFACE_TOKEN

### Running the Application
Run the server:
- npm run dev

Or, if using yarn:
- yarn dev

Or, if using pnpm:
- pnpm dev

The app should now be accessible at `http://localhost:3000` (or another port if specified).

### Platform Design
- Mobile-friendly design is implemented.
- A menu/footer template has been created, and currently, the only functional page is the Dashboard (main page).
- A sidebar template has been added to display extra options for the platform.
- The chat interface includes extra buttons as placeholders to showcase a potential real-world app design:
    - Prompts
    - Personas
    - Add

### Testing the App
## The Chat
- You can format a message before sending it by using the toolbar.
- When you send a message, the "Send" icon automatically transforms into a "Stop" icon, allowing you to interrupt the AI response.
- Sent messages can be edited; pressing the diskette (save) icon will resend the modified message, prompting the AI to respond again to your updated inquiry.
- Attempting to send a blank message will trigger the AI to reply with:
    *It looks like your message is empty. What can I help you with?*
- If you request code, it will be properly formatted for readability.

## Testing the Web scraping
- Click the "Commands" button to open a modal where you can:
    - Enter the website URL to be scraped.
    - Use the advanced dropdown to customize scraping options.
    - Test with Wikipedia URLs:
        - https://en.wikipedia.org/wiki/The_Lord_of_the_Rings
        - https://en.wikipedia.org/wiki/Large_language_model
- Click the "Scrape" button. A command will appear in the chat, formatted like this:
    *You can send multiple commands at the same time*
    - [include-url: https://en.wikipedia.org/wiki/The_Lord_of_the_Rings max_execution_time:300 filter:true store:true]
        - You can also prepend a text message before the scrape command. For example:
            - Could you please scrape this website? [include-url: https://en.wikipedia.org/wiki/The_Lord_of_the_Rings max_execution_time:300 filter:true store:true]
- Send the command to the chat and wait for the result.

## License
This project is licensed under the MIT License.
