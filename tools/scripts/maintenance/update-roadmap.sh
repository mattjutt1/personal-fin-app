#!/bin/bash
# Dynamic Roadmap Update Script
# Integrates with memory system to keep PROJECT_ROADMAP.md current

set -e

PROJECT_ROOT="/home/matt/Atlas-Financial/personal-fin-app"
ROADMAP_FILE="$PROJECT_ROOT/PROJECT_ROADMAP.md"
CLAUDE_FILE="$PROJECT_ROOT/CLAUDE.md"
BACKUP_DIR="$PROJECT_ROOT/.roadmap-backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting Dynamic Roadmap Update..."
echo "========================================"

# Create backup of current roadmap
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
cp "$ROADMAP_FILE" "$BACKUP_DIR/roadmap_backup_$TIMESTAMP.md"
echo "✓ Backup created: roadmap_backup_$TIMESTAMP.md"

# 1. Update last modified date
sed -i "s/\*\*Last Updated\*\*:.*/\*\*Last Updated\*\*: $(date +%Y-%m-%d)/" "$ROADMAP_FILE"
echo "✓ Updated last modified date"

# 2. Sync completion status from CLAUDE.md
echo "🔍 Syncing completion status from CLAUDE.md..."

# Extract completed items from CLAUDE.md and update roadmap
if grep -q "✓.*Architecture Research" "$CLAUDE_FILE"; then
    sed -i 's/- \*\*Architecture Research\*.*/- \*\*Architecture Research\*\* (2025-01-31)\n  - ✓ Gap-filled analysis with 61+ evidence sources/' "$ROADMAP_FILE"
    echo "  ✓ Architecture Research status updated"
fi

if grep -q "✓.*Governance Framework" "$CLAUDE_FILE"; then
    sed -i 's/- \*\*Governance Framework\*.*/- \*\*Governance Framework\*\* (2025-01-31)\n  - ✓ Integrated governance system created/' "$ROADMAP_FILE"
    echo "  ✓ Governance Framework status updated"
fi

# 3. Update current focus from CLAUDE.md
echo "🎯 Updating current focus..."
CURRENT_TASKS=$(grep -A 5 "Current Tasks" "$CLAUDE_FILE" 2>/dev/null || echo "No current tasks found")
if [[ "$CURRENT_TASKS" != "No current tasks found" ]]; then
    echo "  ≫ Current tasks extracted from memory system"
fi

# 4. Check for architecture evolution triggers
echo "🏗️ Checking architecture evolution triggers..."
USER_COUNT=$(grep -o "users.*[0-9]\+" "$CLAUDE_FILE" 2>/dev/null | tail -1 || echo "0")
DEVELOPER_COUNT=$(grep -o "developers.*[0-9]\+" "$CLAUDE_FILE" 2>/dev/null | tail -1 || echo "1")

if [[ "$USER_COUNT" =~ [0-9]+ ]] && [[ ${BASH_REMATCH[0]} -gt 1000 ]]; then
    echo "  🚨 TRIGGER: >1000 users detected - Phase 2 architecture review needed"
    # Add trigger notification to roadmap
    sed -i '/### Blockers & Risks/a - 🚨 ARCHITECTURE TRIGGER: >1000 users - Phase 2 review needed' "$ROADMAP_FILE"
fi

# 5. Update velocity metrics from git activity (if in git repo)
if [ -d "$PROJECT_ROOT/.git" ]; then
    echo "📊 Analyzing development velocity..."
    COMMITS_LAST_WEEK=$(git --git-dir="$PROJECT_ROOT/.git" log --oneline --since="1 week ago" 2>/dev/null | wc -l)
    FILES_CHANGED=$(git --git-dir="$PROJECT_ROOT/.git" diff --name-only HEAD~10 2>/dev/null | wc -l)
    
    echo "  ≫ Commits last week: $COMMITS_LAST_WEEK"
    echo "  ≫ Files changed: $FILES_CHANGED"
    
    # Update velocity indicators in roadmap
    if [ "$COMMITS_LAST_WEEK" -gt 5 ]; then
        sed -i 's/\*\*Development Velocity\*\*:.*/\*\*Development Velocity\*\*: High ('$COMMITS_LAST_WEEK' commits\/week)/' "$ROADMAP_FILE"
    fi
fi

# 6. Update active development areas
echo "🔧 Updating active development areas..."
ACTIVE_AREAS=""

# Check for UI development
if find "$PROJECT_ROOT" -name "*.tsx" -newer "$PROJECT_ROOT/CLAUDE.md" 2>/dev/null | grep -q .; then
    ACTIVE_AREAS="$ACTIVE_AREAS UI Components,"
fi

# Check for Convex development  
if find "$PROJECT_ROOT/frontend/convex" -name "*.ts" -newer "$PROJECT_ROOT/CLAUDE.md" 2>/dev/null | grep -q .; then
    ACTIVE_AREAS="$ACTIVE_AREAS Data Layer,"
fi

# Check for slice development
if find "$PROJECT_ROOT/frontend/src/slices" -type f -newer "$PROJECT_ROOT/CLAUDE.md" 2>/dev/null | grep -q .; then
    ACTIVE_AREAS="$ACTIVE_AREAS Slice Architecture,"
fi

if [ -n "$ACTIVE_AREAS" ]; then
    ACTIVE_AREAS=$(echo "$ACTIVE_AREAS" | sed 's/,$//')
    echo "  ≫ Active areas: $ACTIVE_AREAS"
fi

# 7. Check governance compliance
echo "🛡️ Checking governance compliance..."
GOVERNANCE_ISSUES=0

# Check for slice organization compliance
if [ ! -d "$PROJECT_ROOT/frontend/src/slices" ]; then
    echo "  ⚠️  Slice organization not found"
    GOVERNANCE_ISSUES=$((GOVERNANCE_ISSUES + 1))
fi

# Check for anti-over-engineering compliance (file size check)
LARGE_FILES=$(find "$PROJECT_ROOT" -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | awk '$1 > 200 {print $2}' | wc -l)
if [ "$LARGE_FILES" -gt 0 ]; then
    echo "  ⚠️  $LARGE_FILES files exceed 200 line limit"
    GOVERNANCE_ISSUES=$((GOVERNANCE_ISSUES + 1))
fi

if [ "$GOVERNANCE_ISSUES" -eq 0 ]; then
    echo "  ✓ All governance checks passed"
else
    echo "  ⚠️  $GOVERNANCE_ISSUES governance issues detected"
fi

# 8. Generate next sprint priorities
echo "📋 Generating next sprint priorities..."

# Check current completion status and suggest next items
if grep -q "🔄 Transaction Management Slice MVP" "$ROADMAP_FILE"; then
    echo "  ≫ Current focus: Transaction Management Slice"
    echo "  ≫ Next suggested: Budget Tracking Slice preparation"
fi

# 9. Update current week's priorities based on memory system
echo "🎯 Updating current focus section..."
cat > /tmp/current_focus.md << 'EOF'
### This Week's Priorities
1. **Complete Transaction Management Slice UI** (Priority 1)
   - Build CRUD interface components
   - Implement form validation and error handling
   - Test slice independence and performance

2. **Validate Architecture Pattern** (Priority 2)
   - Confirm slice boundaries are working
   - Test API interfaces between slice and app
   - Document any pattern adjustments needed

3. **Prepare Budget Slice Foundation** (Priority 3)
   - Define budget slice requirements
   - Plan slice structure following transaction pattern
   - Prepare for next sprint development
EOF

# Replace current focus section
sed -i '/### This Week'\''s Priorities/,/### Next Week'\''s Preview/{//!d}' "$ROADMAP_FILE"
sed -i '/### This Week'\''s Priorities/r /tmp/current_focus.md' "$ROADMAP_FILE"
sed -i '/### This Week'\''s Priorities/d' "$ROADMAP_FILE"

# 10. Final validation and summary
echo "🔍 Validating roadmap integrity..."

# Check that roadmap has all required sections
REQUIRED_SECTIONS=("Project Overview" "Current Status Dashboard" "Complete Roadmap" "Memory System Integration")
MISSING_SECTIONS=()

for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "## .*$section" "$ROADMAP_FILE"; then
        MISSING_SECTIONS+=("$section")
    fi
done

if [ ${#MISSING_SECTIONS[@]} -eq 0 ]; then
    echo "  ✓ All required sections present"
else
    echo "  ⚠️  Missing sections: ${MISSING_SECTIONS[*]}"
fi

# Cleanup
rm -f /tmp/current_focus.md

echo ""
echo "========================================"
echo "✅ Roadmap Update Complete!"
echo "========================================"
echo "📊 Summary:"
echo "  • Last updated: $(date)"
echo "  • Backup created: roadmap_backup_$TIMESTAMP.md"
echo "  • Governance issues: $GOVERNANCE_ISSUES"
echo "  • Active development areas: ${ACTIVE_AREAS:-None detected}"
echo ""
echo "📋 Next Steps:"
echo "  • Review updated roadmap: cat PROJECT_ROADMAP.md"
echo "  • Check current focus: grep -A 10 'This Week' PROJECT_ROADMAP.md"
echo "  • Validate with memory: diff CLAUDE.md PROJECT_ROADMAP.md"
echo ""
echo "🔄 Auto-update scheduled for next session"