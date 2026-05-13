# ============================================================
# RiBuzz AI — Setup inicial del repositorio Git
# Ejecutar desde PowerShell en la carpeta ribuzz-ai/
# ============================================================
# Uso:
#   1. Abre PowerShell
#   2. cd C:\Users\User\Documents\RiBuzzAi\ribuzz-ai
#   3. .\git-init.ps1 -RepoUrl "https://github.com/TU_USUARIO/ribuzz-ai.git"
# ============================================================

param(
    [string]$RepoUrl = ""
)

Write-Host "`n🚀 RiBuzz AI — Inicializando repositorio Git" -ForegroundColor Cyan

# 1. Inicializar repo
git init -b main
git config user.email "jdbb2108@gmail.com"
git config user.name "Jose Barrientos"

# 2. Crear .gitignore local (refuerzo)
$gitignoreContent = @"
# Dependencies
node_modules/

# Next.js
.next/
out/

# Env (NUNCA subir credenciales)
.env
.env.*

# Logs
*.log
next-dev.err.log
next-dev.log

# TypeScript
*.tsbuildinfo

# OS
.DS_Store
Thumbs.db
"@
$gitignoreContent | Set-Content -Encoding UTF8 .gitignore

# 3. Agregar todos los archivos (excluyendo lo del .gitignore)
git add .

# 4. Commit inicial
git commit -m "feat: RiBuzz AI v2 — 40 questions, n8n multi-agent workflow

Stack: Next.js 14 + Supabase + Claude API + n8n
- Diagnostic flow: 40 questions across 9 blocks (A-I)
- 5 AI prompts (P1-P5): synthesis, scorer, report, playbook, classifier
- n8n workflow: 8 agents (synthesizer, 4x scorers, top-fugas, reporter, playbook, lead-classifier)
- Supabase migrations: initial schema, RLS, user trigger, processing_jobs, 40q support
- API routes: /diagnostic/save, /diagnostic/process, /jobs/[id], /admin/leads
- Full admin panel at /admin
- docs/agent-prompts.md + n8n/SETUP.md"

Write-Host "`n✅ Commit local creado." -ForegroundColor Green

# 5. Conectar a GitHub (opcional)
if ($RepoUrl -ne "") {
    git remote add origin $RepoUrl
    git push -u origin main
    Write-Host "✅ Código subido a GitHub: $RepoUrl" -ForegroundColor Green
    Write-Host "`n📋 Enlace del repo: $RepoUrl" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  No se pasó URL de GitHub." -ForegroundColor Yellow
    Write-Host "    Para subir a GitHub, crea el repo en https://github.com/new y luego ejecuta:" -ForegroundColor White
    Write-Host "    git remote add origin https://github.com/TU_USUARIO/ribuzz-ai.git" -ForegroundColor Cyan
    Write-Host "    git push -u origin main" -ForegroundColor Cyan
}

Write-Host "`n🏁 Listo. El historial de Git está en ribuzz-ai/.git" -ForegroundColor Green
