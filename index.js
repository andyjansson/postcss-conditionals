var postcss     = require('postcss'),
    parser      = require('./parser').parser,
    unitconvert = require('css-unit-converter');

var convertNodes = function (left, right) {
    var converted = {
        left: left,
        right: right
    };
    if (typeof left === 'boolean') {
        if (typeof right !== 'boolean')
            converted.right = Boolean(converted.right.value);
        return converted;
    }
    switch (left.type) {
        case 'LengthValue':
        case 'AngleValue':
        case 'TimeValue':
        case 'FrequencyValue':
        case 'ResolutionValue':
            switch (right.type) {
                case left.type:
                    converted.right = { type: left.type, value: unitconvert(right.value, right.unit, left.unit), unit: left.unit };
                    break;
                case 'Value':
                    converted.right = { type: left.type, value: right.value, unit: left.unit };
                    break;
                default:
                    throw new Error('Cannot convert ' + (typeof right !== 'boolean' ? right.type : 'Boolean') + ' to ' + left.type);
            }
            break;
        case 'EmValue':
        case 'ExValue':
        case 'ChValue':
        case 'RemValue':
        case 'VhValue':
        case 'VwValue':
        case 'VminValue':
        case 'VmaxValue':
        case 'PercentageValue':
            switch (right.type) {
                case left.type:
                case 'Value':
                    converted.right = { type: left.type, value: right.value, unit: left.unit };
                    break;
                default:
                    throw new Error('Cannot convert ' + (typeof right !== 'boolean' ? right.type : 'Boolean') + ' to ' + left.type);
            }
            break;
        case 'String':
            if (right.type !== 'String')
                throw new Error('Cannot convert ' + (typeof right !== 'boolean' ? right.type : 'Boolean') + ' to ' + left.type);
            break;
        case 'Value':
            switch (right.type) {
                case 'LengthValue':
                case 'AngleValue':
                case 'TimeValue':
                case 'FrequencyValue':
                case 'ResolutionValue':
                    converted.left = { type: right.type, value: left.value, unit: right.unit };
                    break;
                case 'EmValue':
                case 'ExValue':
                case 'ChValue':
                case 'RemValue':
                case 'VhValue':
                case 'VwValue':
                case 'VminValue':
                case 'VmaxValue':
                case 'PercentageValue':
                    return { type: right.type, value: left.value };
                case 'Value':
                    break;
                default:
                    throw new Error('Cannot convert ' + (typeof right !== 'boolean' ? right.type : 'Boolean') + ' to ' + left.type);
            }
    }
    return converted;
};

var cmp = function (val1, val2) {
    return val1 === val2 ? 0 : val1 > val2 ? 1 : -1;
};

var evalParseTree = function (tree) {
    var parseBinaryExpression = function (left, right, operator) {
        var converted = convertNodes(left, right);
        left = converted.left;
        right = converted.right;
        var comparison;
        if (typeof left === 'boolean') comparison = cmp(left, right);
        else comparison = cmp(left.value, right.value);

        switch (operator) {
            case '==':
                return comparison === 0;
            case '!=':
                return comparison !== 0;
            case '>=':
                return comparison >= 0;
            case '>':
                return comparison > 0;
            case '<=':
                return comparison <= 0;
            case '<':
                return comparison < 0;
        }
    };

    var parseMathExpression = function (left, right, operator) {
        var converted = convertNodes(left, right);
        left = converted.left;
        right = converted.right;

        switch (operator) {
            case '+':
                left.value = left.value + right.value;
                break;
            case '-':
                left.value = left.value - right.value;
                break;
            case '*':
                left.value = left.value * right.value;
                break;
            case '/':
                left.value = left.value / right.value;
                break;
        }
        return left;
    };
    var parseTree = function (subtree) {
        switch (subtree.type) {
            case 'LogicalExpression':
                return subtree.operator === 'AND'
                    ? evalParseTree(subtree.left) && evalParseTree(subtree.right)
                    : evalParseTree(subtree.left) || evalParseTree(subtree.right);
            case 'BinaryExpression':
                return parseBinaryExpression(parseTree(subtree.left), parseTree(subtree.right), subtree.operator);
            case 'MathematicalExpression':
                return parseMathExpression(parseTree(subtree.left), parseTree(subtree.right), subtree.operator);
            case 'UnaryExpression':
                return !parseTree(subtree.argument);
            case 'String':
                return subtree;
            default:
                subtree.value = parseFloat(subtree.value);
                return subtree;
        }
    };
    var result = parseTree(tree);
    if (typeof result !== 'boolean') result = Boolean(result.value);
    return result;
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
        passed = evalParseTree(parser.parse(input));
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
