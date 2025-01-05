# deInitiatives

**deInitiatives** is a lightweight, Web3-enabled application designed to help communities and DAOs prioritize and manage their initiatives through collaborative voting.

---

## What is deInitiatives?

deInitiatives empowers communities to decide what to focus on next. It allows users to create **Initiatives**—community-focused themes or projects—and contribute tasks. Members vote on these tasks, helping the group prioritize what matters most. The app is simple, flexible, and built for rapid deployment, making it ideal for research groups, DAOs, and any collective seeking alignment on priorities.

---

## Why deInitiatives?

In decentralized communities, decision-making often feels scattered, with members unsure of where to focus their efforts. deInitiatives solves this by providing a transparent, democratic voting system where:

- Everyone can contribute ideas and vote on what’s important.
- Admins can manage priorities and archive completed tasks.
- Communities can achieve alignment and focus effectively.

By leveraging Web3 technology, deInitiatives also ensures that the process is secure, transparent, and future-proof, with planned support for on-chain functionality.

---

## How It Works

1. **Connect Wallet**: Users log in with their Web3 wallet using RainbowKit.
2. **Browse Initiatives**: Explore community initiatives and their associated tasks.
3. **Vote**: Support tasks by voting, helping the community decide priorities.
4. **Create and Manage**: Admins create new initiatives and tasks, archive completed ones, and keep everything organized.

---

## Technology Stack

- **Frontend**: React + Next.js
- **Styling**: Tailwind CSS
- **Web3 Integration**: RainbowKit + Wagmi
- **Backend**: Supabase + Prisma
- **Deployment**: Vercel

---

## Get Started

This project is designed to be modular and easy to extend. To run the application locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/brucexu-eth/deInitiatives.git
   ```

2. Install dependencies:

   ```bash
   # Clean install dependencies with legacy peer deps to resolve conflicts
   rm -rf node_modules
   rm package-lock.json
   npm install --legacy-peer-deps
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then update the environment variables in `.env.local` with your own values.

4. Set up Supabase and Prisma configurations.
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open your browser and navigate to `http://localhost:3000`.

---

## Future Plans

- On-chain voting support.
- Gated voting based on NFT or token ownership.
- Enhanced admin tools and analytics.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Happy building with **deInitiatives**! 🎉
