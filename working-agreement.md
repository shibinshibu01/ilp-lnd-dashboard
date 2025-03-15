# Team Working Agreement

## 1. Team Expectations

- We commit to working collaboratively and respecting each other's time and contributions.
- We follow Agile Scrum principles with daily stand-ups, sprint reviews, and retrospectives.
- We maintain clear and open communication and update the task board regularly.

## 2. Coding Standards

### 2.1 JavaScript Naming Conventions

- Use **camelCase** for variable and function names (e.g., `fetchTrainingData()`).
- Use **PascalCase** for component and class names (e.g., `TrainingDashboard`).
- Use **UPPER_CASE_SNAKE_CASE** for constants (e.g., `API_BASE_URL`).
- Use meaningful names that describe the functionality.

### 2.2 HTML Naming Conventions

- Use **kebab-case** for class names (e.g., `training-container`).
- Use **camelCase** for `id` attributes (e.g., `trainingTable`).
- Use semantic HTML elements (`<section>`, `<article>`, `<nav>`, `<aside>`, etc.) wherever possible.

### 2.3 CSS/SASS Naming Conventions

- Follow **BEM (Block-Element-Modifier)** methodology.
  - Block: `.training-card`
  - Element: `.training-card__title`
  - Modifier: `.training-card--highlighted`
- Nesting should not exceed **three levels deep** in SCSS.
- Use variables (`$primary-color`, `$spacing-md`) for consistency in SASS.

## 3. Git & Version Control

- Use **feature branches** (e.g., `feature/training-dashboard`).
- Follow **conventional commit messages**:
  - `feat: add training metrics module`
  - `fix: resolve dashboard rendering bug` 
  - `bug: resolve dashboard rendering bug`
- Avoid pushing directly to `main`. Always push your branch and create a pull request to merge into `dev`.
- Always pull `dev` and resolve conflicts in VS Code before creating a pull request from your branch to `dev`.

### **Branching Strategy**

- Stable production-ready code - `main`
- Active development branch - `dev`
- Feature-specific branches - `feature/{feature-name}`
- Bug fixes - `bugfix/{issue-name}`

## 4. Project Structure

```
training-dashboard/
│── .github/             # GitHub workflows (CI/CD, Issue templates)
│── public/              # Static assets, icons, images
│── src/                 # Source code
│   ├── assets/          # Images, fonts, icons
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── services/        # API calls, Firebase interactions
│   ├── store/           # State management (if using Redux, Zustand, etc.)
│   ├── styles/          # Global styles (SCSS/CSS)
│   ├── utils/           # Helper functions
│   ├── hooks/           # Custom React hooks
│── tests/               # Unit and integration tests
│── .gitignore           # Files to ignore in Git
│── README.md            # Project documentation
│── package.json         # Dependencies and scripts
│── tsconfig.json        # TypeScript config (if using TS)
│── firebase.json        # Firebase configuration
```

- Components should be reusable and modular.
- Separate concerns: **UI logic in components, API calls in services, and utility functions in utils.**

## 5. API & Database Guidelines

- Use **Axios** for API calls with error handling.
- Keep **Firebase Realtime Database structured** as per our agreed schema.

## 6. Communication & Meetings

- Sprint planning and retrospectives happen at the beginning and end of every sprint.

## 7. Code Reviews & PR Guidelines

- Code should be **formatted properly** before raising PRs (use Prettier/ESLint).
- Provide **meaningful descriptions** in PRs and link related issues.

---

### **Acknowledgment**

By agreeing to this document, we ensure consistency, quality, and smooth collaboration throughout the project. 🚀
