// Compiler service: deterministic analyzer pipeline
// Supports: C, C++, Java, Python, JavaScript

// --- language detection -----
function detectLanguage(filename) {
  if (filename.endsWith('.c')) return 'c';
  if (filename.endsWith('.cpp')) return 'cpp';
  if (filename.endsWith('.java')) return 'java';
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.js')) return 'javascript';
  return null;
}

// --- lexical analysis -------
function lexicalAnalysis(code) {
  let src = String(code || '');
  if (src.trim() === '') {
    return { status: 'failed', tokens: 0 };
  }
  let tokens = src
    .split(/\s+/)
    .filter(function(t) { return t.length > 0; }).length;
  return { status: 'passed', tokens: tokens };
}

// --- syntax analysis -------
function syntaxAnalysisCPP(code) { 
  let src = String(code || '');
  const lines = src.split('\n');
  let status = 'passed';
  const ast_nodes = lines.length;

  if (!/\bmain\s*\(/.test(src)) {
    status = 'failed';
  }

  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    let ch = src[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth < 0) break;
  }
  if (depth !== 0) {
    status = 'failed';
  }

  return { status: status, ast_nodes: ast_nodes };
}

function syntaxAnalysisJava(code) {
  let src = String(code || '');
  const lines = src.split('\n');
  let status = 'passed';
  const ast_nodes = lines.length;

  if (!/\bclass\s+\w+/.test(src)) {
    status = 'failed';
  }
  if (!/public\s+static\s+void\s+main/.test(src)) {
    status = 'failed';
  }

  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    let ch = src[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth < 0) break;
  }
  if (depth !== 0) {
    status = 'failed';
  }

  return { status: status, ast_nodes: ast_nodes };
}

function syntaxAnalysisPython(code) {
  let src = String(code || '');
  const lines = src.split('\n');
  let status = 'passed';
  const ast_nodes = lines.length;

  if (!/def\s+\w+|if\s+__name__\s*==\s*['"]__main__['"]/.test(src)) {
    status = 'failed';
  }

  let hasIndentedBlock = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s{2,}/.test(lines[i])) {
      hasIndentedBlock = true;
      break;
    }
  }
  if (!hasIndentedBlock && src.length > 10) {
    status = 'failed';
  }

  return { status: status, ast_nodes: ast_nodes };
}

function syntaxAnalysisJavaScript(code) {
  let src = String(code || '');
  const lines = src.split('\n');
  let status = 'passed';
  const ast_nodes = lines.length;

  if (!/\bfunction\s+\w+|\bconst\s+\w+\s*=|\bclass\s+\w+|module\.exports/.test(src)) {
    status = 'failed';
  }

  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    let ch = src[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth < 0) break;
  }
  if (depth !== 0) {
    status = 'failed';
  }

  return { status: status, ast_nodes: ast_nodes };
}

function syntaxAnalysisC(code) {
  let src = String(code || '');
  const lines = src.split('\n');
  let status = 'passed';
  const ast_nodes = lines.length;

  const mainRegex = /int\s+main\s*(?:\(\s*(?:void)?\s*\))?/;
  if (!mainRegex.test(src)) {
    status = 'failed';
  }

  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    let ch = src[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth < 0) break;
  }
  if (depth !== 0) {
    status = 'failed';
  }

  return { status: status, ast_nodes: ast_nodes };
}

function syntaxAnalysis(code, language) {
  language = language || 'c';
  switch (language) {
    case 'cpp': return syntaxAnalysisCPP(code);
    case 'java': return syntaxAnalysisJava(code);
    case 'python': return syntaxAnalysisPython(code);
    case 'javascript': return syntaxAnalysisJavaScript(code);
    case 'c':
    default: return syntaxAnalysisC(code);
  }
}

// --- semantic analysis (C) ---
function semanticAnalysisC(code) {
  let src = String(code || '');
  const lines = src.split('\n');
  let errors = 0;
  let warnings = 0;
  const details = [];

  if (/\bprintf\s*\(/.test(src) && !/#\s*include\s*<stdio\.h>/.test(src)) {
    errors++;
    details.push({ type: 'error', message: 'printf used without including <stdio.h>' });
  }

  const keywords = ['int', 'return', 'printf', 'main', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'void', 'char', 'float', 'double', 'long', 'short', 'unsigned', 'signed', 'const', 'static', 'struct', 'union', 'typedef', 'sizeof', 'volatile', 'register', 'extern', 'auto'];

  const declared = {};
  const used = {};

  for (let i = 0; i < lines.length; i++) {
    let raw = lines[i];
    let line = raw.replace(/\/\/.*$/, '').trim();
    if (!line) continue;
    if (/^\s*#/.test(line)) continue;

    let noStrings = line.replace(/"[^"]*"|'[^']*'/g, '');

    const declRegex = /\bint\s+([A-Za-z_]\w*)\b/g;
    let dm;
    while ((dm = declRegex.exec(noStrings)) !== null) {
      let name = dm[1];
      if (name === 'main') continue;
      if (name in declared) {
        errors++;
        details.push({ type: 'error', message: 'Duplicate declaration of \'' + name + '\'', line: i + 1 });
      } else {
        declared[name] = i + 1;
      }
    }

    if (/int\s+\w+\s*=\s*"[^"]*"/.test(line)) {
      errors++;
      details.push({ type: 'error', message: 'Invalid type assignment: int variable cannot be assigned a string literal', line: i + 1 });
    }

    if (/\w+\s*\/\s*0/.test(line)) {
      errors++;
      details.push({ type: 'error', message: 'Division by zero', line: i + 1 });
    }

    if (/printf\s*\(\s*".*%s.*"\s*,\s*\w+\s*\)/.test(line)) {
      errors++;
      details.push({ type: 'error', message: 'Wrong format specifier: %s used with integer variable', line: i + 1 });
    }

    if (/\*/.test(line) && !line.includes('/*') && !line.includes('*/')) {
      errors++;
      details.push({ type: 'error', message: 'Pointer operations not supported', line: i + 1 });
    }

    if (/\[.*\]/.test(line)) {
      errors++;
      details.push({ type: 'error', message: 'Array operations not supported', line: i + 1 });
    }

    const idRegex = /\b[A-Za-z_]\w*\b/g;
    let im;
    while ((im = idRegex.exec(noStrings)) !== null) {
      let id = im[0];
      if (keywords.indexOf(id) !== -1) continue;
      if (!(id in declared)) {
        errors++;
        details.push({ type: 'error', message: 'Undeclared variable \'' + id + '\' used', line: i + 1 });
      } else {
        if (i + 1 < declared[id]) {
          errors++;
          details.push({ type: 'error', message: 'Variable \'' + id + '\' used before declaration', line: i + 1 });
        }
        if (!(id in used)) used[id] = i + 1;
      }
    }
  }

  for (let name in declared) {
    let declLine = declared[name];
    if (!(name in used)) {
      warnings++;
      details.push({ type: 'warning', message: 'Variable \'' + name + '\' declared but not used', line: declLine });
    }
  }

  let status = errors === 0 ? 'passed' : 'failed';
  return { status: status, errors: errors, warnings: warnings, details: details };
}

// --- semantic analysis (C++) ---
function semanticAnalysisCPP(code) {
  let src = String(code || '');
  const lines = src.split('\n');
  let errors = 0;
  let warnings = 0;
  const details = [];

  if ((src.includes('cout') || src.includes('std::cout')) && !src.includes('#include <iostream>')) {
    errors++;
    details.push({ type: 'error', message: 'Missing iostream header' });
  }

  const keywords = ['int', 'float', 'double', 'string', 'bool', 'void', 'auto', 'main', 'return', 'cout', 'cin', 'endl', 'std', 'using', 'namespace', 'class', 'public', 'private', 'protected'];
  const declared = {};
  const used = {};

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\/\/.*$/, '').trim();
    if (!line) continue;

    let noStrings = line.replace(/"[^"]*"|'[^']*'/g, '');
    
    const declRegex = /\b(int|float|double|string|bool|void|auto)\s+([A-Za-z_]\w*)\b/g;
    let dm;
    while ((dm = declRegex.exec(noStrings)) !== null) {
      let name = dm[2];
      if (name in declared) {
        errors++;
        details.push({ type: 'error', message: 'Duplicate declaration', line: i + 1 });
      } else {
        declared[name] = i + 1;
      }
    }

    if (/\b\d+\s*\/\s*0\b/.test(line)) {
      errors++;
      details.push({ type: 'error', message: 'Division by zero', line: i + 1 });
    }

    const idRegex = /\b[A-Za-z_]\w*\b/g;
    let im;
    while ((im = idRegex.exec(noStrings)) !== null) {
      let id = im[0];
      if (keywords.indexOf(id) !== -1) continue;
      if (!(id in declared)) {
        errors++;
        details.push({ type: 'error', message: 'Undeclared variable', line: i + 1 });
      } else {
        if (!(id in used)) used[id] = i + 1;
      }
    }
  }

  for (let name in declared) {
    if (!(name in used)) {
      warnings++;
      details.push({ type: 'warning', message: 'Unused variable', line: declared[name] });
    }
  }

  let status = errors === 0 ? 'passed' : 'failed';
  return { status: status, errors: errors, warnings: warnings, details: details };
}

// --- semantic analysis (Java) ---
function semanticAnalysisJava(code) {
  let src = String(code || '');
  const lines = src.split('\n');
  let errors = 0;
  let warnings = 0;
  const details = [];

  const keywords = ['int', 'String', 'double', 'boolean', 'float', 'char', 'long', 'main', 'return', 'System', 'out', 'println', 'public', 'static', 'void', 'class'];
  const declared = {};
  const used = {};

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\/\/.*$/, '').trim();
    if (!line) continue;

    let noStrings = line.replace(/"[^"]*"|'[^']*'/g, '');

    const declRegex = /\b(int|String|double|boolean|float|char|long)\s+([A-Za-z_]\w*)\b/g;
    let dm;
    while ((dm = declRegex.exec(noStrings)) !== null) {
      let name = dm[2];
      if (name in declared) {
        errors++;
        details.push({ type: 'error', message: 'Duplicate declaration', line: i + 1 });
      } else {
        declared[name] = i + 1;
      }
    }

    if (/\b\d+\s*\/\s*0\b/.test(line)) {
      errors++;
      details.push({ type: 'error', message: 'Division by zero', line: i + 1 });
    }

    const idRegex = /\b[A-Za-z_]\w*\b/g;
    let im;
    while ((im = idRegex.exec(noStrings)) !== null) {
      let id = im[0];
      if (keywords.indexOf(id) !== -1) continue;
      if (!(id in declared)) {
        errors++;
        details.push({ type: 'error', message: 'Undeclared variable', line: i + 1 });
      } else {
        if (!(id in used)) used[id] = i + 1;
      }
    }
  }

  for (let name in declared) {
    if (!(name in used)) {
      warnings++;
      details.push({ type: 'warning', message: 'Unused variable', line: declared[name] });
    }
  }

  let status = errors === 0 ? 'passed' : 'failed';
  return { status: status, errors: errors, warnings: warnings, details: details };
}

// --- semantic analysis (Python) ---
function semanticAnalysisPython(code) {
  let src = String(code || '');
  const lines = src.split('\n');
  let errors = 0;
  let warnings = 0;
  const details = [];

  const declared = {};
  const used = {};

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const declMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
    if (declMatch) {
      let name = declMatch[1];
      if (!(name in declared)) {
        declared[name] = i + 1;
      }
    }

    if (line.includes('print(')) {
      const printArgs = line.match(/print\s*\(([^)]*)\)/);
      if (printArgs) {
        let args = printArgs[1].split(',');
        for (let j = 0; j < args.length; j++) {
          let arg = args[j].trim().replace(/^['"]|['"]$/g, '');
          if (!/^['"]/.test(arg) && !/^\d+$/.test(arg) && arg && !(arg in declared)) {
            errors++;
            details.push({ type: 'error', message: 'Undeclared variable', line: i + 1 });
          }
        }
      }
    }

    if (/\b\d+\s*\/\/?\s*0\b/.test(line)) {
      errors++;
      details.push({ type: 'error', message: 'Division by zero', line: i + 1 });
    }
  }

  for (let name in declared) {
    if (!(name in used) && !['__name__', '__main__'].includes(name)) {
      warnings++;
      details.push({ type: 'warning', message: 'Unused variable', line: declared[name] });
    }
  }

  let status = errors === 0 ? 'passed' : 'failed';
  return { status: status, errors: errors, warnings: warnings, details: details };
}

// --- semantic analysis (JavaScript) ---
function semanticAnalysisJavaScript(code) {
  let src = String(code || '');
  const lines = src.split('\n');
  let errors = 0;
  let warnings = 0;
  const details = [];

  const keywords = ['const', 'let', 'var', 'function', 'return', 'console', 'log', 'module', 'exports', 'require', 'if', 'else', 'for', 'while', 'class', 'new'];
  const declared = {};
  const used = {};

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\/\/.*$/, '').trim();
    if (!line) continue;

    let noStrings = line.replace(/"[^"]*"|'[^']*'/g, '');

    const declRegex = /\b(const|let|var)\s+([a-zA-Z_]\w*)\b/g;
    let dm;
    while ((dm = declRegex.exec(noStrings)) !== null) {
      let name = dm[2];
      if (name in declared) {
        errors++;
        details.push({ type: 'error', message: 'Duplicate declaration', line: i + 1 });
      } else {
        declared[name] = i + 1;
      }
    }

    if (/\b\d+\s*\/\s*0\b/.test(line)) {
      errors++;
      details.push({ type: 'error', message: 'Division by zero', line: i + 1 });
    }

    const idRegex = /\b[a-zA-Z_]\w*\b/g;
    let im;
    while ((im = idRegex.exec(noStrings)) !== null) {
      let id = im[0];
      if (keywords.indexOf(id) !== -1) continue;
      if (!['toString', 'length', 'map', 'filter', 'reduce', 'forEach', 'push', 'pop'].includes(id)) {
        if (!(id in declared)) {
          errors++;
          details.push({ type: 'error', message: 'Undeclared variable', line: i + 1 });
        } else {
          if (!(id in used)) used[id] = i + 1;
        }
      }
    }
  }

  for (let name in declared) {
    if (!(name in used)) {
      warnings++;
      details.push({ type: 'warning', message: 'Unused variable', line: declared[name] });
    }
  }

  let status = errors === 0 ? 'passed' : 'failed';
  return { status: status, errors: errors, warnings: warnings, details: details };
}

// --- semantic analysis dispatcher ---
function semanticAnalysis(code, language) {
  language = language || 'c';
  switch (language) {
    case 'cpp': return semanticAnalysisCPP(code);
    case 'java': return semanticAnalysisJava(code);
    case 'python': return semanticAnalysisPython(code);
    case 'javascript': return semanticAnalysisJavaScript(code);
    case 'c':
    default: return semanticAnalysisC(code);
  }
}

// --- intermediate representation -------------------------------------------
function compilationStage(syntax, semantic) {
  let status = 'failed';
  if (syntax.status === 'passed' && semantic.errors === 0) {
    status = 'success';
  }
  return { status, timestamp: new Date() };
}

// --- intermediate representation -------------------------------------------
function generateIR(compilation) {
  if (compilation.status !== 'success') {
    return { status: 'skipped' };
  }

  const instructions = ['LOAD main', 'CALL printf', 'RETURN'];

  return {
    status: 'generated',
    instructions: instructions,
  };
}

// --- quality gate analysis -------------------------------------------------
function qualityGateAnalysis(code, semantic) {
  const src = String(code || '');
  const lines = src.split('\n').filter(l => l.trim().length > 0);
  
  // 1. Cyclomatic Complexity
  const ifCount = (src.match(/\bif\s*\(/g) || []).length;
  const whileCount = (src.match(/\bwhile\s*\(/g) || []).length;
  const forCount = (src.match(/\bfor\s*\(/g) || []).length;
  const complexity = ifCount + whileCount + forCount;
  
  // 2. Code length check
  const codeLength = lines.length;
  const lengthWarning = codeLength > 500 ? 1 : 0;
  
  // 3. Variable count check
  const varDeclRegex = /\b(?:int|float|double|string|bool|var|let|const|long|short)\s+([a-zA-Z_]\w*)/g;
  const varMatches = src.match(varDeclRegex) || [];
  const variableCount = varMatches.length;
  const variableWarning = variableCount > 8 ? 1 : 0;
  
  // 4. Security check
  const dangerousFunctions = ['gets(', 'strcpy(', 'gets ', 'strcpy '];
  let securityIssues = 0;
  const securityDetails = [];
  for (const func of dangerousFunctions) {
    if (src.includes(func)) {
      securityIssues++;
      securityDetails.push('Dangerous function detected: ' + func.trim());
    }
  }
  
  // 5. Calculate quality score
  let qualityScore = 100;
  
  if (complexity > 10) {
    qualityScore -= Math.min(20, (complexity - 10) * 2);
  }
  if (codeLength > 500) {
    qualityScore -= Math.min(15, (codeLength - 500) / 50);
  }
  if (variableCount > 8) {
    qualityScore -= Math.min(10, (variableCount - 8) * 2);
  }
  qualityScore -= Math.min(20, securityIssues * 10);
  if (semantic.errors > 0) {
    qualityScore -= Math.min(15, semantic.errors * 3);
  }
  
  qualityScore = Math.max(0, Math.min(100, qualityScore));
  
  const warnings = lengthWarning + variableWarning + (complexity > 10 ? 1 : 0);
  
  return {
    complexity: complexity,
    codeLength: codeLength,
    variableCount: variableCount,
    warnings: warnings,
    securityIssues: securityIssues,
    securityDetails: securityDetails,
    qualityScore: qualityScore
  };
}

// --- deployment decision ---------------------------------------------------
function deploymentDecision(lexical, syntax, semantic, compilation, qualityGate) {
  qualityGate = qualityGate || { securityIssues: 0, qualityScore: 100 };
  
  if (
    lexical.status === 'passed' &&
    syntax.status === 'passed' &&
    semantic.errors === 0 &&
    compilation.status === 'success' &&
    qualityGate.securityIssues === 0 &&
    qualityGate.qualityScore >= 70
  ) {
    return { decision: 'ALLOWED', reason: 'All quality gates passed' };
  }
  
  const reasons = [];
  if (lexical.status !== 'passed') reasons.push('Lexical analysis failed');
  if (syntax.status !== 'passed') reasons.push('Syntax analysis failed');
  if (semantic.errors > 0) reasons.push('Semantic errors: ' + semantic.errors);
  if (compilation.status !== 'success') reasons.push('Compilation failed');
  if (qualityGate.securityIssues > 0) reasons.push('Security issues: ' + qualityGate.securityIssues);
  if (qualityGate.qualityScore < 70) reasons.push('Quality score too low: ' + qualityGate.qualityScore + '/100');
  
  return { decision: 'BLOCKED', reason: reasons.join('; ') };
}

// --- orchestration ---------------------------------------------------------
function analyzeCode(code, language) {
  language = language || 'c';
  const lexical = lexicalAnalysis(code);
  const syntax = syntaxAnalysis(code, language);
  const semantic = semanticAnalysis(code, language);
  const compilation = compilationStage(syntax, semantic);
  const ir = generateIR(compilation);
  const qualityGate = qualityGateAnalysis(code, semantic);
  const deployment = deploymentDecision(lexical, syntax, semantic, compilation, qualityGate);

  return { language: language, lexical: lexical, syntax: syntax, semantic: semantic, compilation: compilation, ir: ir, qualityGate: qualityGate, deployment: deployment };
}

module.exports = {
  detectLanguage: detectLanguage,
  lexicalAnalysis: lexicalAnalysis,
  syntaxAnalysis: syntaxAnalysis,
  semanticAnalysis: semanticAnalysis,
  compilationStage: compilationStage,
  generateIR: generateIR,
  qualityGateAnalysis: qualityGateAnalysis,
  deploymentDecision: deploymentDecision,
  analyzeCode: analyzeCode,
  analyze: analyzeCode, // backward compatibility
};

