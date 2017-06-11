import color from 'css-color-converter';

import {parser} from './parser' // eslint-disable-line
import convert from './convert';

function evaluate(ast) {
    switch (ast.type) {
        case 'LogicalExpression':
            return evaluateLogicalExpression(ast);
        case 'BinaryExpression':
            return evaluateBinaryExpression(ast);
        case 'MathematicalExpression':
            return evaluateMathematicalExpression(ast);
        case 'UnaryExpression':
            return evaluateUnaryExpression(ast);
        default:
            return ast;
    }
}

function evaluateLogicalExpression(ast) {
    const left = evaluate(ast.left);
    const right = evaluate(ast.right);

    if (left.type !== 'BooleanValue')
        throw new Error('Unexpected node type');

    if (right.type !== 'BooleanValue')
        throw new Error('Unexpected node type');
        
    const value = ast.operator === 'AND' 
        ? left.value && right.value
        : left.value || right.value;

    return {
        type: 'BooleanValue', 
        value: value
    };
}

function compare (val1, val2) {
    return val1 === val2 ? 0 : val1 > val2 ? 1 : -1;
}

function evaluateBinaryExpression(ast) {
    const { left, right } = convert(evaluate(ast.left), evaluate(ast.right));
    const operator = ast.operator;

    const cmp = () => {
        const comparison = compare(left.value, right.value);
        switch (operator) {
            case '==':
                if (left.type !== right.type) 
                    return false;
                return comparison === 0;
            case '!=':
                if (left.type !== right.type) 
                    return true;
                return comparison !== 0;
            case '>=':
                if (left.type !== right.type) 
                    throw new Error('Node type mismatch');
                return comparison >= 0;
            case '>':
                if (left.type !== right.type) 
                    throw new Error('Node type mismatch');
                return comparison > 0;
            case '<=':
                if (left.type !== right.type) 
                    throw new Error('Node type mismatch');
                return comparison <= 0;
            case '<':
                if (left.type !== right.type) 
                    throw new Error('Node type mismatch');
                return comparison < 0;
        }
    };

    return {
        type: 'BooleanValue',
        value: cmp()
    };
}

function evaluateMathematicalExpression(ast) {
    const { left, right } = convert(evaluate(ast.left), evaluate(ast.right));
    const operator = ast.operator;

    if (left.type !== right.type) {
        throw new Error('Node type mismatch');
    }

    if (left.type === 'ColorValue') 
        return evaluateColorMath(left, right, operator);

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
}

function evaluateColorMath(left, right, op) {
    const val1 = color(left.value).toRgbaArray();
    const val2 = color(right.value).toRgbaArray();

    if (val1[3] !== val2[3]) {
        throw new Error('Alpha channels must be equal');
    }

    let [r, g, b] = val1;
    const a = val1[3];

    switch (op) {
        case '+':
            r = Math.min(r + val2[0], 255);
            g = Math.min(g + val2[1], 255);
            b = Math.min(b + val2[2], 255);
            break;
        case '-':
            r = Math.max(r - val2[0], 0);
            g = Math.max(g - val2[1], 0);
            b = Math.max(b - val2[2], 0);
            break;
        case '*':
            r = Math.min(r * val2[0], 255);
            g = Math.min(g * val2[1], 255);
            b = Math.min(b * val2[2], 255);
            break;
        case '/':
            r = Math.max(r / val2[0], 0);
            g = Math.max(g / val2[1], 0);
            b = Math.max(b / val2[2], 0);
            break;
    }
    
    return {
        type: 'ColorValue',
        value: color().fromRgba([r, g, b, a]).toHexString()
    };
}

function evaluateUnaryExpression(ast) {
    const node = evaluate(ast.argument);
    if (node.type !== 'BooleanValue') {
        throw new Error('Node type mismatch');
    }

    return {
        type: 'BooleanValue',
        value: !node.value
    };
}

export default (expr) => {
    let ast = null;
    try {
        ast = parser.parse(expr);
    } catch (e) {
        throw new Error('Failed to parse expression');
    }
    const result = evaluate(ast);
    switch (result.type) {
        case 'LogicalExpression':
        case 'BinaryExpression':
        case 'MathematicalExpression':
        case 'UnaryExpression':
            throw new Error('Could not evaluate expression');
        default: 
            return Boolean(result.value);
    }
};
