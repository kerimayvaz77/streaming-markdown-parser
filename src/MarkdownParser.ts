const blogpostMarkdown = `# control

*humans should focus on bigger problems*

## Setup

\`\`\`bash
git clone git@github.com:anysphere/control
\`\`\`

\`\`\`bash
./init.sh
\`\`\`

## Folder structure

**The most important folders are:**

1. \`vscode\`: this is our fork of vscode, as a submodule.
2. \`milvus\`: this is where our Rust server code lives.
3. \`schema\`: this is our Protobuf definitions for communication between the client and the server.

Each of the above folders should contain fairly comprehensive README files; please read them. If something is missing, or not working, please add it to the README!

Some less important folders:

1. \`release\`: this is a collection of scripts and guides for releasing various things.
2. \`infra\`: infrastructure definitions for the on-prem deployment.
3. \`third_party\`: where we keep our vendored third party dependencies.

## Miscellaneous things that may or may not be useful

##### Where to find rust-proto definitions

They are in a file called \`aiserver.v1.rs\`. It might not be clear where that file is. Run \`rg --files --no-ignore bazel-out | rg aiserver.v1.rs\` to find the file.

## Releasing

Within \`vscode/\`:

- Bump the version
- Then:

\`\`\`
git checkout build-todesktop
git merge main
git push origin build-todesktop
\`\`\`

- Wait for 14 minutes for gulp and ~30 minutes for todesktop
- Go to todesktop.com, test the build locally and hit release
`;

let currentContainer: HTMLElement | null = null; 
// Do not edit this method
function runStream() {
    currentContainer = document.getElementById('markdownContainer')!;

    // this randomly split the markdown into tokens between 2 and 20 characters long
    // simulates the behavior of an ml model thats giving you weirdly chunked tokens
    const tokens: string[] = [];
    let remainingMarkdown = blogpostMarkdown;
    while (remainingMarkdown.length > 0) {
        const tokenLength = Math.floor(Math.random() * 18) + 2;
        const token = remainingMarkdown.slice(0, tokenLength);
        tokens.push(token);
        remainingMarkdown = remainingMarkdown.slice(tokenLength);
    }

    const toCancel = setInterval(() => {
        const token = tokens.shift();
        if (token) {
            addToken(token);
        } else {
            clearInterval(toCancel);
        }
    }, 20);
}


/* 
Please edit the addToken method to support at least inline codeblocks and codeblocks. Feel free to add any other methods you need.
This starter code does token streaming with no styling right now. Your job is to write the parsing logic to make the styling work.

Note: don't be afraid of using globals for state. For this challenge, speed is preferred over cleanliness.
 */

// Tip tanımlamaları
interface SyntaxRule {
    keywords: string[];
    strings: RegExp;
    comments: RegExp;
    numbers: RegExp;
    functions: RegExp;
    commands?: RegExp;
}

interface SyntaxHighlighting {
    [key: string]: SyntaxRule;
}

interface ThemeColors {
    background: string;
    text: string;
    codeBackground: string;
    codeBorder: string;
    buttonBackground: string;
    buttonText: string;
    inlineCodeBackground: string;
}

interface Themes {
    [key: string]: ThemeColors;
}

// Tema tanımları
const themes: Themes = {
    light: {
        background: '#ffffff',
        text: '#000000',
        codeBackground: '#f5f5f5',
        codeBorder: '#e0e0e0',
        buttonBackground: '#e0e0e0',
        buttonText: '#000000',
        inlineCodeBackground: '#f0f0f0'
    },
    dark: {
        background: '#1e1e1e',
        text: '#ffffff',
        codeBackground: '#2d2d2d',
        codeBorder: '#404040',
        buttonBackground: '#404040',
        buttonText: '#ffffff',
        inlineCodeBackground: '#2d2d2d'
    }
};

// Syntax highlighting için dil tanımları
const syntaxHighlighting: SyntaxHighlighting = {
    javascript: {
        keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'export', 'import'],
        strings: /"[^"]*"|'[^']*'/g,
        comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
        numbers: /\b\d+\b/g,
        functions: /\b\w+(?=\()/g
    },
    python: {
        keywords: ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'for', 'while', 'try', 'except'],
        strings: /"[^"]*"|'[^']*'/g,
        comments: /#.*/g,
        numbers: /\b\d+\b/g,
        functions: /\b\w+(?=\()/g
    },
    bash: {
        keywords: ['if', 'then', 'else', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function'],
        strings: /"[^"]*"|'[^']*'/g,
        comments: /#.*/g,
        numbers: /\b\d+\b/g,
        functions: /\b\w+(?=\()/g,
        commands: /\b(git|cd|ls|mkdir|rm|cp|mv|echo|cat|grep|find)\b/g
    }
};

// Gelişmiş parser state
let currentState = {
    inCodeBlock: false,
    inInlineCode: false,
    buffer: '',
    codeBlockBuffer: '',
    codeBlockQuoteCount: 0,
    codeLanguage: '',
    inBold: false,
    inItalic: false,
    inTable: false,
    tableHeaders: [] as string[],
    tableRows: [] as string[][],
    inTaskList: false,
    inMath: false,
    mathBuffer: '',
    theme: 'light',
    errorMessages: [] as string[],
    lastProcessedTime: Date.now()
};

// Virtual DOM implementasyonu
class VirtualNode {
    type: string;
    props: any;
    children: (VirtualNode | string)[];

    constructor(type: string, props: any, children: (VirtualNode | string)[]) {
        this.type = type;
        this.props = props;
        this.children = children;
    }
}

let virtualDOM: VirtualNode | null = null;

function createElement(type: string, props: any, ...children: (VirtualNode | string)[]): VirtualNode {
    return new VirtualNode(type, props, children);
}

function applyStyles(element: HTMLElement, styles: any) {
    Object.assign(element.style, styles);
}

function detectLanguage(code: string): string {
    // Basit dil algılama
    if (code.includes('function') || code.includes('const') || code.includes('let')) return 'javascript';
    if (code.includes('def ') || code.includes('import ') || code.includes('class ')) return 'python';
    if (code.includes('./') || code.includes('git ') || code.includes('cd ')) return 'bash';
    return '';
}

function highlightCode(code: string, language: string): string {
    if (!syntaxHighlighting[language]) return code;

    let highlighted = code;
    const rules = syntaxHighlighting[language];

    // Yorumları işle
    highlighted = highlighted.replace(rules.comments, match => `<span style="color: #6a9955">${match}</span>`);

    // Stringleri işle
    highlighted = highlighted.replace(rules.strings, match => `<span style="color: #ce9178">${match}</span>`);

    // Anahtar kelimeleri işle
    rules.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span style="color: #569cd6">${keyword}</span>`);
    });

    // Sayıları işle
    highlighted = highlighted.replace(rules.numbers, match => `<span style="color: #b5cea8">${match}</span>`);

    // Fonksiyonları işle
    highlighted = highlighted.replace(rules.functions, match => `<span style="color: #dcdcaa">${match}</span>`);

    return highlighted;
}

function processLatex(text: string): string {
    try {
        return `<span class="math">${text}</span>`;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        currentState.errorMessages.push(`LaTeX işleme hatası: ${errorMessage}`);
        return text;
    }
}

function createStyledElement(text: string, type: string): HTMLElement {
    const container = document.createElement('div');
    const element = document.createElement('span');
    const theme = themes[currentState.theme];
    
    switch(type) {
        case 'code':
            element.className = 'inline-code';
            element.style.backgroundColor = theme.inlineCodeBackground;
            element.style.color = theme.text;
            element.textContent = text;
            return element;

        case 'codeblock':
            container.className = 'code-block';
            
            // Dil etiketi
            if (currentState.codeLanguage) {
                const langLabel = document.createElement('div');
                langLabel.className = 'lang-label';
                langLabel.textContent = currentState.codeLanguage;
                langLabel.style.position = 'absolute';
                langLabel.style.top = '0.5rem';
                langLabel.style.left = '0.5rem';
                langLabel.style.fontSize = '0.8rem';
                langLabel.style.color = theme.text;
                langLabel.style.opacity = '0.7';
                container.appendChild(langLabel);
            }
            
            // Kod içeriği
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            
            if (currentState.codeLanguage) {
                code.innerHTML = highlightCode(text, currentState.codeLanguage);
            } else {
                code.textContent = text;
            }
            
            pre.appendChild(code);
            
            // Satır numaraları
            const lines = text.split('\n');
            const lineNumbers = document.createElement('div');
            lineNumbers.className = 'line-numbers';
            lines.forEach((_, i) => {
                const lineNum = document.createElement('div');
                lineNum.textContent = (i + 1).toString();
                lineNumbers.appendChild(lineNum);
            });
            
            // Kontrol butonları
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.textContent = 'Copy';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(text).then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                    }, 2000);
                });
            };
            
            const toggleButton = document.createElement('button');
            toggleButton.className = 'toggle-button';
            toggleButton.textContent = '−';
            let isCollapsed = false;
            toggleButton.onclick = () => {
                if (isCollapsed) {
                    pre.style.display = 'block';
                    toggleButton.textContent = '−';
                } else {
                    pre.style.display = 'none';
                    toggleButton.textContent = '+';
                }
                isCollapsed = !isCollapsed;
            };
            
            container.appendChild(lineNumbers);
            container.appendChild(pre);
            container.appendChild(copyButton);
            container.appendChild(toggleButton);
            return container;

        default:
            element.textContent = text;
            container.appendChild(element);
            return container;
    }
}

// Tema değiştirme fonksiyonu
function toggleTheme(): void {
    currentState.theme = currentState.theme === 'light' ? 'dark' : 'light';
    const theme = themes[currentState.theme];
    
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
    
    document.querySelectorAll('.code-block').forEach((block) => {
        if (block instanceof HTMLElement) {
            block.style.backgroundColor = theme.codeBackground;
            block.style.color = theme.text;
        }
    });
}

// Performans optimizasyonu için throttle
function throttle(func: Function, limit: number): (...args: any[]) => void {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]): void {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Hata yönetimi
function handleError(error: unknown, context: string): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error in ${context}:`, errorMessage);
    currentState.errorMessages.push(`${context}: ${errorMessage}`);
    
    const errorContainer = document.createElement('div');
    errorContainer.style.backgroundColor = '#ff000020';
    errorContainer.style.padding = '10px';
    errorContainer.style.margin = '10px 0';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.color = '#ff0000';
    errorContainer.innerText = `Error: ${errorMessage}`;
    
    if (currentContainer) {
        currentContainer.appendChild(errorContainer);
    }
}

// Buffer yönetimi optimizasyonu
const processBufferThrottled = throttle(processBuffer, 16); // 60fps için ~16ms

function processBuffer() {
    try {
        if (!currentContainer || !currentState.buffer) return;

        const startTime = performance.now();

        if (currentState.inCodeBlock) {
            let existingCodeBlock = currentContainer.querySelector('.current-code-block');
            if (existingCodeBlock) {
                const code = existingCodeBlock.querySelector('code');
                if (code) {
                    if (!currentState.codeLanguage) {
                        currentState.codeLanguage = detectLanguage(currentState.buffer);
                    }
                    
                    if (currentState.codeLanguage) {
                        code.innerHTML = highlightCode(currentState.buffer, currentState.codeLanguage);
                    } else {
                        code.textContent = currentState.buffer;
                    }
                }
            } else {
                const codeBlockElement = createStyledElement(currentState.buffer, 'codeblock');
                codeBlockElement.className = 'code-block current-code-block';
                currentContainer.appendChild(codeBlockElement);
            }
        } else if (currentState.inInlineCode) {
            let existingInlineCode = currentContainer.querySelector('.current-inline-code');
            if (existingInlineCode) {
                existingInlineCode.textContent = currentState.buffer;
            } else {
                const codeElement = createStyledElement(currentState.buffer, 'code');
                codeElement.className = 'inline-code current-inline-code';
                currentContainer.appendChild(codeElement);
            }
        } else {
            const span = document.createElement('span');
            span.textContent = currentState.buffer;
            currentContainer.appendChild(span);
        }

        const endTime = performance.now();
        const processTime = endTime - startTime;
        if (processTime > 16) {
            console.warn(`Buffer processing took ${processTime}ms`);
        }

        currentState.buffer = '';
    } catch (error) {
        handleError(error, 'processBuffer');
    }
}

// Tema değiştirme butonu ekle
function addThemeToggle() {
    const themeButton = document.createElement('button');
    themeButton.innerText = '🌓';
    themeButton.style.position = 'fixed';
    themeButton.style.top = '20px';
    themeButton.style.right = '20px';
    themeButton.style.padding = '8px';
    themeButton.style.borderRadius = '50%';
    themeButton.style.border = 'none';
    themeButton.style.cursor = 'pointer';
    themeButton.onclick = toggleTheme;
    document.body.appendChild(themeButton);
}

// Sayfa yüklendiğinde tema toggle butonunu ekle
document.addEventListener('DOMContentLoaded', addThemeToggle);

function addToken(token: string) {
    try {
        if(!currentContainer) return;

        // Kod bloğu kontrolü
        if (token.includes('```')) {
            const matches = token.match(/```(\w*)/);
            if (matches) {
                currentState.codeLanguage = matches[1] || detectLanguage(token);
            }
            
            const backtickCount = (token.match(/```/g) || []).length;
            currentState.codeBlockQuoteCount += backtickCount;
            
            if (currentState.codeBlockQuoteCount % 2 === 1) {
                currentState.inCodeBlock = true;
                processBufferThrottled();
                token = token.replace(/```\w*/, '');
            } else if (currentState.inCodeBlock) {
                const lastContent = token.split('```')[0];
                if (lastContent) {
                    currentState.buffer = lastContent;
                    processBufferThrottled();
                }
                
                currentState.inCodeBlock = false;
                currentState.codeBlockQuoteCount = 0;
                currentState.codeLanguage = '';
                
                const currentCodeBlock = currentContainer.querySelector('.current-code-block');
                if (currentCodeBlock) {
                    currentCodeBlock.className = 'code-block';
                }
                return;
            }
        }

        // Tablo kontrolü
        if (token.includes('|') && !currentState.inCodeBlock) {
            if (!currentState.inTable) {
                currentState.inTable = true;
                currentState.tableHeaders = token.split('|').map(h => h.trim()).filter(Boolean);
            } else {
                const cells = token.split('|').map(c => c.trim()).filter(Boolean);
                if (cells.every(cell => cell.match(/^[-:]+$/))) {
                    // Alignment row, skip
                } else {
                    currentState.tableRows.push(cells);
                }
            }
            return;
        } else if (currentState.inTable) {
            processBufferThrottled();
            currentState.inTable = false;
            currentState.tableHeaders = [];
            currentState.tableRows = [];
        }

        // Görev listesi kontrolü
        if (token.match(/^\s*- \[ \]/) || token.match(/^\s*- \[x\]/)) {
            currentState.inTaskList = true;
            currentState.buffer = token.replace(/^\s*- \[(x| )\]/, '');
            processBufferThrottled();
            currentState.inTaskList = false;
            return;
        }

        // LaTeX formül kontrolü
        if (token.includes('$')) {
            if (!currentState.inMath) {
                currentState.inMath = true;
                currentState.mathBuffer = '';
            } else {
                currentState.buffer = currentState.mathBuffer;
                processBufferThrottled();
                currentState.inMath = false;
                currentState.mathBuffer = '';
            }
            return;
        }

        if (currentState.inMath) {
            currentState.mathBuffer += token;
            return;
        }

        // Inline kod kontrolü
        if (token.includes('`') && !currentState.inCodeBlock) {
            const parts = token.split('`');
            
            if (parts[0]) {
                currentState.buffer = parts[0];
                processBufferThrottled();
            }
            
            currentState.inInlineCode = !currentState.inInlineCode;
            
            if (!currentState.inInlineCode) {
                const currentInlineCode = currentContainer.querySelector('.current-inline-code');
                if (currentInlineCode) {
                    currentInlineCode.className = '';
                }
            }
            
            if (parts[1]) {
                currentState.buffer = parts[1];
                processBufferThrottled();
            }
            return;
        }

        // Yeni satır kontrolü
        if (token.includes('\n')) {
            currentState.buffer += token;
            processBufferThrottled();
            if (!currentState.inCodeBlock) {
                const lineBreak = document.createElement('br');
                currentContainer.appendChild(lineBreak);
            }
            return;
        }

        currentState.buffer += token;
        processBufferThrottled();
    } catch (error) {
        handleError(error, 'addToken');
    }
}