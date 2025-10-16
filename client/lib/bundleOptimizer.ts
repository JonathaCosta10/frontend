/**
 * Bundle Size Optimizer
 * Ferramenta para análise e otimização automática de bundles
 */

import { promises as fs } from 'fs';
import path from 'path';

interface BundleStats {
  fileName: string;
  size: number;
  gzipSize?: number;
  modules: string[];
  type: 'entry' | 'chunk' | 'vendor' | 'feature';
}

interface OptimizationSuggestion {
  type: 'split' | 'merge' | 'lazy' | 'external';
  target: string;
  reason: string;
  expectedSavings: number;
}

class BundleOptimizer {
  private readonly maxChunkSize = 200 * 1024; // 200KB
  private readonly minChunkSize = 50 * 1024;  // 50KB
  private readonly distPath: string;
  
  constructor(distPath: string = './dist') {
    this.distPath = distPath;
  }
  
  /**
   * Analisa os bundles atuais
   */
  async analyzeBundles(): Promise<BundleStats[]> {
    const files = await this.getJSFiles();
    const stats: BundleStats[] = [];
    
    for (const file of files) {
      const filePath = path.join(this.distPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const size = content.length;
      
      stats.push({
        fileName: file,
        size,
        modules: this.extractModules(content),
        type: this.categorizeBundle(file, content)
      });
    }
    
    return stats.sort((a, b) => b.size - a.size);
  }
  
  /**
   * Gera sugestões de otimização
   */
  generateOptimizations(stats: BundleStats[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Identificar chunks muito grandes
    for (const bundle of stats) {
      if (bundle.size > this.maxChunkSize) {
        suggestions.push({
          type: 'split',
          target: bundle.fileName,
          reason: `Bundle muito grande (${this.formatSize(bundle.size)}). Considere dividir.`,
          expectedSavings: bundle.size * 0.3
        });
      }
    }
    
    // Identificar chunks muito pequenos que podem ser merged
    const smallChunks = stats.filter(s => 
      s.size < this.minChunkSize && 
      s.type === 'chunk'
    );
    
    if (smallChunks.length > 1) {
      suggestions.push({
        type: 'merge',
        target: smallChunks.map(c => c.fileName).join(', '),
        reason: `${smallChunks.length} chunks pequenos podem ser combinados`,
        expectedSavings: smallChunks.reduce((acc, c) => acc + c.size, 0) * 0.1
      });
    }
    
    // Identificar oportunidades de lazy loading
    const featureBundles = stats.filter(s => s.type === 'feature');
    for (const bundle of featureBundles) {
      if (bundle.size > 100 * 1024) { // 100KB
        suggestions.push({
          type: 'lazy',
          target: bundle.fileName,
          reason: `Feature bundle grande - considere lazy loading`,
          expectedSavings: bundle.size * 0.8 // Economia significativa em loading inicial
        });
      }
    }
    
    return suggestions;
  }
  
  /**
   * Relatório detalhado de análise
   */
  async generateReport(): Promise<string> {
    const stats = await this.analyzeBundles();
    const suggestions = this.generateOptimizations(stats);
    const totalSize = stats.reduce((acc, s) => acc + s.size, 0);
    const potentialSavings = suggestions.reduce((acc, s) => acc + s.expectedSavings, 0);
    
    const report = [
      '# Bundle Analysis Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '## Summary',
      `- Total bundle size: ${this.formatSize(totalSize)}`,
      `- Number of chunks: ${stats.length}`,
      `- Potential savings: ${this.formatSize(potentialSavings)} (${((potentialSavings/totalSize)*100).toFixed(1)}%)`,
      '',
      '## Bundle Details',
      '| File | Size | Type | Status |',
      '|------|------|------|--------|',
      ...stats.map(s => {
        const status = s.size > this.maxChunkSize ? '🔴 Too Large' : 
                      s.size < this.minChunkSize ? '🟡 Too Small' : '✅ Optimal';
        return `| ${s.fileName} | ${this.formatSize(s.size)} | ${s.type} | ${status} |`;
      }),
      '',
      '## Optimization Suggestions',
      ...suggestions.map((s, i) => [
        `### ${i + 1}. ${s.type.toUpperCase()}: ${s.target}`,
        s.reason,
        `Expected savings: ${this.formatSize(s.expectedSavings)}`,
        ''
      ]).flat(),
      '',
      '## Top 10 Largest Chunks',
      ...stats.slice(0, 10).map((s, i) => 
        `${i + 1}. **${s.fileName}** - ${this.formatSize(s.size)}`
      ),
      '',
      '## Recommendations',
      '1. **Implement code splitting** for chunks > 200KB',
      '2. **Merge small chunks** < 50KB when possible',
      '3. **Use lazy loading** for feature modules',
      '4. **Consider tree shaking** for unused exports',
      '5. **Implement dynamic imports** for route-based splitting'
    ];
    
    return report.join('\n');
  }
  
  /**
   * Salva o relatório em arquivo
   */
  async saveReport(outputPath: string = './bundle-report.md'): Promise<void> {
    const report = await this.generateReport();
    await fs.writeFile(outputPath, report, 'utf-8');
    console.log(`📊 Bundle report saved to: ${outputPath}`);
  }
  
  private async getJSFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(path.join(this.distPath, 'assets'));
      return files.filter(f => f.endsWith('.js'));
    } catch (error) {
      console.error('Error reading dist directory:', error);
      return [];
    }
  }
  
  private extractModules(content: string): string[] {
    // Extrair nomes de módulos do bundle (simplificado)
    const moduleMatches = content.match(/node_modules\/([^"'\/]+)/g) || [];
    return [...new Set(moduleMatches.map(m => m.replace('node_modules/', '')))];
  }
  
  private categorizeBundle(fileName: string, content: string): BundleStats['type'] {
    if (fileName.includes('main') || fileName.includes('index')) return 'entry';
    if (fileName.includes('vendor') || this.isVendorBundle(content)) return 'vendor';
    if (fileName.includes('feature-') || this.isFeatureBundle(content)) return 'feature';
    return 'chunk';
  }
  
  private isVendorBundle(content: string): boolean {
    return content.includes('node_modules') && 
           (content.includes('react') || content.includes('lodash'));
  }
  
  private isFeatureBundle(content: string): boolean {
    return content.includes('/features/') || 
           content.includes('/pages/') ||
           content.includes('dashboard') ||
           content.includes('market');
  }
  
  private formatSize(bytes: number): string {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)}KB`;
    return `${(kb / 1024).toFixed(1)}MB`;
  }
}

// Export para uso em scripts
export { BundleOptimizer };

// Script CLI para análise direta
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new BundleOptimizer();
  optimizer.saveReport().catch(console.error);
}