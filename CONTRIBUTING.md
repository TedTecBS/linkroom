# Contributing to Linkroom

Thank you for your interest in contributing to Linkroom! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the best outcome for the project
- Show empathy towards other contributors

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/linkroom.git
   cd linkroom
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/linkroom.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   cd functions && npm install
   ```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Build to check for errors
npm run build

# Test locally
npm run dev
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add job search filters"
git commit -m "fix: resolve authentication redirect issue"
git commit -m "docs: update setup instructions"
```

Commit message format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build process or tooling

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commits follow conventional commit format
- [ ] Branch is up to date with main

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors or warnings
```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Avoid `any` type - use proper types or `unknown`
- Use interfaces for object shapes
- Use type aliases for unions and complex types

```typescript
// Good ✅
interface User {
  id: string;
  name: string;
  email: string;
}

// Avoid ❌
const user: any = { ... };
```

### React Components

- Use functional components with hooks
- One component per file
- Use descriptive component names

```typescript
// Good ✅
export const JobListingCard: React.FC<JobListingCardProps> = ({ job }) => {
  return <div>...</div>;
};

// Avoid ❌
export default function Card(props) { ... }
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `JobCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Hooks: `use*.ts` (e.g., `useAuth.ts`)
- Types: `PascalCase.ts` or `index.ts`

### Imports

Order imports logically:

```typescript
// 1. External libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal modules (absolute imports)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';

// 3. Relative imports
import { JobCard } from './JobCard';

// 4. Types
import type { Job } from '@/types';
```

### Firebase/Firestore

- Use type-safe collection helpers
- Always use converters
- Handle loading and error states

```typescript
// Good ✅
import { jobsCollection, jobDoc } from '@/lib/firestore-collections';

const jobsSnapshot = await getDocs(jobsCollection());
const jobs = jobsSnapshot.docs.map(doc => doc.data()); // Type: Job[]

// Avoid ❌
const jobs = await getDocs(collection(db, 'jobs'));
```

## Testing

### Manual Testing Checklist

Before submitting, test:

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Different user roles (job seeker, employer, admin)
- [ ] Error handling
- [ ] Loading states

## Documentation

Update documentation when you:

- Add new features
- Change configuration
- Modify setup process
- Add dependencies

Documentation locations:
- `README.md` - Overview and quick start
- `docs/SETUP.md` - Detailed setup guide
- `docs/DEVELOPMENT.md` - Development guide
- Code comments - Complex logic

## Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., macOS, Windows]
- Browser: [e.g., Chrome, Safari]
- Version: [e.g., 22]

**Additional context**
Any other relevant information
```

## Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Problem it Solves**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples, etc.
```

## Questions?

- Check existing issues and discussions
- Review documentation
- Ask in discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Linkroom! 🚀
