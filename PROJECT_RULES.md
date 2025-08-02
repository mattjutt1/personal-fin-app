# Personal Finance App - Project Rules

## Anti-Over-Engineering Rules

### Core Principles
1. **Start Simple, Stay Simple**: Build the minimum viable feature first. Add complexity only when proven necessary.
2. **No Premature Optimization**: Don't optimize until you have metrics showing a real performance problem.
3. **YAGNI (You Aren't Gonna Need It)**: Don't build features or abstractions until they're actually needed.
4. **Direct Over Indirect**: Use direct function calls and simple patterns before adding layers of abstraction.

### Specific Development Rules

#### Architecture Rules - Atomic Vertical Slice Hybrid
- **Architecture Pattern**: Follow Atomic Vertical Slice Hybrid Architecture (see ATOMIC_VERTICAL_SLICE_HYBRID_GOVERNANCE.md)
- **Phase 1 (Current)**: Single Next.js app with Convex backend organized by vertical slices
- **Vertical Slicing**: Organize by feature (transaction-management, budget-tracking) not by technical layer
- **Atomic Components**: Each slice is self-contained with clear boundaries
- **No Microservices**: Keep monolith deployment until >1000 users (hybrid deployment strategy)
- **Slice Independence**: Each feature slice owns its data, UI, and business logic

#### Code Rules
- **Copy-Paste is OK**: Duplicate code is fine until you need it in 3+ places
- **Hardcode First**: Hardcode values until they need to change
- **Simple Types**: Use basic types (string, number) before creating complex type hierarchies
- **No Clever Code**: Readable and obvious beats clever every time

#### Feature Rules
- **One Feature at a Time**: Complete one feature fully before starting the next
- **No "Future-Proofing"**: Build for today's requirements only
- **Manual Before Automatic**: Implement manual processes before automating
- **Local Before Cloud**: Get it working locally before thinking about deployment

#### Database Rules
- **Start with Convex Defaults**: Use Convex's built-in features before custom solutions
- **Simple Schema**: Flat, denormalized data is fine to start
- **No Premature Indexes**: Add indexes only when queries are slow
- **Basic Validation**: Simple field validation only, no complex business rules

#### UI Rules
- **Basic Components First**: HTML + Tailwind before component libraries
- **No Custom Design System**: Use Tailwind defaults
- **Simple Forms**: Basic HTML forms before fancy form libraries
- **Static Before Dynamic**: Static pages before real-time updates

#### Security Rules (NON-NEGOTIABLE)
- **No Secrets in Code**: Never commit API keys, passwords, or credentials to version control
- **Environment Variables**: Use .env files for secrets, always provide .env.example templates
- **Input Validation**: Validate and sanitize all user inputs, especially financial data
- **HTTPS Only**: All communications must use HTTPS in production
- **Audit Logging**: Log all financial operations for compliance and debugging
- **PII Protection**: Never log sensitive user data (account numbers, SSNs, etc.)
- **Rate Limiting**: Implement rate limiting on all API endpoints
- **Error Messages**: Don't leak sensitive information in error responses

### Red Flags to Avoid
❌ "What if we need to scale to millions of users?"
❌ "Let's make this configurable for the future"
❌ "We should add an abstraction layer"
❌ "This needs to be pluggable"
❌ "Let's use dependency injection"
❌ "We can hardcode this API key for now" (SECURITY VIOLATION)
❌ "Let's log the full request for debugging" (PII RISK)
❌ "We need a state management library"
❌ "Should we add TypeScript generics here?"
❌ "Let's create a base class for this"

### Green Flags to Follow
✅ "Let's get something working first"
✅ "This 50-line component does the job"
✅ "We can refactor this later if needed"
✅ "Let's hardcode this for now" (NON-SECRETS ONLY)
✅ "A simple function will work"
✅ "Let's test with real users first"
✅ "Copy this code for now"
✅ "Ship it and iterate"

#### Security Green Flags
✅ "Let's use environment variables for this"
✅ "I'll add input validation first"
✅ "Let's encrypt this sensitive data"
✅ "We should audit log this operation"
✅ "This needs rate limiting"
✅ "Let's not log the user's personal info"
✅ "HTTPS is required for this"
✅ "Let's validate this on the server too"

### When to Add Complexity
Only add complexity when you have:
1. **Repeated Pain**: You've hit the same problem 3+ times
2. **Measured Performance Issues**: Actual metrics showing slowness
3. **User Feedback**: Real users asking for specific features
4. **Maintenance Burden**: Simple approach is taking more time than complex would save
5. **Architecture Scale Triggers**: >1000 users, >3 developers, or slice conflicts (see ATOMIC_VERTICAL_SLICE_HYBRID_GOVERNANCE.md)

## AI Model Integration Rules

### Leveraging Atlas Financial AI Models
The main Atlas Financial project has already researched and identified optimal open-source models from Hugging Face. We will use these proven models to accelerate our development:

#### Specialist Models (From Atlas Financial Research)
- **Budget Specialist**: FinMA-7B-NLP (TheFinAI/finma-7b-nlp)
  - Financial NLP specialist optimized for budget analysis
  - Already fine-tuned on Kaggle for free inference
  
- **Investment Specialist**: FinMA-7B-Full (TheFinAI/finma-7b-full)
  - Comprehensive financial analysis capabilities
  - Already fine-tuned on Kaggle for free inference
  
- **Debt Specialist**: FinGPT v3.2
  - Proven financial advice generation
  - Already fine-tuned on Kaggle for free inference
  
- **Supervisor/Coordinator**: Mistral-7B or similar open model
  - Use Kaggle for free inference
  - No paid API calls needed

#### AI Integration Rules
1. **Use Proven Models**: Don't research new models - use the ones already validated
2. **Use Kaggle-Trained Models**: Leverage the fine-tuned models from Atlas Financial's Kaggle notebooks (free inference)
3. **No Additional Training**: Models are already fine-tuned on Kaggle - use them as-is
4. **Gradual Rollout**: Start with one specialist, validate, then add others
5. **Convex for Orchestration**: Use Convex functions to coordinate model inference, not complex architectures

#### Implementation Priority
1. **Phase 1**: Single AI feature with one specialist model
2. **Phase 2**: Add coordinator only after single model works
3. **Phase 3**: Multi-agent only after demonstrable need

## SuperClaude Framework Integration

### Sub-Agent Hierarchy (From SuperClaude)

#### Available Personas/Sub-Agents
1. **frontend-ux-specialist**: UI/UX improvements, accessibility, performance optimization
2. **backend-reliability-engineer**: Server-side development, API design, database operations
3. **systems-architect**: Architectural analysis, system design, scalability planning
4. **security-threat-modeler**: Security assessments, vulnerability analysis, compliance
5. **performance-optimizer**: Performance optimization, bottleneck identification
6. **quality-assurance-specialist**: Testing strategies, quality assessment, validation
7. **root-cause-analyzer**: Systematic investigation, debugging, root cause analysis
8. **code-quality-refactorer**: Code quality improvement, technical debt reduction
9. **professional-documentation-writer**: Documentation creation, content localization
10. **knowledge-transfer-mentor**: Educational explanations, learning guidance
11. **devops-infrastructure-specialist**: Infrastructure automation, deployment, monitoring

#### Task Delegation Rules
- **Auto-Delegation Triggers**:
  - >7 directories OR >50 files → Auto-delegate with `--delegate folders`
  - Complex debugging → root-cause-analyzer
  - UI components → frontend-ux-specialist
  - API development → backend-reliability-engineer
  - Performance issues → performance-optimizer

#### Wave Orchestration (When Needed)
- **Wave Auto-Activation**: complexity ≥0.7 AND files >20 AND operation_types >2
- **For This Project**: Keep waves disabled initially (--wave-mode off)

### Command Integration for Personal-Fin-App

#### Phase 1 Commands (Start Here)
- `/build` - Build features with Convex + Next.js
- `/implement` - Implement specific functionality
- `/analyze` - Analyze code or requirements
- `/improve` - Improve existing code

#### When to Use Sub-Agents
1. **Frontend Work** → `--persona-frontend` or frontend-ux-specialist
2. **Convex Functions** → `--persona-backend` or backend-reliability-engineer
3. **AI Integration** → `--persona-architect` for design decisions
4. **Performance Issues** → `--persona-performance` or performance-optimizer

#### Quality Gates (From SuperClaude)
1. **Syntax validation** ✓
2. **Type checking** ✓
3. **Linting** ✓
4. **Security scan** ✓
5. **Test coverage** (when tests added)
6. **Performance check** (when metrics available)
7. **Documentation** ✓
8. **Integration validation** ✓

### Practical Application for This Project

#### DO Use Sub-Agents When:
- ✅ Building complex UI components (frontend-ux-specialist)
- ✅ Designing Convex schema (systems-architect)
- ✅ Integrating Kaggle models (backend-reliability-engineer)
- ✅ Debugging issues (root-cause-analyzer)

#### DON'T Use Sub-Agents When:
- ❌ Simple CRUD operations
- ❌ Basic UI updates
- ❌ Configuration changes
- ❌ Tasks under 50 lines of code

### Integration with Existing Rules
- **Keep It Simple**: Only invoke sub-agents for complex tasks
- **Evidence-Based**: Use delegation metrics to decide
- **Progressive Enhancement**: Start without sub-agents, add when needed
- **Convex-First**: All sub-agents work within Convex + Next.js constraints

## Documentation & Version Control Rules (MANDATORY)

### Automatic Documentation Updates
**MANDATORY**: After EVERY code change, feature addition, or bug fix:

1. **Update Memory Files**:
   - Update `CLAUDE.md` with current context and changes made
   - Update `CHANGELOG.md` with version entry following semantic versioning
   - Update relevant README files if functionality changed
   - Update any affected documentation files

2. **Version Control Commit**:
   - Stage all changes including documentation updates
   - Create descriptive commit message following format:
     ```
     feat|fix|docs|chore: brief description
     
     - Detailed change 1
     - Detailed change 2
     - Updated CLAUDE.md and CHANGELOG.md
     
     🤖 Generated with [Claude Code](https://claude.ai/code)
     
     Co-Authored-By: Claude <noreply@anthropic.com>
     ```
   - Execute git commit after each logical unit of work

3. **Version Numbering**:
   - **MAJOR.MINOR.PATCH** format (e.g., 0.3.1)
   - **PATCH**: Bug fixes, documentation updates (0.3.0 → 0.3.1)
   - **MINOR**: New features, significant changes (0.3.0 → 0.4.0)
   - **MAJOR**: Breaking changes, major refactors (0.3.0 → 1.0.0)

### Documentation Update Checklist
After each change, verify:
- [ ] CLAUDE.md reflects current project state
- [ ] CHANGELOG.md has new version entry with changes
- [ ] README files updated if user-facing changes
- [ ] Code comments added for complex logic
- [ ] Environment variables documented if added
- [ ] Git commit created with descriptive message

### Example Workflow
```bash
# After making changes
1. Update CLAUDE.md with session context
2. Add CHANGELOG.md entry (e.g., [0.3.1] - Fixed authentication bug)
3. Update README if needed
4. Stage all changes: git add .
5. Commit: git commit -m "fix: resolve auth token validation issue

- Fixed undefined currentUser in useSubscription hook
- Added proper error handling for auth failures
- Updated CLAUDE.md and CHANGELOG.md

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Enforcement
- **NO EXCEPTIONS**: Every code change must include documentation updates
- **ATOMIC COMMITS**: Each feature/fix gets its own commit with docs
- **CONTINUOUS HISTORY**: Maintain complete development history
- **TEAM VISIBILITY**: All changes tracked for collaboration

## Sub-Agent Documentation & Version Control Rules (MANDATORY)

### Sub-Agent Compliance Requirements
**MANDATORY**: All sub-agents (Task tool delegations) must follow the same documentation standards:

1. **Sub-Agent Documentation Responsibilities**:
   - Sub-agents must provide complete change summaries for main agent
   - Include all files modified, added, or deleted
   - Document any configuration changes or environment updates
   - Note any new dependencies or version changes
   - Report any issues encountered or technical debt created

2. **Main Agent Integration Requirements**:
   - Review all sub-agent outputs for completeness
   - Update CLAUDE.md with sub-agent work summary
   - Update CHANGELOG.md with consolidated version entry
   - Create single git commit encompassing all sub-agent changes
   - Verify all documentation is current and accurate

3. **Sub-Agent Handoff Protocol**:
   ```
   Sub-Agent Deliverable Format:
   - Summary of changes made
   - List of files modified/added/deleted
   - Configuration or environment changes
   - New dependencies or version updates
   - Issues encountered or technical debt
   - Testing performed or required
   - Documentation updates needed
   ```

4. **Quality Gates for Sub-Agent Work**:
   - All sub-agent changes must pass project quality standards
   - Sub-agents must follow anti-over-engineering principles
   - Security rules (NON-NEGOTIABLE) apply to all sub-agent work
   - Sub-agents must maintain hybrid consolidated-slice architecture

### Sub-Agent Workflow Example
```bash
# After sub-agent completes work:
1. Review sub-agent deliverable summary
2. Validate all changes align with project rules
3. Update CLAUDE.md with sub-agent work integration
4. Update CHANGELOG.md with consolidated changes
5. Stage all changes: git add .
6. Commit with format: "feat: implement feature via sub-agent delegation

- Sub-agent completed: [specific work]
- Files modified: [list]
- Updated CLAUDE.md and CHANGELOG.md

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Sub-Agent Documentation Standards
- **Task Delegation**: Document why sub-agent was used and what expertise was needed
- **Work Integration**: Show how sub-agent work fits into overall project architecture
- **Quality Assurance**: Verify sub-agent work meets project standards
- **Knowledge Transfer**: Ensure understanding of sub-agent changes for future maintenance

### Sub-Agent Accountability
- Main agent remains responsible for all project documentation
- Sub-agent work must be validated and integrated properly
- No sub-agent work committed without main agent review and documentation
- All sub-agent contributions tracked in project history

---
*These rules will be updated as the project evolves and we learn from real usage.*