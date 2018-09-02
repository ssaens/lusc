/*
IDEA: compile(file)
        preprocess(file) ->
            lex(file) -> tokens[ (INCLUDE, path), (INCLUDE, path), (JS, src) ]
            expand until all jS files
            join src
 */

const LEX_STATE = {
    INIT: 'init',
    INCLUDE: 'include',
    PATH: 'path',
    SCRIPT: 'script',
};

const TOKEN = {
    INCLUDE: 'include',
    SCRIPT: 'script',
    ERROR: 'error'
};

const Lex = {
    lex(src) {
        const lexer = Lex.create();
        while (src) {
            // console.log(`[${lexer.state}]: src is now\n${src}`);
            let bestMatch, bestAction, bestLength = 0;
            for (const [pattern, action] of LEX_RULE[lexer.state]) {
                let match = pattern.exec(src);
                // console.log(pattern, match)
                if (!match) continue;
                if (match[0].length > bestLength) {
                    bestLength = match[0].length;
                    bestMatch = match;
                    bestAction = action;
                }
            }
            if (bestLength  === 0) {
                return null;
            }

            src = src.slice(bestLength);
            bestAction(lexer, bestMatch);
        }
        return lexer.tokens;
    },

    create() {
        return {
            state: LEX_STATE.INIT,
            tokens: [],
            scratch: {
                pathBuffer: ''
            }
        }
    },

    emit(l, type, value=null) {
        l.tokens.push([type, value]);
    },

    to(state) {
        return l => l.state = state;
    },

    move(l, state) {
        l.state = state;
    },

    action: {
        pathEnd(l, match) {
            Lex.emit(l, TOKEN.INCLUDE, l.scratch.pathBuffer);
            l.scratch.pathBuffer = '';
            Lex.move(l, LEX_STATE.INIT);
        },

        pathEsc(l, match) {
            if (match === "\\n") {
                l.scratch.path += '\n';
            } else if (match === '\\t') {
                l.scratch.path += '\t';
            } else if (match === '\\b') {
                l.scratch.path += '\b';
            } else if (match === '\\f') {
                l.scratch.path += '\f';
            } else if (match === '\\\0') {
                // Handle escaped null characters
                // () => this.error("String contains null character");
            } else {
                l.scratch.path += match;
            }
        },

        pathAppend(l, match) {
            l.scratch.pathBuffer += match;
        },

        scriptConsume(l, match) {
            Lex.emit(l, TOKEN.SCRIPT, match[0]);
        }
    }
};

function noop() {}

function rule(pattern, action) {
    return [new RegExp(`^${pattern}`), action];
}

const LEX_RULE = {
    [LEX_STATE.INIT]: [
        rule('\\s+', noop),
        rule('@include[\t ]+', Lex.to(LEX_STATE.INCLUDE)),
        rule('@script\s*\n', Lex.to(LEX_STATE.SCRIPT))
    ],
    [LEX_STATE.INCLUDE]: [
        rule('\n', noop),
        rule('\'', Lex.to(LEX_STATE.PATH))
    ],
    [LEX_STATE.PATH]: [
        rule('\\n', noop),
        rule('\'', Lex.action.pathEnd),
        rule('\\\\.', Lex.action.pathEsc),
        rule('[^\\0]', Lex.action.pathAppend)
    ],
    [LEX_STATE.SCRIPT]: [
        rule('(?:.|\\n)*', Lex.action.scriptConsume)
    ]
};

function expand(fs, path, marked) {
    const file = fs.open(path);
    if (!file) {
        return false;
    }
    const id = file.getId();
    if (marked.has(id)) {
        file.close();
        return;
    }
    marked.add(id);
    const src = build(fs, file, marked);
    file.close();
    return src;
}

function link(fs, tokens, marked) {
    const out = [];
    for (const token of tokens) {
        let script;
        if (token[0] === TOKEN.INCLUDE) {
            script = expand(fs, token[1], marked);
        } else {
            script = token[1];
        }
        out.push(script);
    }
    return out.join('\n');
}

function build(fs, file, marked=new Set()) {
    const src = file.read();
    if (src === null) {
        return null;
    }
    const tokens = Lex.lex(src);
    marked.add(file.getId());
    return link(fs, tokens, marked);
}

export default build;