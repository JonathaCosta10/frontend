#!/usr/bin/env node

/**
 * Script de análise de performance e bundle
 * Analisa o build e gera relatórios de otimização
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

class PerformanceAnalyzer {
  constructor() {
    this.distPath = path.join(process.cwd(), 'dist');
    this.assetsPath = path.join(this.distPath, 'assets');
    this.report = {
      bundleSize: {},
      chunkAnalysis: {},
      recommendations: [],
      performance: {}
    };
  }

  // Analisa tamanhos dos arquivos
  analyzeBundleSizes() {
    log('\n📊 Analisando tamanhos dos bundles...', 'cyan');
    
    if (!fs.existsSync(this.distPath)) {
      log('❌ Pasta dist não encontrada. Execute npm run build primeiro.', 'red');
      return;
    }

    const files = fs.readdirSync(this.assetsPath);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    const cssFiles = files.filter(file => file.endsWith('.css'));

    let totalJSSize = 0;
    let totalCSSSize = 0;

    // Analisa arquivos JS
    jsFiles.forEach(file => {
      const filePath = path.join(this.assetsPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalJSSize += stats.size;

      if (stats.size > 100 * 1024) { // > 100KB
        log(`  ⚠️  ${file}: ${sizeKB}KB (Grande)`, 'yellow');
      } else {
        log(`  ✅ ${file}: ${sizeKB}KB`, 'green');
      }

      this.report.bundleSize[file] = {
        size: stats.size,
        sizeKB: parseFloat(sizeKB),
        type: 'js'
      };
    });

    // Analisa arquivos CSS
    cssFiles.forEach(file => {
      const filePath = path.join(this.assetsPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalCSSSize += stats.size;

      log(`  📄 ${file}: ${sizeKB}KB`, 'blue');

      this.report.bundleSize[file] = {
        size: stats.size,
        sizeKB: parseFloat(sizeKB),
        type: 'css'
      };
    });

    const totalSizeMB = ((totalJSSize + totalCSSSize) / (1024 * 1024)).toFixed(2);
    log(`\n📦 Tamanho total: ${totalSizeMB}MB`, 'bright');
    log(`   JS: ${(totalJSSize / 1024).toFixed(2)}KB`, 'cyan');
    log(`   CSS: ${(totalCSSSize / 1024).toFixed(2)}KB`, 'cyan');

    this.report.performance.totalSize = parseFloat(totalSizeMB);
    this.report.performance.jsSize = totalJSSize;
    this.report.performance.cssSize = totalCSSSize;
  }

  // Analisa chunks e dependências
  analyzeChunks() {
    log('\n🔍 Analisando chunks...', 'cyan');

    // Identifica tipos de chunks baseado nos nomes
    Object.keys(this.report.bundleSize).forEach(file => {
      const bundle = this.report.bundleSize[file];
      if (bundle.type !== 'js') return;

      let chunkType = 'unknown';
      
      if (file.includes('react-vendor')) {
        chunkType = 'react-core';
      } else if (file.includes('ui-components')) {
        chunkType = 'ui-library';
      } else if (file.includes('charts')) {
        chunkType = 'charts';
      } else if (file.includes('vendor')) {
        chunkType = 'vendor';
      } else if (file.includes('index')) {
        chunkType = 'main';
      } else {
        chunkType = 'lazy-route';
      }

      this.report.chunkAnalysis[file] = {
        type: chunkType,
        size: bundle.sizeKB,
        optimal: bundle.sizeKB < 100 // < 100KB é considerado ótimo
      };

      const status = bundle.sizeKB < 100 ? '✅' : '⚠️';
      log(`  ${status} ${file} (${chunkType}): ${bundle.sizeKB}KB`, 
          bundle.sizeKB < 100 ? 'green' : 'yellow');
    });
  }

  // Gera recomendações de otimização
  generateRecommendations() {
    log('\n💡 Recomendações de otimização:', 'magenta');

    const largeBundles = Object.entries(this.report.bundleSize)
      .filter(([_, bundle]) => bundle.sizeKB > 200)
      .map(([file, _]) => file);

    if (largeBundles.length > 0) {
      this.report.recommendations.push({
        type: 'bundle-splitting',
        message: 'Considere dividir bundles grandes em chunks menores',
        files: largeBundles
      });
      log('  🔄 Considere dividir bundles grandes em chunks menores:', 'yellow');
      largeBundles.forEach(file => log(`     - ${file}`, 'yellow'));
    }

    if (this.report.performance.totalSize > 2) {
      this.report.recommendations.push({
        type: 'tree-shaking',
        message: 'Bundle total muito grande - verifique tree shaking'
      });
      log('  🌳 Bundle total muito grande - verifique tree shaking', 'yellow');
    }

    // Verifica se há muitos chunks pequenos
    const smallChunks = Object.entries(this.report.bundleSize)
      .filter(([_, bundle]) => bundle.sizeKB < 10 && bundle.type === 'js')
      .map(([file, _]) => file);

    if (smallChunks.length > 5) {
      this.report.recommendations.push({
        type: 'chunk-merging',
        message: 'Muitos chunks pequenos - considere mesclar alguns'
      });
      log('  📦 Muitos chunks pequenos - considere mesclar alguns', 'yellow');
    }

    if (this.report.recommendations.length === 0) {
      log('  ✅ Bundle otimizado! Não há recomendações urgentes.', 'green');
    }
  }

  // Verifica configuração do Vite
  checkViteConfig() {
    log('\n⚙️  Verificando configuração do Vite...', 'cyan');
    
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    
    if (fs.existsSync(viteConfigPath)) {
      const config = fs.readFileSync(viteConfigPath, 'utf8');
      
      const checks = [
        {
          pattern: /minify:\s*['"]terser['"]/,
          message: 'Minificação Terser configurada',
          status: 'good'
        },
        {
          pattern: /cssCodeSplit:\s*true/,
          message: 'CSS Code Splitting habilitado',
          status: 'good'
        },
        {
          pattern: /manualChunks/,
          message: 'Manual chunks configurado',
          status: 'good'
        },
        {
          pattern: /sourcemap:\s*false/,
          message: 'Sourcemaps desabilitados para produção',
          status: 'good'
        }
      ];

      checks.forEach(check => {
        const found = check.pattern.test(config);
        const icon = found ? '✅' : '❌';
        const color = found ? 'green' : 'red';
        log(`  ${icon} ${check.message}`, color);
      });
    } else {
      log('  ❌ vite.config.ts não encontrado', 'red');
    }
  }

  // Executa análise de dependências
  analyzeDependencies() {
    log('\n📦 Analisando dependências...', 'cyan');
    
    try {
      // Verifica bundle-analyzer se disponível
      const hasAnalyzer = fs.existsSync(path.join(process.cwd(), 'node_modules/rollup-plugin-visualizer'));
      
      if (hasAnalyzer) {
        log('  ✅ Bundle analyzer disponível', 'green');
        log('  💡 Execute: npm run build && npx rollup-plugin-visualizer', 'blue');
      } else {
        log('  📊 Instale rollup-plugin-visualizer para análise visual:', 'yellow');
        log('     npm install --save-dev rollup-plugin-visualizer', 'yellow');
      }

      // Analisa package.json para deps pesadas
      const packagePath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const heavyDeps = [
          'lodash', 'moment', 'core-js', 'rxjs', 'aws-sdk'
        ];

        const foundHeavyDeps = Object.keys(pkg.dependencies || {})
          .filter(dep => heavyDeps.some(heavy => dep.includes(heavy)));

        if (foundHeavyDeps.length > 0) {
          log('  ⚠️  Dependências pesadas encontradas:', 'yellow');
          foundHeavyDeps.forEach(dep => log(`     - ${dep}`, 'yellow'));
        }
      }

    } catch (error) {
      log('  ❌ Erro ao analisar dependências', 'red');
    }
  }

  // Gera relatório final
  generateReport() {
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    
    this.report.timestamp = new Date().toISOString();
    this.report.summary = {
      totalBundles: Object.keys(this.report.bundleSize).length,
      totalSizeMB: this.report.performance.totalSize,
      recommendationsCount: this.report.recommendations.length
    };

    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    
    log('\n📄 Relatório salvo em performance-report.json', 'green');
  }

  // Executa análise completa
  run() {
    log('🚀 Iniciando análise de performance...', 'bright');
    
    this.analyzeBundleSizes();
    this.analyzeChunks();
    this.checkViteConfig();
    this.analyzeDependencies();
    this.generateRecommendations();
    this.generateReport();
    
    log('\n✅ Análise concluída!', 'green');
    
    // Mostra score geral
    const score = this.calculatePerformanceScore();
    const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
    log(`\n🎯 Score de Performance: ${score}/100`, scoreColor);
  }

  calculatePerformanceScore() {
    let score = 100;
    
    // Penaliza por tamanho total alto
    if (this.report.performance.totalSize > 3) score -= 30;
    else if (this.report.performance.totalSize > 2) score -= 15;
    
    // Penaliza por muitas recomendações
    score -= this.report.recommendations.length * 10;
    
    // Penaliza por bundles muito grandes
    const largeBundles = Object.values(this.report.bundleSize)
      .filter(bundle => bundle.sizeKB > 300).length;
    score -= largeBundles * 20;
    
    return Math.max(0, score);
  }
}

// Executa se for chamado diretamente
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.run();
}

module.exports = PerformanceAnalyzer;
