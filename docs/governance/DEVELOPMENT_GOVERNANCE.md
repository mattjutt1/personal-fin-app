# Development Governance Framework

## Decision Authority & Escalation

### Human-in-the-Loop Authority
- **Final Decision Maker**: Human (Matt) has ultimate authority on all decisions
- **AI Role**: Analysis, options, recommendations only - never final decisions
- **Escalation Trigger**: When SuperClaude sub-agents disagree or rules conflict
- **Escalation Format**: Present 2-3 options with pros/cons, recommend preferred option

### Decision Escalation Process
1. **AI Analysis**: Present conflicting options clearly
2. **Human Choice**: Matt makes final decision
3. **Document Decision**: Update CLAUDE.md with rationale
4. **Update Rules**: If decision creates new pattern, add to PROJECT_RULES.md

## Quality Gates & Checkpoints

### Definition of "Done" Criteria
Every task must pass ALL applicable gates:

#### Gate 1: Functional Requirements
- [ ] Feature works as specified
- [ ] Edge cases handled appropriately
- [ ] Error states defined and handled

#### Gate 2: Code Quality
- [ ] Follows PROJECT_RULES.md anti-over-engineering principles
- [ ] Uses established patterns (Convex + Next.js)
- [ ] No unnecessary abstractions or complexity

#### Gate 3: Documentation
- [ ] Code is self-documenting with clear naming
- [ ] Complex logic has brief comments
- [ ] CLAUDE.md updated if new patterns established

#### Gate 4: Testing (When Applicable)
- [ ] Manual testing completed
- [ ] Happy path verified
- [ ] Error cases tested

#### Gate 5: Integration
- [ ] Works with existing features
- [ ] No breaking changes to established patterns
- [ ] Convex functions deploy successfully

### Code Review Checklist
Before marking any task complete:

#### Anti-Over-Engineering Check
- [ ] Is this the simplest solution that works?
- [ ] Are we building for today's needs, not imagined futures?
- [ ] Can we hardcode this instead of making it configurable?
- [ ] Are we duplicating code from fewer than 3 places?

#### Convex + Next.js Alignment
- [ ] Using Convex patterns correctly
- [ ] No bypassing Convex for database operations
- [ ] React components are simple and direct
- [ ] No state management libraries added unnecessarily

#### Memory System Check
- [ ] Is this decision worth documenting in CLAUDE.md?
- [ ] Does this change any established patterns?
- [ ] Should PROJECT_RULES.md be updated?

## Workflow State Management

### Session Handoff Protocol
At the end of each development session:

#### Session Summary Template
```markdown
## Session Summary - [Date]

### Completed
- [Task 1 with specific outcome]
- [Task 2 with specific outcome]

### In Progress
- [Task with current state and next steps]

### Blocked/Issues
- [Any blockers encountered]
- [Decisions needed from human]

### Next Session Priority
- [1-3 specific tasks for next session]

### Memory Updates
- [What was added/changed in CLAUDE.md]
```

### Context Switching Guidelines

#### When to Use SuperClaude Personas
- **frontend-ux-specialist**: UI components >50 lines
- **backend-reliability-engineer**: Convex functions with business logic
- **systems-architect**: Architecture decisions or schema design
- **root-cause-analyzer**: Debugging complex issues
- **Default**: Use main Claude for simple tasks

#### Persona Switching Rules
1. **One persona per task** - don't mix unless explicitly needed
2. **Document persona choice** in task description
3. **Escalate conflicts** between personas to human

### Rollback Procedures

#### When Things Go Wrong
1. **Stop immediately** - don't continue building on broken foundation
2. **Assess damage** - what was changed since last working state
3. **Human decision point** - continue fixing or rollback
4. **Document lesson** - update PROJECT_RULES.md if new anti-pattern identified

#### Git Rollback Process
```bash
# Check what changed
git status
git diff

# If minor: fix forward
# If major: rollback and restart
git reset --hard [last-good-commit]
```

## Measurement & Feedback Loops

### Over-Engineering Detection Metrics

#### Red Flag Counters (Track These)
- **Abstraction Layers**: >2 levels = review needed
- **Configuration Options**: >5 options = too many
- **Dependencies**: New dependency = justify in writing
- **File Size**: >200 lines = consider splitting
- **Function Length**: >50 lines = probably too complex

#### Green Flag Indicators
- **Time to Feature**: Can new feature be added in <2 hours?
- **Code Duplication**: <3 places = acceptable
- **Direct Convex Usage**: Functions call Convex directly
- **Simple State**: useState over complex state management

### Weekly Review Process

#### Every Sunday (or End of Sprint)
1. **Review completed tasks** against quality gates
2. **Check red flag metrics** - are we over-engineering?
3. **Evaluate rules effectiveness** - are PROJECT_RULES.md helping?
4. **Update memory system** - is CLAUDE.md still accurate?

#### Review Questions
- What took longer than expected? Why?
- What rules did we bend? Should we update them?
- What patterns emerged? Document them?
- Are we still building the right thing?

### Learning Capture

#### Mistake Documentation
When something goes wrong:
1. **Document in CLAUDE.md** under "Error Patterns & Solutions"
2. **Update PROJECT_RULES.md** if new anti-pattern discovered
3. **Create prevention measure** for future

#### Success Pattern Documentation
When something works well:
1. **Document pattern** in CLAUDE.md under "Development Patterns"
2. **Consider adding to PROJECT_RULES.md** if broadly applicable
3. **Create reusable example**

## Emergency Protocols

### Project Derailment Detection

#### Warning Signs
- ❌ Tasks taking >4 hours that should take <2 hours
- ❌ Adding dependencies not in original plan
- ❌ Creating "frameworks" or "systems"
- ❌ Talking about "scalability" for single-user app
- ❌ Building features not in immediate use

#### Emergency Reset Trigger
If 2+ warning signs present: **STOP AND RESET**

### Emergency Reset Procedure

#### Step 1: Immediate Stop
- Stop all development work
- Don't commit current changes
- Create emergency branch if needed

#### Step 2: Assessment
- Review changes since last working version
- Identify where complexity crept in
- Document what went wrong

#### Step 3: Human Decision Point
Present options:
1. **Fix Forward**: Simplify current approach
2. **Partial Rollback**: Keep some changes, revert others
3. **Full Reset**: Go back to last simple working state

#### Step 4: Prevention
- Update PROJECT_RULES.md with new anti-pattern
- Add detection mechanism to prevent repeat
- Restart with renewed focus on simplicity

### Conflict Resolution

#### When Rules Conflict with Practical Needs
1. **Document the conflict** clearly
2. **Present options** to human with pros/cons
3. **Human decides** which principle takes priority
4. **Update rules** if decision reveals gap
5. **Move forward** with clear precedent set

#### Example Escalation Format
```markdown
## Decision Needed: [Brief Description]

### Conflict
- PROJECT_RULES.md says: [rule]
- Practical need: [requirement]

### Options
1. **Follow Rules**: [outcome, pros, cons]
2. **Bend Rules**: [outcome, pros, cons]
3. **Alternative**: [creative option, pros, cons]

### Recommendation
[AI recommendation with reasoning]

### Human Decision
[Space for human choice and rationale]
```

## Implementation Checklist

### Setup Complete When:
- [ ] All team members understand escalation process
- [ ] Quality gates defined and documented
- [ ] Session handoff template created
- [ ] Metrics tracking mechanism established
- [ ] Emergency protocols tested (at least mentally)
- [ ] All documents cross-reference correctly

---
*This governance framework ensures human authority while providing structured processes for maintaining development quality and preventing over-engineering.*