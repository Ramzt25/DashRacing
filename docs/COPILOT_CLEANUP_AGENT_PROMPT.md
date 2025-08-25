# COPILOT CLEANUP AGENT PROMPT
**Run this prompt while driving home to get a clean project structure**

---

## AGENT INSTRUCTIONS

You are a project cleanup specialist. The DashRacing project has duplicate folders, old files, and messy structure that needs to be organized. Your job is to:

1. **ANALYZE** the current structure and identify duplicates/old files
2. **CONSOLIDATE** into a clean, logical structure
3. **REMOVE** unnecessary duplicates and old build artifacts
4. **ORGANIZE** files into proper directories
5. **DOCUMENT** all changes made

## CURRENT PROJECT ISSUES TO FIX

### 📁 **Multiple Android Folders**
- `android/` (root level - old/duplicate)
- `gridghost-mobile-v2/android/` (correct location)
- `mobile/android/` (duplicate/old)

### 🗑️ **Old Build Artifacts**
- `dist/` folder (compiled TypeScript - should be in .gitignore)
- Multiple `.expo/` cache folders
- Old Gradle build outputs
- Backup files (`build.gradle.backup`, `schema_backup.prisma`)

### 📋 **Redundant Documentation**
- Multiple README files (`README.md`, `README2.md`)
- Multiple completion summaries and status files
- Old project status documents

### 🔧 **Configuration Cleanup**
- Multiple `azure.yaml` files
- Duplicate package.json files
- Old configuration files

## TARGET CLEAN STRUCTURE

```
DashRacing/
├── README.md                          # Main project README
├── package.json                       # Root package.json
├── azure.yaml                         # Main Azure config
├── docker-compose.yml                 # Docker setup
├── Dockerfile                         # Main Dockerfile
├── .gitignore                          # Git ignore rules
│
├── docs/                              # All documentation
│   ├── API_DOCUMENTATION.md
│   ├── SETUP_INSTRUCTIONS.md
│   └── DEPLOYMENT_GUIDE.md
│
├── backend/                           # Renamed from 'src'
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.ts
│   ├── routes/
│   ├── services/
│   └── lib/
│
├── mobile/                            # Renamed from 'gridghost-mobile-v2'
│   ├── package.json
│   ├── app.json
│   ├── eas.json
│   ├── src/
│   ├── android/                       # Keep only this android folder
│   ├── assets/
│   └── infra/
│
├── infrastructure/                    # Renamed from 'infra'
│   ├── main.bicep
│   ├── main.parameters.json
│   └── resources.bicep
│
├── database/                          # Renamed from 'prisma'
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
└── tests/
    ├── backend/
    ├── mobile/
    └── integration/
```

## CLEANUP COMMANDS TO EXECUTE

### 1. **Remove Duplicate Android Folders**
```bash
# Remove root level android folder (keep mobile/android/)
rm -rf android/
rm -rf mobile/android/
```

### 2. **Remove Build Artifacts**
```bash
# Remove compiled outputs
rm -rf dist/
rm -rf */dist/
rm -rf */.expo/
rm -rf */node_modules/
rm -rf */android/build/
rm -rf */android/.gradle/
```

### 3. **Remove Old/Backup Files**
```bash
# Remove backup files
rm -f build.gradle.backup
rm -f prisma/schema_backup.prisma
rm -f README2.md

# Remove old status files
rm -f *_COMPLETION_SUMMARY.md
rm -f *_STATUS.md
rm -f MORNING_STATUS_BRIEFING.md
rm -f PROJECT_STATUS.md
rm -f FINAL_PROJECT_STATUS.md
```

### 4. **Reorganize Directory Structure**
```bash
# Rename directories for clarity
mv src/ backend/
mv gridghost-mobile-v2/ mobile/
mv infra/ infrastructure/
mv prisma/ database/
```

### 5. **Consolidate Documentation**
```bash
# Move all docs to docs folder
mkdir -p docs/
mv *.md docs/ (except README.md, package.json related)
mv STEP_*.md docs/
mv WEEK_*.md docs/
```

### 6. **Update .gitignore**
```bash
# Add proper ignores
echo "
# Build outputs
dist/
build/
.expo/

# Dependencies
node_modules/

# Environment
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
" >> .gitignore
```

## VALIDATION STEPS

After cleanup, verify:
- [ ] Only ONE android folder exists (`mobile/android/`)
- [ ] No `dist/` folders in repository
- [ ] All documentation in `docs/` folder
- [ ] Backend renamed and organized
- [ ] Mobile app properly structured
- [ ] All tests organized in `tests/` folder
- [ ] .gitignore updated to prevent future mess

## COMMIT MESSAGE TEMPLATE
```
feat: Clean up project structure and remove duplicates

- Remove duplicate android folders (keep mobile/android/)
- Remove build artifacts and compiled outputs
- Consolidate documentation in docs/ folder  
- Rename directories for clarity (src->backend, etc.)
- Update .gitignore to prevent future build artifacts
- Remove old backup and status files

Clean structure ready for continued development.
```

---

## 🚗 WHILE DRIVING HOME

**Just copy/paste this prompt to Copilot:**

"Please execute the DashRacing project cleanup following the instructions in COPILOT_CLEANUP_AGENT_PROMPT.md. Analyze the current structure, remove duplicates and old files, reorganize into the target clean structure, and commit all changes with proper documentation. Focus on removing duplicate android folders, build artifacts, and consolidating documentation."

**Safe driving! 🚗💨**