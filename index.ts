import * as ts from 'typescript'

let fileNames = process.argv.slice(2)
let program = ts.createProgram(fileNames, {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
});
let checker = program.getTypeChecker();
checker.

var tKernelImported = false
let isImportTKernel = (i: ts.ImportDeclaration) => {
    let namedImport = i.importClause.namedBindings as ts.NamespaceImport
    if (namedImport.name.text != "tkernel") {
        return false
    }
    tKernelImported = true
    return true
}
let handleImport = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
        if (!isImportTKernel(node)) {
            console.log('please import only tkernel by `import * as tkernel from "./tkernel"`')
            process.exit(1)
        }
        return true
    }
    if (!tKernelImported) {
        console.log('please import tkernel by `import * as tkernel from "./tkernel"`')
        process.exit(1)
    }
}

let visitExpressionStatement = (expressionStatement: ts.ExpressionStatement) => {
    visitExpression(expressionStatement.expression)
}

let visitExpression = (expression: ts.Expression) => {
    console.log(expression)
}

let visit = (node: ts.Node) => {
    if (handleImport(node)) return
    if (ts.isExpressionStatement(node)) {
        visitExpressionStatement(node as ts.ExpressionStatement)
        return
    }
    if (ts.isVariableStatement(node)) {
        console.log("VariableStatement: " + node.declarationList)
        return
    }
    if (ts.isIfStatement(node)) {
        console.log("IfStatement: " + node.expression)
        return
    }
    if (ts.isFunctionDeclaration(node)) {
        console.log("FunctionDeclaration: " + node.body)
        return
    }
    if (ts.isClassDeclaration(node)) {
        console.log("ClassDeclaration: " + node.name)
        return
    }
    if (ts.isWhileStatement(node)) {
        console.log("WhileStatement: " + node.expression)
        return
    }
    if (node.kind == ts.SyntaxKind.EndOfFileToken) {
        process.exit(0)
    }
    console.log("don't know how to handle", ts.SyntaxKind[node.kind])
    process.exit(1)
}

// Visit every sourceFile in the program
for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile && !sourceFile.fileName.endsWith("tkernel.ts")) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, visit);
    }
}
