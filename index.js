var postcss	= require('postcss'),
    parser  = require('./parser').parser;

var evalParseTree = function (tree) {
    switch (tree.type) {
        case 'LogicalExpression':
            return tree.operator === 'AND'
                ? evalParseTree(tree.left) && evalParseTree(tree.right)
                : evalParseTree(tree.left) || evalParseTree(tree.right);
        case 'BinaryExpression':
            if (tree.operator === '==') return evalParseTree(tree.left) === evalParseTree(tree.right);
            if (tree.operator === '!=') return evalParseTree(tree.left) !== evalParseTree(tree.right);
            if (tree.operator === '>') return evalParseTree(tree.left) > evalParseTree(tree.right);
            if (tree.operator === '<') return evalParseTree(tree.left) < evalParseTree(tree.right);
            if (tree.operator === '>=') return evalParseTree(tree.left) >= evalParseTree(tree.right);
            if (tree.operator === '<=') return evalParseTree(tree.left) <= evalParseTree(tree.right);
            break;
        case 'UnaryExpression':
           return !evalParseTree(tree.argument);
        case 'Literal':
            return tree.value;
    }
};

var parseElseStatement = function (rule, prevPassed) {
    if (!prevPassed)
        rule.parent.insertBefore(rule, rule.nodes);
    rule.removeSelf();
};

var parseIfStatement = function(rule, input) {
    if (!input)
        throw rule.error('Missing condition', { plugin: 'postcss-conditionals' });
    var previousPassed = arguments[2] || false;
    var passed = false;
    try {
        passed = Boolean(evalParseTree(parser.parse(input)));
    }
    catch (err) {
        throw rule.error('Failed to parse expression', { plugin: 'postcss-conditionals' });
    }
    if (!previousPassed && passed)
        rule.parent.insertBefore(rule, rule.nodes);

    var next = rule.next();
    if (typeof next !== 'undefined' && next.type === 'atrule' && next.name === 'else') {
        if (next.params.substr(0, 2) === 'if')
            parseIfStatement(next, next.params.substr(3), passed);
        else
            parseElseStatement(next, passed);
    }
    rule.removeSelf();
};

module.exports = postcss.plugin('postcss-conditionals', function (opts) {
    opts = opts || {};

    return function (css) {
        css.eachAtRule(function (rule) {
            if ( rule.name === 'if' )
                parseIfStatement(rule, rule.params);
        });
    };
});
