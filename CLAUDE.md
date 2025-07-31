# CLAUDE Memory System - Personal Finance App

## Project Context Summary
**Last Updated:** January 31, 2025
**Project Type:** Simple Personal Finance App with Convex + Next.js
**Status:** Initial Setup Phase

### Quick Reference
```bash
# Project Location
cd /home/matt/Atlas-Financial/personal-fin-app

# Start Development
cd frontend && npm run dev

# Convex Dashboard
https://dashboard.convex.dev/t/matt/project/frugal-crab-771
```

### Project Identity
- **Name**: Personal Finance App (personal-fin-app)
- **Relationship**: Simplified version of Atlas Financial, NOT the main project
- **Philosophy**: Anti-over-engineering, start simple, evidence-based complexity
- **Tech Stack**: Next.js + Convex + Tailwind (no microservices)

## Current Configuration

### Convex Setup
```
Deployment URL: https://frugal-crab-771.convex.cloud
Dashboard: https://frugal-crab-771.convex.site
Deploy Key: prod:frugal-crab-771|eyJ2MiI6ImU5NzliNmYxY2E2NTQ0MWM5NDAyNjFlN2E4ZDQ5ZDYzIn0=
```

### Project Structure
```
personal-fin-app/
├── frontend/               # Next.js app
│   ├── src/app/           # App router pages
│   ├── convex/            # Convex functions
│   └── package.json       # Dependencies (Next.js, Convex, React)
├── backend/               # Python backend (future AI integration)
├── PROJECT_RULES.md       # Anti-over-engineering rules
├── PRD.md                # Original product requirements
└── CLAUDE.md             # This memory file
```

## Key Decisions & Context

### Why This Project Exists
1. **Separate from Atlas Financial**: This is a simpler, personal-use app
2. **Budget Conscious**: Using Kaggle for free AI inference (no paid APIs)
3. **Learning Project**: Testing Convex as backend-as-a-service
4. **Pragmatic Approach**: Ship working features fast, iterate based on usage

### Tech Stack Rationale
- **Convex**: Real-time, serverless, handles backend complexity
- **Next.js**: Modern React framework, good defaults
- **Tailwind**: Simple styling without custom CSS
- **Kaggle Models**: Free AI inference using fine-tuned models from Atlas

### What We're NOT Doing
- ❌ No microservices architecture
- ❌ No Kubernetes or complex orchestration
- ❌ No custom authentication (use Convex Auth)
- ❌ No GraphQL layers (Convex handles data)
- ❌ No paid AI APIs (using Kaggle inference)

## AI Model Integration Plan

### Available Models (From Atlas Financial)
1. **Budget Specialist**: FinMA-7B-NLP (already on Kaggle)
2. **Investment Specialist**: FinMA-7B-Full (already on Kaggle)
3. **Debt Specialist**: FinGPT v3.2 (already on Kaggle)
4. **Coordinator**: Mistral-7B (for orchestration)

### Integration Strategy
- **Phase 1**: Get basic app working without AI
- **Phase 2**: Add single AI feature (budget recommendations)
- **Phase 3**: Add coordinator only if needed
- **Phase 4**: Multi-agent only with proven demand

## Current Tasks & Progress

### ✅ Architecture Foundation Complete
- ✓ Atomic Vertical Slice Hybrid Architecture research (61+ evidence sources)
- ✓ Architecture governance framework created (ATOMIC_VERTICAL_SLICE_HYBRID_GOVERNANCE.md)
- ✓ PROJECT_RULES.md updated with architecture integration
- ✓ Vertical slice organization structure implemented
- ✓ Transaction management slice foundation created

### 📋 Immediate Next Steps (Phase 1 Implementation)
1. Complete transaction management slice (UI components)
2. Test architecture pattern with first complete feature
3. Create budget tracking slice following same pattern
4. Validate slice independence and boundaries

### Completed
- ✓ Project structure created
- ✓ Convex installed in frontend and configured
- ✓ Basic Next.js app running
- ✓ PROJECT_RULES.md with anti-over-engineering guidelines
- ✓ Identified AI models to use from Atlas project
- ✓ **Architecture Research**: Gap-filled analysis proving theory feasibility
- ✓ **Governance Framework**: Complete architecture compliance system
- ✓ **Slice Structure**: Vertical slice organization implemented

### In Progress
- 🔄 Transaction management slice implementation
- 🔄 Architecture pattern validation through first feature

### Pending (Phase 2+)
- [ ] Budget tracking slice
- [ ] Goal management slice
- [ ] AI integration with Kaggle models
- [ ] Slice boundary validation tooling
- [ ] Performance monitoring per slice

## 🎮 Integrated Governance System

### Master Control Files
```bash
# Primary governance coordination
GOVERNANCE_SYSTEM.md          # Master orchestrator, workflow integration
GOVERNANCE_QUICK_REFERENCE.md  # Daily commands and decision matrix

# Core governance documents
PROJECT_RULES.md               # Anti-over-engineering + architecture rules
ATOMIC_VERTICAL_SLICE_HYBRID_GOVERNANCE.md  # Architecture compliance
DEVELOPMENT_GOVERNANCE.md      # Human authority + quality gates
SESSION_TEMPLATE.md           # Session handoff procedures
MEMORY_UPDATE_GUIDE.md        # Context preservation
```

### Daily Workflow Integration
```bash
# Morning startup
cat CLAUDE.md | head -20                    # Get current context
grep "Anti-Over-Engineering" PROJECT_RULES.md  # Review constraints
grep "Phase 1" ATOMIC_*_GOVERNANCE.md       # Check architecture status

# During development
# Follow: Vertical slice organization
# Apply: Anti-over-engineering rules  
# Validate: Quality gates in real-time

# End of session  
echo "Session complete" >> CLAUDE.md        # Update progress
cp SESSION_TEMPLATE.md session-$(date).md   # Create handoff
```

### Decision Making Framework
```bash
# Simple decisions → PROJECT_RULES.md (direct application)
# Architecture decisions → ATOMIC_*_GOVERNANCE.md (compliance check)
# Complex decisions → DEVELOPMENT_GOVERNANCE.md (human escalation)
# All decisions → CLAUDE.md (documentation)
```

## Development Patterns

### File Operations
```python
# Always read before write
Read → Analyze → Plan → Write/Edit

# Prefer Edit over Write
Edit existing > Create new

# Batch operations
Multiple reads/edits in single tool call
```

### Convex Patterns
```javascript
// Simple function structure
export const functionName = mutation({
  args: { /* simple types */ },
  handler: async (ctx, args) => {
    // Direct logic, no abstractions
  }
});
```

### React Patterns
```jsx
// Simple components
export default function ComponentName() {
  // Direct state, no complex management
  const [state, setState] = useState();
  
  // Direct Convex hooks
  const data = useQuery(api.myFunction);
  
  // Simple JSX
  return <div className="tailwind-classes">...</div>;
}
```

## Common Commands

### Development
```bash
# Frontend dev
cd frontend && npm run dev

# Install dependencies
cd frontend && npm install

# Convex dev (when ready)
cd frontend && npx convex dev

# Deploy to Convex
cd frontend && npx convex deploy
```

### Git Operations
```bash
# Status check
git status

# Stage changes
git add .

# Commit
git commit -m "feat: description"

# Push (when ready)
git push origin main
```

## Architecture Decisions Log

### 2025-01-31: Initial Setup
- **Decision**: Start with Convex + Next.js only
- **Rationale**: Simplest possible stack that handles real-time and backend
- **Alternative Considered**: Firefly III integration (too complex initially)

### 2025-01-31: AI Strategy
- **Decision**: Use Kaggle-hosted models from Atlas project
- **Rationale**: Free inference, already fine-tuned, proven performance
- **Alternative Considered**: OpenAI/Anthropic APIs (too expensive)

## Error Patterns & Solutions

### Common Issues
```javascript
// Convex connection issues
- Check .env.local has correct NEXT_PUBLIC_CONVEX_URL
- Ensure convex dev is running for local development

// TypeScript errors
- Run convex codegen to update types
- Check imports match generated files

// Build errors
- Clear .next cache
- Check for missing dependencies
```

## Notes & Reminders

### For Future Claude Sessions
1. This is personal-fin-app, NOT Atlas Financial
2. Keep it simple - check PROJECT_RULES.md
3. Use Convex for everything backend-related
4. AI models are on Kaggle, not local
5. Always update this file with major decisions

### Red Flags to Watch For
- 🚩 "Let's add a service for..."
- 🚩 "We should make this configurable"
- 🚩 "What if we need to scale..."
- 🚩 "Let's create an abstraction"

### Green Flags to Follow
- ✅ "Does this solve today's problem?"
- ✅ "Is this the simplest solution?"
- ✅ "Can we hardcode this for now?"
- ✅ "Let's ship and get feedback"

---
*This memory file is the source of truth for project context. Update after major decisions or milestones.*