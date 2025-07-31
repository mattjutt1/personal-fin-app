# Memory Update Guide - When & How to Update CLAUDE.md

## When to Update CLAUDE.md

### Always Update After:
1. **Major Architecture Decisions**
   - Tech stack changes
   - New dependencies added
   - Integration patterns established
   
2. **Project Milestones**
   - Feature completions
   - Phase transitions
   - Major refactorings
   
3. **Configuration Changes**
   - Environment variables
   - API endpoints
   - Deployment settings
   
4. **Problem Resolutions**
   - Bug fixes that change approach
   - Performance optimizations
   - Security updates

### Update Triggers Checklist
- [ ] Added new dependency to package.json
- [ ] Created new Convex functions
- [ ] Established new patterns
- [ ] Made architecture decisions
- [ ] Solved significant problems
- [ ] Changed project direction

## How to Update CLAUDE.md

### 1. Quick Context Update
```markdown
## Project Context Summary
**Last Updated:** [New Date]
**Status:** [Current Phase]

### Recent Changes
- [Bullet point of major change]
- [What was decided and why]
```

### 2. Architecture Decision Log
```markdown
### [Date]: [Decision Title]
- **Decision**: [What was decided]
- **Rationale**: [Why this choice]
- **Alternative Considered**: [What else was evaluated]
```

### 3. Task Progress Update
```markdown
### Completed
- ✓ [Newly completed task]

### Pending
- [ ] [New tasks identified]
```

### 4. Pattern Documentation
```javascript
// Add new patterns discovered
export const newPattern = convexFunction({
  // Document the pattern that works
});
```

## Memory Optimization Rules

### DO Keep:
- ✅ Current configuration values
- ✅ Key decisions with rationale
- ✅ Working patterns and examples
- ✅ Common error solutions
- ✅ Project philosophy reminders

### DON'T Keep:
- ❌ Detailed implementation code
- ❌ Temporary debugging notes
- ❌ Failed approaches (unless instructive)
- ❌ Verbose explanations
- ❌ Outdated configuration

## Update Commands

### Quick Update
```bash
# After making changes
/improve CLAUDE.md --update-context "Added Convex schema for transactions"
```

### Major Update
```bash
# After milestone
/analyze current-state
/implement CLAUDE.md --section "Architecture Decisions Log"
```

## Memory Sections Priority

### High Priority (Update Frequently)
1. **Current Configuration** - Always accurate
2. **Current Tasks & Progress** - Track what's active
3. **Recent Changes** - Last 3-5 major changes

### Medium Priority (Update on Changes)
1. **Architecture Decisions Log** - When patterns establish
2. **Development Patterns** - When new patterns emerge
3. **Common Commands** - When workflows solidify

### Low Priority (Update Occasionally)
1. **Project Identity** - Rarely changes
2. **What We're NOT Doing** - Update if scope creeps
3. **AI Model Integration Plan** - Update when implementing

## Example Update Flow

### Scenario: Added Transaction Schema
```markdown
1. Read current CLAUDE.md
2. Update "Last Updated" date
3. Add to "Recent Changes":
   - Added Convex schema for transactions (simple structure, no over-engineering)
4. Update "Completed":
   - ✓ Basic transaction schema
5. Add to "Convex Patterns":
   ```javascript
   // Transaction schema pattern
   export const transaction = {
     amount: v.number(),
     category: v.string(),
     date: v.string(),
     description: v.string(),
   };
   ```
6. Commit: "docs: update CLAUDE.md with transaction schema"
```

## Anti-Patterns to Avoid

### DON'T:
- ❌ Make CLAUDE.md too long (>500 lines)
- ❌ Duplicate information from PROJECT_RULES.md
- ❌ Include implementation details
- ❌ Update without reading first
- ❌ Forget to update "Last Updated"

### DO:
- ✅ Keep it scannable
- ✅ Focus on decisions and context
- ✅ Include working examples
- ✅ Maintain chronological order
- ✅ Cross-reference other docs

---
*This guide ensures CLAUDE.md remains a useful, up-to-date context source without becoming overwhelming.*