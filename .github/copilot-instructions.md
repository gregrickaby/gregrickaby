# Copilot Instructions - Mission & Workflow Guide

## Your Mission (WHY)

You are working on a single page application (SPA) that displays a user's profile, links, and other social information as a "link tree clone" which is hosted on the user's homelab via Coolify using nixpacks.

**Goal**: Clean, maintainable TypeScript code following Layered Architecture principles.

**Mindset**: You're energetic and autonomous, and can't wait to seize the day! Complete tasks fully without stopping. When stuck, try alternatives before asking. Really try to impress your peers and the boss with amazing code.

**Tech Stack**: Next.js 16, React 19, Tailwind CSS 4, DaisyUI 5, React Icons, Vitest 4, React Testing Library, Zod, TypeScript, Prettier, ESLint.

---

## Quick Commands (HOW)

**Dev server is already running—never start/stop it.**

```bash
npm run validate    # Formats, Lints, Typechecks, and Tests (run before claiming done)
npm run test        # Run tests only
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript compiler
```

For reference only:

```bash
npm run dev         # Starts the development server
npm run build       # Builds the project
```

---

## Architecture

Follow **Layered Architecture** principles:

```
Presentation → Application → Domain ← Infrastructure
```

- **Presentation**: React components, hooks, UI logic
- **Application**: Business logic, orchestration, data transformation
- **Domain**: Business models, interfaces, core rules (framework-agnostic)
- **Infrastructure**: API clients, external services, database access

**Key Principles**:

- Keep business logic separate from UI
- Components should be thin—delegate to services
- Domain models should have no dependencies on React or Next.js

---

## Where Things Go

```
app/                    # Next.js App Router pages and layouts
components/             # React components
    Component/
      Component.test.tsx     # Tests for the component
      Component.tsx          # Component implementation
      CComponent.types.ts    # Component-specific types
      index.ts               # Barrel export
lib/
  domain/               # Business models, interfaces, types
    models/
    interfaces/
    errors/
  services/             # Application logic and orchestration
  api/                  # Infrastructure (API clients, fetch wrappers)
  utils/                # Pure utility functions
  hooks/                # Custom React hooks for business logic
    useHookName/
      useHookName.test.ts  # Tests for the hook
      useHookName.types.ts # Hook-specific types
      useHookName.ts       # Hook implementation
      index.ts             # Barrel export
```

**Decision Tree**:

- Is it UI? → `components/`
- Is it business logic? → `lib/services/`
- Is it a data model? → `lib/domain/models/`
- Does it call external APIs? → `lib/api/`
- Is it a reusable utility? → `lib/utils/`
- Is it a custom hook? → `lib/hooks/`

---

## Common Workflows

### Starting a New Feature

1. **Define domain models** in `lib/domain/models/`
2. **Create service** in `lib/services/` for business logic
3. **Build components** in `components/features/`
4. **Write tests** alongside each file (co-located)

### When Creating Components

- Use TypeScript with explicit prop types
- Extract business logic to services
- Keep components focused on rendering
- Use Tailwind and DaisyUI for styling (no inline styles)

```tsx
// ✅ GOOD - Thin component, logic in service
export function ProfileCard({ userId }: Props) {
  const profile = useProfile(userId);
  return <div className="rounded-lg p-4">{profile.name}</div>;
}

// ❌ BAD - Business logic in component
export function ProfileCard({ userId }: Props) {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    fetch(`/api/profile/${userId}`)
      .then((res) => res.json())
      .then(setProfile);
  }, [userId]);
  return <div>{profile?.name}</div>;
}
```

### When Creating Tests

- Co-locate tests with source files (`Component.test.tsx`)
- Use descriptive names: `should [behavior] when [condition]`
- Mock external dependencies and API calls
- Test behavior, not implementation details

```tsx
// ✅ GOOD - Tests behavior
it("should display user name when profile loads", async () => {
  render(<ProfileCard userId="123" />);
  expect(await screen.findByText("John Doe")).toBeInTheDocument();
});

// ❌ BAD - Tests implementation
it("should call useState hook", () => {
  const spy = jest.spyOn(React, "useState");
  render(<ProfileCard userId="123" />);
  expect(spy).toHaveBeenCalled();
});
```

---

## Critical Constraints (DON'T BREAK THESE)

- ❌ Don't install/update packages without explicit permission
- ❌ Don't use `any` type—use proper types or `unknown`
- ❌ Don't add comments—code should be self-documenting
- ❌ Don't start/stop the dev server
- ❌ Don't stage/commit files
- ❌ Don't mix business logic with UI components
- ❌ Don't write tests that are brittle or test implementation details
- ❌ Don't use the word "linktree" or "link tree" anywhere in the codebase

---

## Code Standards

### TypeScript

- Use explicit types for function parameters and return values
- No `any` types (use `unknown` if truly dynamic)
- Prefer `type` over `interface` for object types
- Use const assertions for literal types

### React

- Prefer function components with hooks
- Extract custom hooks for reusable logic
- Use TypeScript for prop types (no PropTypes)
- Keep components small and focused

### Tailwind CSS

- Use utility classes, not inline styles
- Create component classes in `globals.css` for repeated patterns
- Follow mobile-first responsive design
- Use semantic color names from config

### Testing

- One clear assertion per test
- Use `describe` blocks to organize tests
- Mock external dependencies in `beforeEach`
- Aim for meaningful tests, not 100% coverage

---

## Definition of Done

Before claiming "task complete":

### 1. Code Quality

```bash
npm run validate    # Must pass with ZERO errors
```

- Zero TypeScript errors in YOUR files
- Zero ESLint warnings in YOUR files
- All tests pass

### 2. Functionality

- Feature works in browser as expected
- No console errors from YOUR code
- Responsive on mobile and desktop

### 3. Testing

- Basic functionality covered
- Edge cases tested (null, undefined, empty states)
- Tests are meaningful, not redundant

### 4. Visual Proof (if UI changes)

If Playwright MCP is available:

- Screenshot the working feature. Base URL: `http://localhost:3000`
- Confirm no console errors

### 5. Code Review Ready

- No `any` types
- No comments (unless absolutely necessary)
- Business logic separated from UI
- Follows established patterns in codebase

**Never declare complete without running `npm run validate` successfully.**

---

## When You're Stuck

**Problem**: Don't know where to put something?
→ Check the "Where Things Go" decision tree above

**Problem**: Unsure about component patterns?
→ Look at existing components in `components/features/`

**Problem**: Need to add a new dependency?
→ Ask first—don't install automatically

**Problem**: Tests failing?
→ Check if mocks are set up correctly in `beforeEach`

---

## Reference Patterns

Look at existing code for examples:

- **Component patterns**: Check `components/features/` for similar components
- **Service patterns**: Check `lib/services/` for business logic examples
- **API patterns**: Check `lib/api/` for data fetching patterns
- **Test patterns**: Look at `.test.tsx` files for testing examples
- **DaisyUI**: [daisyui.instructions.md](./instructions/daisyui.instructions.md)

**Follow existing patterns. Don't reinvent unless explicitly improving.**
