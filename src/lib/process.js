import evaluate from './evaluate';

function processIfRule(rule) {
    processExpression(rule, rule.params);
}

function processExpression(node, expr) {
    process(node);
    if (!expr)
        throw node.error('Missing condition', { plugin: 'postcss-conditionals' });
    
    const passed = evaluate(expr);
    if (passed)
        node.before(node.nodes);
    
    processNextNode(node, !passed);
    node.remove();
}

function processNextNode(rule, evaluateNext) {
    const node = rule.next();

    if (typeof node === 'undefined') 
        return;

    if (node.type !== 'atrule')
        return;

    if (node.name !== 'else')
        return;

    if (evaluateNext) {
        if (node.params.substr(0, 2) === 'if')
            processElseIfRule(node);
        else 
            processElseRule(node);
    }
    else
        processNextNode(node, false);

    node.remove();
}

function processElseIfRule(rule) {
    processExpression(rule, rule.params.substr(3));
}

function processElseRule(rule) {
    process(rule);
    rule.before(rule.nodes);
}

export default function process(node) {
    node.walkAtRules('if', processIfRule);
}