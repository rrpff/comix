#!/usr/bin/env node

const { join, dirname, basename } = require('path')
const { spawn } = require('child_process')
const { red, green, grey } = require('chalk')
const { copy } = require('fs-extra')
const { build, glob, watch, cliopts, fmtDuration } = require('estrella')

const [_, args] = cliopts.parse(
  ['package', 'Build a specific package', '[package]'],
)

const [SPECIFIC_PACKAGE] = args

const common = {
  sourcemap: true,
  platform: 'node',
  format: 'esm',
  target: ['esnext'],
  tslint: false,
  bundle: false,
}

const packages = glob(join(__dirname, 'packages', '*', 'package.json'))

const tasks = packages.map(fpath => {
  const pkg = require(fpath)
  const dir = dirname(fpath)
  const name = basename(dir)

  if (pkg.build === undefined) return
  if (SPECIFIC_PACKAGE && name !== SPECIFIC_PACKAGE) return

  if (pkg.build.esbuild !== undefined)
    runBuild(pkg, dir)

  if (pkg.build.scripts !== undefined)
    runScripts(pkg, dir)
})

tasks.push(buildTypes(cliopts.watch))

Promise.all(tasks)
  .catch(e => {
    console.error(e)
    process.exit(1)
  })

function runBuild(pkg, dir) {
  const entries = glob(join(dir, pkg.build.esbuild.entry))
  const outdir = join(dir, pkg.build.esbuild.outdir)

  build({
    ...common,
    entryPoints: entries,
    outdir: outdir,
    format: pkg.build.esbuild.format || common.format,
    tsconfig: join(dir, 'tsconfig.json'),
  })
}

function runScripts(pkg, dir) {
  pkg.build.scripts.forEach(script => runScript(pkg, dir, script))

  if (cliopts.watch) {
    if (pkg.build.watch === undefined)
      return console.info(grey(`No watch specified for: ${pkg.name}`))

    const directories = pkg.build.watch.map(path => glob(join(dir, path)))
    watch(directories, () => {
      pkg.build.scripts.forEach(script => runScript(pkg, dir, script))
    })
  }
}

function runScript(pkg, dir, script) {
  const start = Date.now()
  const errorLines = []
  const proc = spawn('npm', ['run', script], { cwd: dir })
  proc.stderr.on('data', chunk => errorLines.push(chunk))

  proc.on('close', () => {
    const duration = fmtDuration(Date.now() - start)

    if (errorLines.length > 0) {
      console.info(red(`\nError running ${script} in ${pkg.name} (${duration})`))
      console.error(errorLines.join(''))
    } else {
      console.info(green(`Ran ${script} in ${pkg.name} (${duration})`))
    }
  })
}

function buildTypes(watch = false) {
  const command = join(__dirname, 'node_modules', 'typescript', 'bin', 'tsc')
  const args = [
    '--declaration',
    '--emitDeclarationOnly',
    '--project', '.',
    '--outDir', 'types',
    '--jsx', 'react-jsx'
  ]

  if (watch) args.unshift('--watch')

  const proc = spawn(command, args)

  proc.stdout.on('data', chunk => {
    logTscOutput(chunk, 'info')
  })

  proc.stderr.on('data', chunk => {
    logTscOutput(chunk, 'error')
  })

  if (watch) watchTypes()

  proc.on('close', () => {
    copyTypes()
  })
}

async function watchTypes() {
  await copyTypes()
  return watch(join(__dirname, 'types'), copyTypes)
}

async function copyTypes() {
  const start = Date.now()

  try {
    await Promise.all(packages.map(fpath => {
      const pkg = require(fpath)
      const dir = dirname(fpath)
      const name = basename(dir)

      if (pkg.build === undefined || pkg.build.esbuild === undefined) return

      const packageTypesDir = join(__dirname, 'types', name, 'src')
      const packageTypesDestDir = join(dir, pkg.build.esbuild.outdir)

      return copy(packageTypesDir, packageTypesDestDir)
    }))

    const duration = fmtDuration(Date.now() - start)
    console.info(green(`Built types (${duration})`))
  } catch (e) {
    const duration = fmtDuration(Date.now() - start)
    console.info(red(`\nError building types (${duration})`))
    console.info(e.stack)
  }
}

function logTscOutput(chunk, level) {
  const lines = chunk.toString().split('\n')
    .map(cleanAnsiString)
    .filter(line => !(line.trim().includes('File change detected. Starting incremental compilation...')))
    .filter(line => !(line.trim().includes('Found 0 errors. Watching for file changes.')))
    .filter(line => !(line.trim().includes('Starting compilation in watch mode...')))
    .filter(line => line.length > 0)

  lines.forEach(line => {
    console[level](`tsc: "${line}"`)
  })
}

// https://stackoverflow.com/a/29497680
const ANSI_CODE_REGEXP = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
function cleanAnsiString(str) {
  return str.replace(ANSI_CODE_REGEXP, '')
}
