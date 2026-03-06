/**
 * Deterministic Compiler Analyzer Pipeline
 * Lexical → Syntax → Semantic → Compilation → IR → Deployment Decision
 * Supports: C, C++, Java, Python, JavaScript
 */

// Language Detection
function detectLanguage(filename) {
  if (filename.endsWith('.c')) return 'c';
  if (filename.endsWith('.cpp')) return 'cpp';
  if (filename.endsWith('.java')) return 'java';
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.js')) return 'javascript';
  return null;
}

// Generic Lexical Analysis
function lexicalAnalysis(code) {
  const src = String(code || '').trim();
  if (src === '') {
    return { status: 'failed', tokens: 0 };
  }
  const tokens = src.split(/\s+/).filter((t) => t.length > 0).length;
  return { status: 'passed', tokens };
}

// C Language Syntax Analysis
function syntaxAnalysisC(code) {
  const src = String(code || '');
  let status = 'passed';
  const ast_nodes = src.split('\n').length;

  // Check for int main
  if (!/\bint\s+main\b/.test(src)) {
    status = 'failed';
  }

  // Check balanced braces
  const open = (src.match(/{/g) || []).length;
  const close = (src.match(/}/g) || []).length;
  if (open !== close) {
    status = 'failed';
  }

  return { status, ast_nodes };
}

// C++ Language Syntax Analysis
function syntaxAnalysisCPP(code) {
  const src = String(code || '');
  let status = 'passed';
  const ast_nodes = src.split('\n').length;

  // Check for main function
  if (!/\bmain\s*\(/.test(src)) {
    status = 'failed';
  }

  // Check balanced braces
  const open = (src.match(/{/g) || []).length;
  const close = (src.match(/}/g) || []).length;
  if (open !== close) {
    status = 'failed';
  }

  return { status, ast_nodes };
}

// Java Language Syntax Analysis
function syntaxAnalysisJava(code) {
  const src = String(code || '');
  let status = 'passed';
  const ast_nodes = src.split('\n').length;

  // Check for class declaration
  if (!/\bclass\s+\w+/.test(src)) {
    status = 'failed';
  }

  // Check for main method
  if (!/public\s+static\s+void\s+main/.test(src)) {
    status = 'failed';
  }

  // Check balanced braces
  const open = (src.match(/{/g) || []).length;
  const close = (src.match(/}/g) || []).length;
  if (open !== close) {
    status = 'failed';
  }

  return { status, ast_nodes };
}

// Python Language Syntax Analysis
function syntaxAnalysisPython(code) {
  const src = String(code || '');
  let status = 'passed';
  const ast_nodes = src.split('\n').length;

  // Check for main function or entry point
  if (!/def\s+\w+|if\s+__name__\s*==\s*['"]__main__['"]/.test(src)) {
    status = 'failed';
  }

  // Basic indentation check (Python uses indentation)
  const lines = src.split('\n');
  let hasIndentedBlock = false;
  for (const line of lines) {
    if (/^\s{2,}/.test(line)) {
      hasIndentedBlock = true;
      break;
    }
  }
  if (!hasIndentedBlock && src.length > 10) {
    status = 'failed';
  }

  return { status, ast_nodes };
}

// JavaScript Language Syntax Analysis
function syntaxAnalysisJavaScript(code) {
  const src = String(code || '');
  let status = 'passed';
  const ast_nodes = src.split('\n').length;

  // Check for function definition or export
  if (!/\bfunction\s+\w+|\bconst\s+\w+\s*=|\bclass\s+\w+|module\.exports/.test(src)) {
    status = 'failed';
  }

  // Check balanced braces
  const open = (src.match(/{/g) || []).length;
  const close = (src.match(/}/g) || []).length;
  if (open !== close) {
    status = 'failed';
  }

  return { status, ast_nodes };
}

// Generic Syntax Analysis Dispatcher
function syntaxAnalysis(code, language = 'c') {
  switch (language) {
    case 'cpp':
      return syntaxAnalysisCPP(code);
    case 'java':
      return syntaxAnalysisJava(code);
    case 'python':
      return syntaxAnalysisPython(code);
    case 'javascript':
      return syntaxAnalysisJavaScript(code);
    case 'c':
    default:
      return syntaxAnalysisC(code);
  }
}

// C Language Semantic Analysis
function semanticAnalysisC(code) {
  const src = String(code || '');
  const lines = src.split('\n');
  let errors = 0;
  let warnings = 0;
  const details = [];
  const symbolTable = {};

  // Check for missing stdio.h
  if (src.includes('printf') && !src.includes('#include <stdio.h>')) {
    errors++;
    details.push({
      type: 'error',
      message: 'Missing stdio.h'
    });
  }

  // Parse each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('//')) continue;

    // Check for variable declarations
    const declMatch = line.match(/^int\s+([a-zA-Z_]\w*)(?:\s*=\s*(.+?))?\s*;/);
    if (declMatch) {
      const varName = declMatch[1];
      const value = declMatch[2];

      if (symbolTable[varName]) {
        errors++;
        details.push({
          type: 'error',
          message: 'Duplicate variable declaration'
        });
      } else {
        symbolTable[varName] = { type: 'int', used: false };
      }

      // Check for type mismatch
      if (value && /^".*"$/.test(value)) {
        errors++;
        details.push({
          type: 'error',
          message: 'Type mismatch'
        });
      }
    }

    // Check for division by zero
    if (/\b\d+\s*\/\s*0\b/.test(line) || /\b[a-zA-Z_]\w*\s*\/\s*0\b/.test(line)) {
      errors++;
      details.push({
        type: 'error',
        message: 'Division by zero'
      });
    }

    // Check for printf format specifier
    const printfMatch = line.match(/printf\s*\(\s*"([^"]*)"\s*,\s*([a-zA-Z_]\w*)\s*\)/);
    if (printfMatch) {
      const format = printfMatch[1];
      const varName = printfMatch[2];
      if (format.includes('%s') && symbolTable[varName] && symbolTable[varName].type === 'int') {
        errors++;
        details.push({
          type: 'error',
          message: 'Wrong printf format specifier'
        });
      }
      // Mark variable as used
      if (symbolTable[varName]) {
        symbolTable[varName].used = true;
      }
    }

    // Check for variable usage
    const usageMatches = line.match(/\b[a-zA-Z_]\w*\b/g);
    if (usageMatches) {
      for (const match of usageMatches) {
        if (match !== 'int' && match !== 'return' && match !== 'printf' && match !== 'main') {
          if (!symbolTable[match]) {
            errors++;
            details.push({
              type: 'error',
              message: 'Undeclared variable'
            });
          } else {
            symbolTable[match].used = true;
          }
        }
      }
    }
  }

  // Check for unused variables
  for (const varName in symbolTable) {
    if (!symbolTable[varName].used) {
      warnings++;
      details.push({
        type: 'warning',
        message: 'Unused variable'
      });
    }
  }

  return {
    status: errors === 0 ? 'passed' : 'failed',
    errors,
    warnings,
    details
  };
}

// C++ Language Semantic Analysis
function semanticAnalysisCPP(code) {
  const src = String(code || '');
  const lines = src.split('\n');
  let errors = 0;
  let warnings = 0;
  const details = [];
  const symbolTable = {};

  // Check for missing iostream (C++ std output)
  if ((src.includes('cout') || src.includes('std::cout')) && !src.includes('#include <iostream>')) {
    errors++;
    details.push({
      type: 'error',
      message: 'Missing iostream header'
    });
  }

  // Parse declarations and usages
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) continue;

    // Variable declarations
    const declMatch = line.match(/\b(int|float|double|string|bool|void|auto)\s+([a-zA-Z_]\w*)(?:\s*=\s*(.+?))?\s*;/);
    if (declMatch) {
      const varType = declMatch[1];
      const varName = declMatch[2];
      const value = declMatch[3];

      if (symbolTable[varName]) {
        errors++;
        details.push({
          type: 'error',
          message: 'Duplicate variable declaration'
        });
      } else {
        symbolTable[varName] = { type: varType, used: false };
      }

      if (value && /^".*"$/.test(value) && varType === 'int') {
        errors++;
        details.push({
          type: 'error',
          message: 'Type mismatch'
        });
      }
    }

    // Division by zero
    if (/\b\d+\s*\/\s*0\b/.test(line)) {
      errors++;
      details.push({
        type: 'error',
        message: 'Division by zero'
      });
    }

    // Variable usage
    const usageMatches = line.match(/\b[a-zA-Z_]\w*\b/g);
    if (usageMatches) {
      for (const match of usageMatches) {
        if (!['int', 'float', 'double', 'string', 'bool', 'void', 'auto', 'main', 'return', 'cout', 'cin', 'endl'].includes(match)) {
          if (!symbolTable[match]) {
            // Don't count stdlib functions as errors
            if (!['std', 'using', 'namespace', 'class', 'public', 'private', 'protected'].includes(match)) {
              errors++;
              details.push({
                type: 'error',
                message: 'Undeclared variable'
              });
            }
          } else {
            symbolTable[match].used = true;
          }
        }
      }
    }
  }

  // Check for unused variables
  for (const varName in symbolTable) {
    if (!symbolTable[varName].used) {
      warnings++;
      details.push({
        type: 'warning',
        message: 'Unused variable'
      });
    }
  }

  return {
    status: errors === 0 ? 'passed' : 'failed',
    errors,
    warnings,
    details
  };
}

// Java Language Semantic Analysis
function semanticAnalysisJava(code) {
  const src = String(code || '');
  const lines = src.split('\n');
  let errors = 0;
  let warnings = 0;
  const details = [];
  const symbolTable = {};

  // Check for System import or usage without import
  if (src.includes('System.out') && !src.includes('import java.lang.System')) {
    // System is auto-imported in Java, so this is OK
  }

  // Parse declarations and usages
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) continue;

    // Variable declarations
    const declMatch = line.match(/\b(int|String|double|boolean|float|char|long)\s+([a-zA-Z_]\w*)(?:\s*=\s*(.+?))?\s*;/);
    if (declMatch) {
      const varType = declMatch[1];
      const varName = declMatch[2];
      const value = declMatch[3];

      if (symbolTable[varName]) {
        errors++;
        details.push({
          type: 'error',
          message: 'Duplicate variable declaration'
        });
      } else {
        symbolTable[varName] = { type: varType, used: false };
      }

      if (value && varType === 'int' && /^".*"$/.test(value)) {
        errors++;
        details.push({
          type: 'error',
          message: 'Type mismatch'
        });
      }
    }

    // Division by zero
    if (/\b\d+\s*\/\s*0\b/.test(line)) {
      errors++;
      details.push({
        type: 'error',
        message: 'Division by zero'
      });
    }

    // Variable usage
    const usageMatches = line.match(/\b[a-zA-Z_]\w*\b/g);
    if (usageMatches) {
      for (const match of usageMatches) {
        if (!['int', 'String', 'double', 'boolean', 'float', 'char', 'long', 'main', 'return', 'System', 'out', 'println', 'public', 'static', 'void', 'class'].includes(match)) {
          if (!symbolTable[match]) {
            errors++;
            details.push({
              type: 'error',
              message: 'Undeclared variable'
            });
          } else {
            symbolTable[match].used = true;
          }
        }
      }
    }
  }

  // Check for unused variables
  for (const varName in symbolTable) {
    if (!symbolTable[varName].used) {
      warnings++;
      details.push({
        type: 'warning',
        message: 'Unused variable'
      });
    }
  }

  return {
    status: errors === 0 ? 'passed' : 'failed',
    errors,
    warnings,
    details
  };
}

// Python Language Semantic Analysis
function semanticAnalysisPython(code) {
  const src = String(code || '');
  const lines = src.split('\n');
  let errors = 0;
  let warnings = 0;
  const details = [];
  const symbolTable = {};

  // Parse declarations and usages
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    // Variable assignments (Python)
    const declMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
    if (declMatch) {
      const varName = declMatch[1];
      const value = declMatch[2];

      if (!symbolTable[varName]) {
        symbolTable[varName] = { type: 'var', used: false };
      }
    }

    // Check for print function usage
    if (line.includes('print(')) {
      const printArgs = line.match(/print\s*\(([^)]*)\)/);
      if (printArgs) {
        const args = printArgs[1].split(',');
        for (const arg of args) {
          const varName = arg.trim().replace(/^['"]|['"]$/g, '');
          if (!/^['"]|^\d+$/.test(varName) && varName && !symbolTable[varName]) {
            errors++;
            details.push({
              type: 'error',
              message: 'Undeclared variable'
            });
          }
        }
      }
    }

    // Division by zero
    if (/\b\d+\s*\/\/?\s*0\b/.test(line)) {
      errors++;
      details.push({
        type: 'error',
        message: 'Division by zero'
      });
    }
  }

  // Check for unused variables
  for (const varName in symbolTable) {
    if (!symbolTable[varName].used && !['__name__', '__main__'].includes(varName)) {
      warnings++;
      details.push({
        type: 'warning',
        message: 'Unused variable'
      });
    }
  }

  return {
    status: errors === 0 ? 'passed' : 'failed',
    errors,
    warnings,
    details
  };
}

// JavaScript Language Semantic Analysis
function semanticAnalysisJavaScript(code) {
  const src = String(code || '');
  const lines = src.split('\n');
  let errors = 0;
  let warnings = 0;
  const details = [];
  const symbolTable = {};

  // Parse declarations and usages
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) continue;

    // Variable declarations
    const declMatch = line.match(/\b(const|let|var)\s+([a-zA-Z_]\w*)(?:\s*=\s*(.+?))?\s*[;,]?$/);
    if (declMatch) {
      const varName = declMatch[2];
      const value = declMatch[3];

      if (symbolTable[varName]) {
        errors++;
        details.push({
          type: 'error',
          message: 'Duplicate variable declaration'
        });
      } else {
        symbolTable[varName] = { type: 'var', used: false };
      }
    }

    // Division by zero
    if (/\b\d+\s*\/\s*0\b/.test(line)) {
      errors++;
      details.push({
        type: 'error',
        message: 'Division by zero'
      });
    }

    // Function calls and variable usage
    const usageMatches = line.match(/\b[a-zA-Z_]\w*\b/g);
    if (usageMatches) {
      for (const match of usageMatches) {
        if (!['const', 'let', 'var', 'function', 'return', 'console', 'log', 'module', 'exports', 'require', 'if', 'else', 'for', 'while', 'class', 'new'].includes(match)) {
          if (!symbolTable[match]) {
            // Don't flag built-in methods
            if (!['toString', 'length', 'map', 'filter', 'reduce', 'forEach', 'push', 'pop', 'shift', 'unshift'].includes(match)) {
              errors++;
              details.push({
                type: 'error',
                message: 'Undeclared variable'
              });
            }
          } else {
            symbolTable[match].used = true;
          }
        }
      }
    }
  }

  // Check for unused variables
  for (const varName in symbolTable) {
    if (!symbolTable[varName].used) {
      warnings++;
      details.push({
        type: 'warning',
        message: 'Unused variable'
      });
    }
  }

  return {
    status: errors === 0 ? 'passed' : 'failed',
    errors,
    warnings,
    details
  };
}

// Generic Semantic Analysis Dispatcher
function semanticAnalysis(code, language = 'c') {
  switch (language) {
    case 'cpp':
      return semanticAnalysisCPP(code);
    case 'java':
      return semanticAnalysisJava(code);
    case 'python':
      return semanticAnalysisPython(code);
    case 'javascript':
      return semanticAnalysisJavaScript(code);
    case 'c':
    default:
      return semanticAnalysisC(code);
  }
}

function compilationStage(syntax, semantic) {
  let status = 'failed';
  if (syntax.status === 'passed' && semantic.errors === 0) {
    status = 'success';
  }
  return { status, timestamp: new Date().toISOString() };
}

function generateIR(compilation) {
  return {
    status: compilation.status === 'success' ? 'generated' : 'skipped',
  };
}

function generateAST(code) {
  const src = String(code || '');
  const lines = src.split('\n');
  const body = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Include statements
    const includeMatch = line.match(/^#\s*include\s*<(.+)>/);
    if (includeMatch) {
      body.push({ type: 'Include', value: includeMatch[1] });
      continue;
    }

    // return statements
    const returnMatch = line.match(/^return\s+(.+);/);
    if (returnMatch) {
      const value = returnMatch[1];
      body.push({ type: 'ReturnStatement', value: isNaN(value) ? value : parseInt(value) });
      continue;
    }

    // Function declarations
    const funcMatch = line.match(/^(\w+)\s+(\w+)\s*\(/);
    if (funcMatch) {
      const funcType = funcMatch[1];
      const funcName = funcMatch[2];
      body.push({
        type: 'Function',
        name: funcName,
        returnType: funcType,
        body: [] // We'll fill this later if needed
      });
      continue;
    }

    // Variable declarations (must have datatype, name, and semicolon)
    const varMatch = line.match(/^(\w+)\s+(\w+)\s*(?:=\s*(.+?))?\s*;/);
    if (varMatch) {
      const datatype = varMatch[1];
      const name = varMatch[2];
      const value = varMatch[3];
      body.push({
        type: 'VariableDeclaration',
        name: name,
        datatype: datatype,
        value: value ? value.replace(/;$/, '') : undefined
      });
      continue;
    }

    // printf statements
    if (line.includes('printf(')) {
      body.push({ type: 'PrintfStatement', value: line });
      continue;
    }
  }

  return {
    type: 'Program',
    body: body
  };
}

function generateIR(code) {
  const src = String(code || '');
  const lines = src.split('\n');
  const instructions = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Variable declarations with assignment
    const varMatch = line.match(/^(\w+)\s+(\w+)\s*=\s*(.+?)\s*;/);
    if (varMatch) {
      const datatype = varMatch[1];
      const name = varMatch[2];
      const value = varMatch[3];
      instructions.push(`DECLARE ${name}`);
      if (value) {
        instructions.push(`LOAD ${value} INTO ${name}`);
      }
      continue;
    }

    // printf statements
    if (line.includes('printf(')) {
      instructions.push('CALL printf');
      continue;
    }

    // return statements
    const returnMatch = line.match(/^return\s+(.+);/);
    if (returnMatch) {
      const value = returnMatch[1];
      instructions.push(`RETURN ${value}`);
      continue;
    }
  }

  return {
    status: instructions.length > 0 ? 'generated' : 'skipped',
    instructions: instructions
  };
}

function qualityGateAnalysis(code, semantic) {
  const src = String(code || '');
  const lines = src.split('\n').filter(l => l.trim().length > 0);
  
  // 1. Cyclomatic Complexity: count control flow statements
  const ifCount = (src.match(/\bif\s*\(/g) || []).length;
  const whileCount = (src.match(/\bwhile\s*\(/g) || []).length;
  const forCount = (src.match(/\bfor\s*\(/g) || []).length;
  const complexity = ifCount + whileCount + forCount;
  
  // 2. Code length check (lines > 500)
  const codeLength = lines.length;
  const lengthWarning = codeLength > 500 ? 1 : 0;
  
  // 3. Variable count check (> 8 variables)
  const varDeclRegex = /\b(?:int|float|double|string|bool|var|let|const|long|short)\s+([a-zA-Z_]\w*)/g;
  const varMatches = src.match(varDeclRegex) || [];
  const variableCount = varMatches.length;
  const variableWarning = variableCount > 8 ? 1 : 0;
  
  // 4. Security check: dangerous functions
  const dangerousFunctions = ['gets(', 'strcpy(', 'gets ', 'strcpy '];
  let securityIssues = 0;
  const securityDetails = [];
  for (const func of dangerousFunctions) {
    if (src.includes(func)) {
      securityIssues++;
      securityDetails.push(`Dangerous function detected: ${func.trim()}`);
    }
  }
  
  // 5. Calculate quality score (0-100)
  let qualityScore = 100;
  
  // Deduct points for complexity (max 20 points)
  if (complexity > 10) {
    qualityScore -= Math.min(20, (complexity - 10) * 2);
  }
  
  // Deduct points for code length (max 15 points)
  if (codeLength > 500) {
    qualityScore -= Math.min(15, (codeLength - 500) / 50);
  }
  
  // Deduct points for too many variables (max 10 points)
  if (variableCount > 8) {
    qualityScore -= Math.min(10, (variableCount - 8) * 2);
  }
  
  // Deduct points for security issues (max 20 points)
  qualityScore -= Math.min(20, securityIssues * 10);
  
  // Deduct points for semantic errors (max 15 points)
  if (semantic.errors > 0) {
    qualityScore -= Math.min(15, semantic.errors * 3);
  }
  
  // Ensure score is within 0-100
  qualityScore = Math.max(0, Math.min(100, qualityScore));
  
  const warnings = lengthWarning + variableWarning + (complexity > 10 ? 1 : 0);
  
  return {
    complexity,
    codeLength,
    variableCount,
    warnings,
    securityIssues,
    securityDetails,
    qualityScore
  };
}

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
    return {
      decision: 'ALLOWED',
      reason: 'All quality gates passed',
    };
  }
  
  const reasons = [];
  if (lexical.status !== 'passed') reasons.push('Lexical analysis failed');
  if (syntax.status !== 'passed') reasons.push('Syntax analysis failed');
  if (semantic.errors > 0) reasons.push(`Semantic errors: ${semantic.errors}`);
  if (compilation.status !== 'success') reasons.push('Compilation failed');
  if (qualityGate.securityIssues > 0) reasons.push(`Security issues: ${qualityGate.securityIssues}`);
  if (qualityGate.qualityScore < 70) reasons.push(`Quality score too low: ${qualityGate.qualityScore}/100`);
  
  return {
    decision: 'BLOCKED',
    reason: reasons.join('; '),
  };
}

function analyzeCode(code, language = 'c') {
  const lexical = lexicalAnalysis(code);
  const syntax = syntaxAnalysis(code, language);
  const semantic = semanticAnalysis(code, language);
  const compilation = compilationStage(syntax, semantic);
  const ast = generateAST(code);
  const ir = generateIR(code);
  const qualityGate = qualityGateAnalysis(code, semantic);
  const deployment = deploymentDecision(lexical, syntax, semantic, compilation, qualityGate);

  return { language, compilation, lexical, syntax, semantic, ast, ir, qualityGate, deployment };
}

module.exports = {
  detectLanguage,
  lexicalAnalysis,
  syntaxAnalysis,
  semanticAnalysis,
  compilationStage,
  generateAST,
  generateIR,
  qualityGateAnalysis,
  deploymentDecision,
  analyzeCode,
};
