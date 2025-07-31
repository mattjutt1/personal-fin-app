#!/bin/bash
# Quick Project Status - Memory System Integration
# Provides instant project overview for new developers or session continuity

PROJECT_ROOT="/home/matt/Atlas-Financial/personal-fin-app"

echo "🎯 Personal Finance App - Quick Status"
echo "======================================"
echo "📅 $(date)"
echo ""

# 1. Current Project Phase
echo "📊 PROJECT OVERVIEW"
echo "==================="
CURRENT_PHASE=$(grep "Status.*:" "$PROJECT_ROOT/PROJECT_ROADMAP.md" | head -1 | cut -d':' -f2 | xargs)
ARCHITECTURE=$(grep "Architecture.*:" "$PROJECT_ROOT/PROJECT_ROADMAP.md" | head -1 | cut -d':' -f2 | xargs)
NEXT_MILESTONE=$(grep "Next Milestone.*:" "$PROJECT_ROOT/PROJECT_ROADMAP.md" | head -1 | cut -d':' -f2 | xargs)

echo "Status: $CURRENT_PHASE"
echo "Architecture: $ARCHITECTURE"
echo "Next Milestone: $NEXT_MILESTONE"
echo ""

# 2. Recent Progress (from CLAUDE.md)
echo "✅ RECENT PROGRESS"
echo "=================="
echo "From memory system (CLAUDE.md):"
grep -A 5 "✓.*Architecture Research" "$PROJECT_ROOT/CLAUDE.md" 2>/dev/null | head -3
grep -A 5 "✓.*Governance Framework" "$PROJECT_ROOT/CLAUDE.md" 2>/dev/null | head -3
grep -A 5 "✓.*Slice Structure" "$PROJECT_ROOT/CLAUDE.md" 2>/dev/null | head -3
echo ""

# 3. Current Active Work
echo "🔄 CURRENT FOCUS"
echo "================"
echo "From roadmap and memory:"
grep -A 8 "This Week's Priorities" "$PROJECT_ROOT/PROJECT_ROADMAP.md" 2>/dev/null | head -10
echo ""

# 4. Architecture Status
echo "🏗️ ARCHITECTURE STATUS"
echo "======================"
echo "Slice Organization:"
if [ -d "$PROJECT_ROOT/frontend/src/slices" ]; then
    ls "$PROJECT_ROOT/frontend/src/slices" | sed 's/^/  ✓ /'
else
    echo "  ⚠️  Slice structure not found"
fi
echo ""

echo "Governance Files:"
GOVERNANCE_FILES=(
    "PROJECT_RULES.md"
    "ATOMIC_VERTICAL_SLICE_HYBRID_GOVERNANCE.md"
    "DEVELOPMENT_GOVERNANCE.md"
    "GOVERNANCE_SYSTEM.md"
    "PROJECT_ROADMAP.md"
)

for file in "${GOVERNANCE_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done
echo ""

# 5. Development Environment Status
echo "⚙️ DEVELOPMENT ENVIRONMENT"
echo "=========================="
echo "Tech Stack:"
if [ -f "$PROJECT_ROOT/frontend/package.json" ]; then
    echo "  ✓ Next.js + Convex frontend"
else
    echo "  ❌ Frontend not configured"
fi

if [ -f "$PROJECT_ROOT/frontend/.env.local" ]; then
    echo "  ✓ Convex environment configured"
else
    echo "  ❌ Convex environment not configured"
fi

if [ -d "$PROJECT_ROOT/frontend/convex" ]; then
    CONVEX_FUNCTIONS=$(ls "$PROJECT_ROOT/frontend/convex"/*.ts 2>/dev/null | wc -l)
    echo "  ✓ $CONVEX_FUNCTIONS Convex functions defined"
else
    echo "  ❌ Convex functions not found"
fi
echo ""

# 6. Quality & Compliance Status
echo "🛡️ QUALITY STATUS"
echo "================="

# Check file size compliance (anti-over-engineering)
LARGE_FILES=$(find "$PROJECT_ROOT" -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | awk '$1 > 200 {count++} END {print count+0}')
echo "Anti-over-engineering compliance:"
if [ "$LARGE_FILES" -eq 0 ]; then
    echo "  ✓ All files under 200 lines"
else
    echo "  ⚠️  $LARGE_FILES files exceed 200 line limit"
fi

# Check slice independence
echo "Slice independence:"
if [ -d "$PROJECT_ROOT/frontend/src/slices" ]; then
    SLICE_COUNT=$(ls "$PROJECT_ROOT/frontend/src/slices" 2>/dev/null | wc -l)
    echo "  ✓ $SLICE_COUNT slices organized vertically"
else
    echo "  ❌ Slice organization not implemented"
fi
echo ""

# 7. Next Actions
echo "📋 IMMEDIATE NEXT ACTIONS"
echo "========================="
echo "Based on current status:"

# Determine next actions from current progress
if grep -q "🔄 Transaction Management Slice" "$PROJECT_ROOT/PROJECT_ROADMAP.md"; then
    echo "  🎯 Priority 1: Complete Transaction Management Slice UI"
    echo "  📋 Priority 2: Test slice independence and boundaries"
    echo "  🔄 Priority 3: Prepare Budget Tracking Slice structure"
elif grep -q "✅.*Transaction.*complete" "$PROJECT_ROOT/PROJECT_ROADMAP.md"; then
    echo "  🎯 Priority 1: Begin Budget Tracking Slice"
    echo "  📋 Priority 2: Validate multi-slice architecture"
    echo "  🔄 Priority 3: Document architecture patterns"
else
    echo "  🎯 Priority 1: Complete current milestone"
    echo "  📋 Priority 2: Update roadmap with progress"
    echo "  🔄 Priority 3: Follow governance procedures"
fi
echo ""

# 8. Key Commands for Development
echo "⚡ QUICK COMMANDS"
echo "================"
echo "Development workflow:"
echo "  cat CLAUDE.md | head -20          # Get current context"
echo "  cat PROJECT_ROADMAP.md | head -30 # Check roadmap status"
echo "  cd frontend && npm run dev        # Start development"
echo "  ./scripts/update-roadmap.sh       # Update roadmap"
echo ""

echo "Governance checks:"
echo "  grep 'Red Flags' PROJECT_RULES.md # Check anti-over-engineering"
echo "  grep 'Quality Gates' ATOMIC_*      # Check architecture compliance"
echo "  cat GOVERNANCE_QUICK_REFERENCE.md # Daily workflow commands"
echo ""

# 9. Health Check Summary
echo "🏥 HEALTH CHECK SUMMARY"
echo "======================"
HEALTH_SCORE=0
MAX_SCORE=10

# Architecture foundation
if [ -f "$PROJECT_ROOT/ATOMIC_VERTICAL_SLICE_HYBRID_GOVERNANCE.md" ]; then
    HEALTH_SCORE=$((HEALTH_SCORE + 2))
fi

# Governance system
if [ -f "$PROJECT_ROOT/GOVERNANCE_SYSTEM.md" ]; then
    HEALTH_SCORE=$((HEALTH_SCORE + 2))
fi

# Slice organization
if [ -d "$PROJECT_ROOT/frontend/src/slices" ]; then
    HEALTH_SCORE=$((HEALTH_SCORE + 2))
fi

# Development environment
if [ -f "$PROJECT_ROOT/frontend/.env.local" ]; then
    HEALTH_SCORE=$((HEALTH_SCORE + 2))
fi

# Memory system integration
if [ -f "$PROJECT_ROOT/CLAUDE.md" ] && [ -f "$PROJECT_ROOT/PROJECT_ROADMAP.md" ]; then
    HEALTH_SCORE=$((HEALTH_SCORE + 2))
fi

HEALTH_PERCENTAGE=$((HEALTH_SCORE * 100 / MAX_SCORE))

echo "Overall Project Health: $HEALTH_SCORE/$MAX_SCORE ($HEALTH_PERCENTAGE%)"

if [ "$HEALTH_PERCENTAGE" -ge 80 ]; then
    echo "Status: 🟢 Excellent - Ready for active development"
elif [ "$HEALTH_PERCENTAGE" -ge 60 ]; then
    echo "Status: 🟡 Good - Minor setup needed"
else
    echo "Status: 🔴 Needs attention - Setup incomplete"
fi

echo ""
echo "======================================"
echo "💡 Run './scripts/update-roadmap.sh' to sync latest progress"
echo "📖 Check 'PROJECT_ROADMAP.md' for detailed roadmap"
echo "🎮 Use 'GOVERNANCE_QUICK_REFERENCE.md' for daily commands"