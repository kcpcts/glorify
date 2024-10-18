"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// extension.ts
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
let glowLineDecoration;
let animatedCharDecoration;
let lastTypingTime = 0;
let isTyping = false;
let headPosition = 0;
let tailPosition = 0;
let currentHeadPosition = 0;
let previousText = '';
function activate(context) {
    const cssPath = vscode.Uri.file(path.join(context.extensionPath, 'styles', 'styles.css'));
    const cssUri = cssPath.with({ scheme: 'vscode-resource' });
    vscode.workspace.fs.readFile(cssPath).then((buffer) => {
        const cssContent = buffer.toString();
        vscode.workspace.getConfiguration().update('html.styles', [cssUri.toString()], vscode.ConfigurationTarget.Global);
    });
    let disposable = vscode.commands.registerCommand('extension.enableGlowType', () => {
        vscode.window.showInformationMessage('Glow Type enabled!');
        enableGlowType();
    });
    context.subscriptions.push(disposable);
}
function enableGlowType() {
    glowLineDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#00ff0033',
        border: '1px solid #00ff00',
        borderRadius: '2px',
    });
    animatedCharDecoration = vscode.window.createTextEditorDecorationType({
        textDecoration: 'none;',
        after: {
            contentText: ' ',
            margin: '0 0 0 -1ch',
            width: '1ch',
            height: '1em',
            backgroundColor: 'transparent',
        },
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });
    vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument);
    vscode.window.onDidChangeTextEditorSelection(onDidChangeTextEditorSelection);
}
function onDidChangeTextDocument(event) {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.document !== editor.document)
        return;
    updateGlowLine(editor);
    updateAnimatedChars(editor, event);
}
function onDidChangeTextEditorSelection(event) {
    updateGlowLine(event.textEditor);
}
function updateGlowLine(editor) {
    const cursorPosition = editor.selection.active;
    const line = editor.document.lineAt(cursorPosition.line);
    const charIndex = cursorPosition.character;
    headPosition = charIndex;
    isTyping = true;
    lastTypingTime = Date.now();
    animateGlowLine(editor, line);
}
function animateGlowLine(editor, line) {
    const currentTime = Date.now();
    const timeSinceLastType = currentTime - lastTypingTime;
    if (timeSinceLastType > 500) {
        isTyping = false;
    }
    currentHeadPosition += (headPosition - currentHeadPosition) * 0.2;
    tailPosition = Math.min(tailPosition + Math.max(0.5, (currentHeadPosition - tailPosition) / 50), currentHeadPosition);
    const typingSpeed = Math.max(0, 500 - timeSinceLastType);
    const speedFactor = typingSpeed / 500;
    const spreadValue = 0 + Math.floor((1.2 * speedFactor));
    const startPos = new vscode.Position(line.lineNumber, tailPosition);
    const endPos = new vscode.Position(line.lineNumber, currentHeadPosition);
    const range = new vscode.Range(startPos, endPos);
    editor.setDecorations(glowLineDecoration, [range]);
    if (tailPosition < currentHeadPosition || Math.abs(currentHeadPosition - headPosition) > 0.1) {
        setTimeout(() => animateGlowLine(editor, line), 16);
    }
    else {
        editor.setDecorations(glowLineDecoration, []);
    }
}
function updateAnimatedChars(editor, event) {
    const newText = editor.document.getText();
    const decorations = [];
    for (let i = 0; i < newText.length; i++) {
        if (i >= previousText.length || newText[i] !== previousText[i]) {
            const startPos = editor.document.positionAt(i);
            const endPos = editor.document.positionAt(i + 1);
            const range = new vscode.Range(startPos, endPos);
            decorations.push({
                range,
                renderOptions: {
                    after: {
                        contentText: newText[i],
                        backgroundColor: 'transparent',
                        // Apply styles inline here
                        color: '#ff00ff', // Example style that might be in your CSS class
                        textDecoration: 'blink', // Example: mimic an animation
                    }
                }
            });
        }
    }
    editor.setDecorations(animatedCharDecoration, decorations);
    previousText = newText;
}
function deactivate() {
    if (glowLineDecoration) {
        glowLineDecoration.dispose();
    }
    if (animatedCharDecoration) {
        animatedCharDecoration.dispose();
    }
}
//# sourceMappingURL=extension.js.map