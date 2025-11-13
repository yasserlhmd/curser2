# Coding Guidelines & AI Prompts

## 1. Code Style

- Use consistent naming: `camelCase` for JS, `PascalCase` for components.
  ```javascript
  // Variables and functions
  const taskList = [];
  const getTasks = async () => {};
  
  // React components
  const TaskList = ({ tasks }) => {};
  ```

- Prefer functional over class components.
  ```jsx
  // ✅ Good
  const TaskList = ({ tasks }) => {
    return <div>{tasks.map(...)}</div>;
  };
  
  // ❌ Avoid
  class TaskList extends React.Component { ... }
  ```

- Keep files < 200 lines when possible.
  - Split large files into smaller modules
  - Extract reusable logic into separate functions
  - Break down complex components into smaller components

## 2. Folder Structure

Organize code by feature rather than type when possible.

```
frontend/src/
├── features/
│   ├── tasks/
│   │   ├── components/     # TaskList, TaskItem, TaskForm
│   │   ├── services/       # taskService.js
│   │   ├── hooks/          # useTasks.js
│   │   └── utils/          # taskHelpers.js
│   └── auth/               # Future feature
├── shared/
│   ├── components/         # Button, Input (common)
│   ├── hooks/              # useApi.js
│   └── utils/              # helpers.js
└── pages/                  # HomePage, NotFoundPage
```

**Benefits:**
- Related code stays together
- Easier to find and maintain
- Clear feature boundaries
- Better scalability

## 3. Commit Conventions

`<type>(scope): message`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
- `feat(auth): add login route`
- `fix(ui): correct button alignment`
- `refactor(tasks): extract task service`
- `test(api): add integration tests for tasks endpoint`
- `docs(readme): update setup instructions`

## 4. Branching Strategy

- `main` → stable (production-ready code)
- `dev` → integration (development branch)
- `feature/*` → active development (new features)

**Workflow:**
1. Create feature branch from `dev`
   ```bash
   git checkout dev
   git checkout -b feature/task-filtering
   ```

2. Work on feature and commit
   ```bash
   git commit -m "feat(tasks): add filter UI"
   ```

3. Create PR to `dev` for review

4. Merge to `dev` after approval

5. Merge `dev` to `main` for production release

**Branch Naming:**
- `feature/task-filtering`
- `fix/api-cors-issue`
- `refactor/task-service`
- `docs/api-documentation`

## 5. Code Optimization Principles

- **Prefer Native APIs**: Use native browser/Node.js APIs when available instead of external dependencies
  - Use `fetch` instead of `axios` for HTTP requests
  - Use native `fs` module instead of `dotenv` for environment loading
  - Use native middleware instead of external packages when possible
- **Minimize Dependencies**: Only add dependencies when absolutely necessary
- **Performance First**: Native APIs are typically faster and have better browser/runtime optimization

## 6. Cursor / AI Prompts Library

| Purpose | Example Prompt |
|---------|----------------|
| **Refactor** | "Simplify and optimize this function." |
| **Document** | "Generate concise JSDoc for this module." |
| **Test** | "Write Jest test cases for this component." |
| **Extract Component** | "Extract this code into a reusable React component with PropTypes." |
| **Optimize Performance** | "Optimize this code for better performance using React.memo, useMemo, or useCallback." |
| **Add Validation** | "Add input validation to this form with clear error messages." |
| **Fix Bug** | "Fix the following error: [error message]. Code: [paste code]" |
| **Create Service** | "Extract business logic from this controller into a separate service file." |
| **Add Error Handling** | "Add proper error handling to this async function." |
| **Review Code** | "Review this code for security vulnerabilities and best practices." |

## 7. Code Review Rules

Checklist for self or peer reviews:

- **Naming & Structure**
  - [ ] Does code follow naming conventions? (`camelCase` for JS, `PascalCase` for components)
  - [ ] Is code organized by feature when appropriate?
  - [ ] Are files kept under 200 lines when possible?

- **Code Quality**
  - [ ] Are functions pure and modular?
  - [ ] Is code DRY (Don't Repeat Yourself)?
  - [ ] Are there meaningful comments for complex logic?
  - [ ] Is error handling implemented properly?

- **Testing**
  - [ ] Are there meaningful tests?
  - [ ] Do tests cover edge cases?
  - [ ] Are tests independent and maintainable?

- **Best Practices**
  - [ ] Are functional components used instead of class components?
  - [ ] Is async/await used instead of callbacks?
  - [ ] Are parameterized queries used for database operations?
  - [ ] Are environment variables used for sensitive data?

---

**Document Version**: 2.1  
**Last Updated**: 2025-01-XX

