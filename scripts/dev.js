import { execSync, spawn } from 'child_process'

const PORT = 5173

try {
  execSync(`npx kill-port ${PORT}`, { stdio: 'pipe' })
  console.log(`Port ${PORT} serbest bırakıldı.`)
} catch (_) {
  // Port zaten boşta, devam et
}

const proc = spawn('npx vite', [], { stdio: 'inherit', shell: true })
proc.on('exit', (code) => process.exit(code ?? 0))
