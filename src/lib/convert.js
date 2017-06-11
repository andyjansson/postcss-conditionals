import color from 'css-color-converter';
import convertUnits from 'css-unit-converter';

function convertNodes(left, right) {
    switch (left.type) {
        case 'Value':
            return convertValue(left, right);
        case 'ColorValue':
            return convertColorValue(left, right);
        case 'LengthValue':
        case 'AngleValue':
        case 'TimeValue':
        case 'FrequencyValue':
        case 'ResolutionValue':
            return convertAbsoluteLengthValue(left, right);
        case 'EmValue':
        case 'ExValue':
        case 'ChValue':
        case 'RemValue':
        case 'VhValue':
        case 'VwValue':
        case 'VminValue':
        case 'VmaxValue':
        case 'PercentageValue':
            return convertRelativeLengthValue(left, right);
        default:
            return { left, right };
    }
}

function convertValue(left, right) {
    if (right.type === 'Value') 
        return { left, right };

    const nodes = convertNodes(right, left);
    return { 
        left: nodes.right, 
        right: nodes.left
    };
}

function convertColorValue(left, right) {
    left.value = color(left.value).toHexString();
    if (right.type === 'Value') {
        right = { 
            type: 'ColorValue', 
            value: color().fromRgb([
                right.value, 
                right.value, 
                right.value
            ]).toHexString()
        };
    }
    else if (right.type === 'ColorValue') {
        right.value = color(right.value).toHexString();
    }
    
    return { left, right };
}

function convertAbsoluteLengthValue(left, right) {
    switch (right.type) {
        case left.type: {
            right = {
                type: left.type,
                value: convertUnits(right.value, right.unit, left.unit),
                unit: left.unit
            };
            break;
        }
        case 'Value': {
            right = {
                type: left.type,
                value: right.value,
                unit: left.unit
            };
            break;
        }
    }
    return { left, right };
}

function convertRelativeLengthValue(left, right) {
    if (right.type === 'Value') {
        right = {
            type: left.type,
            value: right.value,
            unit: left.unit
        };
    }
    return { left, right };
}

export default convertNodes;
