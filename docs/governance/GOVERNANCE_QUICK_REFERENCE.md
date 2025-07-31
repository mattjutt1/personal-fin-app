# Governance Quick Reference

## 🚀 Daily Commands

### Start Development Session
```bash
# 1. Get project context
cat CLAUDE.md | head -20

# 2. Check current rules
grep -A 10 "Anti-Over-Engineering Rules" PROJECT_RULES.md

# 3. Validate architecture status
grep -A 5 "Phase 1" ATOMIC_VERTICAL_SLICE_HYBRID_GOVERNANCE.md

# 4. Check for pending decisions
grep -A 3 "Decision Needed" DEVELOPMENT_GOVERNANCE.md
```

### During Development
```bash
# Quick compliance check
echo "Slice independence? Vertical organization? Anti-over-engineering?"

# Quality gate check  
echo "Self-contained? Clear boundaries? Simple first?"
```

### End Session
```bash
# Update session progress
echo "## Session - $(date +%Y-%m-%d)" >> CLAUDE.md
echo "### Done: [what was completed]" >> CLAUDE.md
echo "### Next: [priority for next session]" >> CLAUDE.md
```

---

## 📋 Decision Matrix

### When to Use Which File

| Need | File | Quick Command |
|------|------|---------------|
| **Current project status** | CLAUDE.md | `cat CLAUDE.md \| head -30` |
| **Development constraints** | PROJECT_RULES.md | `grep "Rules" PROJECT_RULES.md` |
| **Architecture compliance** | ATOMIC_*_GOVERNANCE.md | `grep "Quality Gates" ATOMIC_*` |
| **Human decisions needed** | DEVELOPMENT_GOVERNANCE.md | `grep "Decision" DEVELOPMENT_*` |
| **Session handoff** | SESSION_TEMPLATE.md | `cp SESSION_TEMPLATE.md session-$(date +%m%d).md` |
| **Memory updates** | MEMORY_UPDATE_GUIDE.md | `cat MEMORY_UPDATE_GUIDE.md` |

---

## ⚡ Emergency Quick Actions

### Over-Engineering Detected
```bash
# STOP → CHECK → FIX
echo "STOP: Over-engineering detected"
grep -A 5 "Red Flags" PROJECT_RULES.md
echo "Apply: Simplification rules"
```

### Architecture Violation  
```bash
# STOP → ASSESS → REMEDIATE
echo "STOP: Architecture violation"
grep -A 3 "Quality Gates" ATOMIC_VERTICAL_SLICE_HYBRID_GOVERNANCE.md
echo "Apply: Slice boundary fixes"
```

### Decision Conflict
```bash
# ESCALATE → DOCUMENT → RESOLVE
echo "ESCALATE: Human decision needed"
grep -A 5 "Escalation" DEVELOPMENT_GOVERNANCE.md
echo "Document in CLAUDE.md and get human input"
```

---

## 🎯 File Update Workflow

### When to Update Each File

| Trigger | File to Update | What to Record |
|---------|----------------|----------------|
| **Feature completed** | CLAUDE.md | Progress, decisions, next steps |
| **Architecture decision** | ATOMIC_*_GOVERNANCE.md | Pattern changes, compliance updates |
| **Rule modification** | PROJECT_RULES.md | New constraints or exceptions |
| **Process change** | DEVELOPMENT_GOVERNANCE.md | Workflow or quality gate updates |
| **Session end** | SESSION_TEMPLATE.md | Handoff information |
| **Context change** | MEMORY_UPDATE_GUIDE.md | Memory maintenance needs |

---

## 📊 Health Check Commands

### Daily Health Check
```bash
# File consistency
echo "Checking governance file consistency..."
grep -r "CLAUDE.md" *.md | wc -l
grep -r "PROJECT_RULES" *.md | wc -l
grep -r "ATOMIC_" *.md | wc -l

# Rule compliance  
echo "Checking anti-over-engineering compliance..."
find . -name "*.ts" -o -name "*.tsx" | wc -l
echo "Files should be <200 lines each"

# Architecture compliance
echo "Checking slice organization..."
ls -la src/slices/*/
echo "Each slice should have ui/, logic/, data/, types/"
```

### Weekly Health Check
```bash
# Governance evolution check
echo "=== Weekly Governance Review ==="
echo "1. Are rules helping or hindering?"
echo "2. Is architecture pattern working?"
echo "3. Are quality gates effective?"
echo "4. Is documentation current?"
echo "5. Any governance gaps discovered?"
```

---

## 🔧 Integration Commands

### Cross-File Validation
```bash
# Check all governance integrations
echo "=== Governance Integration Check ==="
echo "GOVERNANCE_SYSTEM.md references:"
grep -o "[A-Z_]*\.md" GOVERNANCE_SYSTEM.md | sort | uniq

echo "Actual MD files:"
ls *.md | sort

echo "Missing references or files?"
```

### Decision Traceability
```bash
# Track decision through all files
echo "Decision: $1"
echo "CLAUDE.md entries:"
grep -n "$1" CLAUDE.md

echo "PROJECT_RULES.md entries:"  
grep -n "$1" PROJECT_RULES.md

echo "Governance entries:"
grep -n "$1" *GOVERNANCE*.md
```

---

## 🎯 Common Scenarios

### Starting New Feature
```bash
# 1. Context check
echo "Current project state:"
tail -10 CLAUDE.md

# 2. Rules check  
echo "Development constraints:"
grep -A 3 "Feature Rules" PROJECT_RULES.md

# 3. Architecture check
echo "Slice requirements:"
grep -A 3 "Atomic Component" ATOMIC_VERTICAL_SLICE_HYBRID_GOVERNANCE.md

# 4. Begin development with compliance
```

### Completing Feature
```bash
# 1. Quality gates
echo "Feature complete. Running quality gates:"
echo "✓ Anti-over-engineering check"
echo "✓ Architecture compliance"  
echo "✓ Performance validation"

# 2. Documentation
echo "### Feature Completed: $1" >> CLAUDE.md
echo "- Architecture: Slice-compliant" >> CLAUDE.md
echo "- Rules: Anti-over-engineering maintained" >> CLAUDE.md

# 3. Session handoff
echo "Ready for next session"
```

### Architecture Evolution Decision
```bash
# Scale trigger check
echo "=== Architecture Evolution Check ==="
echo "Users: $1 (>1000 triggers Phase 2)"
echo "Developers: $2 (>3 triggers review)"
echo "Slice conflicts: $3 (>0 triggers review)"

# Decision documentation
if [ $1 -gt 1000 ]; then
  echo "TRIGGER: Phase 2 architecture review needed"
  echo "Document in DEVELOPMENT_GOVERNANCE.md for human decision"
fi
```

---

## 💡 Best Practices

### Daily Routine
1. **Morning**: Check CLAUDE.md status, review PROJECT_RULES.md
2. **Development**: Follow slice patterns, apply anti-over-engineering
3. **Evening**: Update CLAUDE.md, complete session documentation

### Decision Making
1. **Small decisions**: Apply PROJECT_RULES.md directly
2. **Architecture decisions**: Check ATOMIC_*_GOVERNANCE.md compliance
3. **Complex decisions**: Use DEVELOPMENT_GOVERNANCE.md escalation

### Documentation  
1. **Real-time**: Document decisions as made
2. **Session-end**: Complete handoff documentation
3. **Weekly**: Review and update governance files

### Quality Maintenance
1. **Every commit**: Check slice boundaries
2. **Every feature**: Validate anti-over-engineering
3. **Every week**: Review governance effectiveness

---

*Keep this reference handy during development for quick governance compliance and effective project management.*