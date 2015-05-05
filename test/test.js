var postcss = require('postcss');
var expect  = require('chai').expect;

var conditionals = require('../');

var test = function (input, output) {
    expect(postcss(conditionals()).process(input).css).to.eql(output);
};

describe('postcss-conditionals', function () {
    it('passes when both sides in an equality expression are equal', function () {
        test('@if a == a { success {} }', 'success {}');
    });
    it('fails when both sides in an equality expression are unequal', function () {
        test('@if a == b { success {} }', '');
    });
    it('passes when both sides in an inequality expression are unequal', function () {
        test('@if a != b { success {} }', 'success {}');
    });
    it('fails when both sides in an inequality expression are equal', function () {
        test('@if a != a { success {} }', '');
    });
    it('passes when the left side in a "greater than" expression is larger than the right side', function () {
        test('@if 2 > 1 { success {} }', 'success {}');
    });
    it('fails when the left side in a "greater than" expression is smaller than the right side', function () {
        test('@if 1 > 2 { success {} }', '');
    });
    it('passes when the left side in a "greater than or equal to" expression is larger than or equal to the right side', function () {
        test('@if 2 >= 2 { success {} }', 'success {}');
    });
    it('fails when the left side in a "greater than or equal to" expression is smaller than the right side', function () {
        test('@if 1 >= 2 { success {} }', '');
    });
    it('passes when the left side in a "less than" expression is smaller than the right side', function () {
        test('@if 1 < 2 { success {} }', 'success {}');
    });
    it('fails when the left side in a "less than" expression is greater than the right side', function () {
        test('@if 2 < 1 { success {} }', '');
    });
    it('passes when the left side in a "less than or equal to" expression is less than or equal to the right side', function () {
        test('@if 2 <= 2 { success {} }', 'success {}');
    });
    it('fails when the left side in a "less than or equal to" expression is greater than the right side', function () {
        test('@if 2 <= 1 { success {} }', '');
    });
    it('passes when both sides in an AND condition are true', function () {
        test('@if a == a AND b == b { success {} }', 'success {}');
    });
    it('fails when one side in an AND condition is untrue', function () {
        test('@if a == a AND a == b { success {} }', '');
    });
    it('passes when at least one side in an OR condition is true', function () {
        test('@if a == b OR b == b { success {} }', 'success {}');
    });
    it('fails when both sides in an OR condition are false', function () {
        test('@if a == b OR b == c { success {} }', '');
    });
    it('fails when both sides in an OR condition are false', function () {
        test('@if a == b OR b == c { success {} }', '');
    });
    it('understands paranthesis precedence', function () {
        test('@if a == a OR (c == b AND b == d) { success {} }', 'success {}');
    });
    it('understands negation', function () {
        test('@if NOT (a == b) { success {} }', 'success {}');
    });
});

