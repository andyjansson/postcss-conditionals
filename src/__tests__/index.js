import test from 'ava';
import postcss from 'postcss';

import conditionals from '..';

function testFixture(t, fixture, expected = null) {
  if (expected === null)
    expected = fixture

  const out = postcss(conditionals).process(fixture);
  t.deepEqual(out.css, expected)
}

test(
    'equality (1)',
    testFixture,
    '@if a == a { success {} }', 
    ' success {}');

test(
    'equality (2)',
    testFixture,
    '@if a == b { success {} }', 
    '');

test(
    'equality (3)',
    testFixture,
    '@if a != b { success {} }', 
    ' success {}');

test(
    'equality (4)',
    testFixture,
    '@if a == b { success {} } @else { branch {} }', 
    'branch {}');

test(
    'equality (5)',
    testFixture,
    '@if a != a { success {} }',
    '');

test(
    'equality (6)',
    testFixture,
    '@if a != 0 { success {} }', 
    ' success {}');

test(
    'equality (7)',
    testFixture,
    '@if a == 0 { success {} }',
    '');

test(
    'comparisons (1)',
    testFixture,
    '@if 2 > 1 { success {} }', 
    ' success {}');

test(
    'comparisons (2)',
    testFixture,
    '@if 1 > 2 { success {} }', 
    '');

test(
    'comparisons (3)',
    testFixture,
    '@if 2 >= 2 { success {} }', 
    ' success {}');

test(
    'comparisons (4)',
    testFixture,
    '@if 1 >= 2 { success {} }', 
    '');

test(
    'comparisons (5)',
    testFixture,
    '@if 1 < 2 { success {} }', 
    ' success {}');

test(
    'comparisons (6)',
    testFixture,
    '@if 2 < 1 { success {} }', 
    '');

test(
    'comparisons (7)',
    testFixture,
    '@if 2 <= 2 { success {} }', 
    ' success {}');

test(
    'comparisons (8)',
    testFixture,
    '@if 2 <= 1 { success {} }', 
    '');

test(
    'complex expressions (1)',
    testFixture,
    '@if a == a AND b == b { success {} }', 
    ' success {}');

test(
    'complex expressions (2)',
    testFixture,
    '@if a == a AND a == b { success {} }', 
    '');

test(
    'complex expressions (3)',
    testFixture,
    '@if a == b OR b == b { success {} }', 
    ' success {}');

test(
    'complex expressions (4)',
    testFixture,
    '@if a == b OR b == c { success {} }',
    '');

test(
    'complex expressions (5)',
    testFixture,
    '@if a == b OR b == c { success {} }', 
    '');

test(
    'complex expressions (6)',
    testFixture,
    '@if a == a OR (c == b AND b == d) { success {} }', 
    ' success {}');

test(
    'unaries',
    testFixture,
    '@if NOT (a == b) { success {} }', 
    ' success {}');

test(
    'addition (1)',
    testFixture,
    '@if 1 + 1 == 2 { success {} }', 
    ' success {}');

test(
    'addition (2)',
    testFixture,
    '@if (1 + 2) + 3 == 6 { success {} }', 
    ' success {}');

test(
    'addition (3)',
    testFixture,
    '@if (1 + 2) + 3 == 7 { success {} }',
    '');

test(
    'addition (4)',
    testFixture,
    '@if 1px + 2 == 3px { success {} }', 
    ' success {}');

test(
    'addition (5)',
    testFixture,
    '@if 1 + 1px == 2px { success {} }', 
    ' success {}');

test(
    'addition (6)',
    testFixture,
    '@if (3 + 2) + 1 == 3 { success {} }', 
    '');

test(
    'substraction (1)',
    testFixture,
    '@if 3 - 2 == 1 { success {} }', 
    ' success {}');

test(
    'substraction (2)',
    testFixture,
    '@if 3px - 2px == 1px { success {} }', 
    ' success {}');

test(
    'substraction (3)',
    testFixture,
    '@if 2 - 1px == 1px { success {} }', 
    ' success {}');

test(
    'addition and substraction',
    testFixture,
    '@if (3 - 2) + 1 == 2 { success {} }', 
    ' success {}');

test(
    'multiplication (1)',
    testFixture,
    '@if 1 * 2 == 2 { success {} }', 
    ' success {}');

test(
    'multiplication (2)',
    testFixture,
    '@if (1 * 2) * 3 == 6 { success {} }', 
    ' success {}');

test(
    'multiplication (3)',
    testFixture,
    '@if (1 * 2) * 3 == 7 { success {} }', 
    '');

test(
    'multiplication (4)',
    testFixture,
    '@if 3px * 2px == 6px { success {} }', 
    ' success {}');

test(
    'multiplication (5)',
    testFixture,
    '@if 2 * 2px == 4px { success {} }', 
    ' success {}');

test(
    'division (1)',
    testFixture,
    '@if 2 / 2 == 1 { success {} }', 
    ' success {}');

test(
    'division (2)',
    testFixture,
    '@if (4 / 2) / 2 == 1 { success {} }', 
    ' success {}');

test(
    'division (3)',
    testFixture,
    '@if 4 / (2 / 2) == 1 { success {} }', 
    '');

test(
    'division (4)',
    testFixture,
    '@if (4 / 2) * 2 == 2 { success {} }',
    '');

test(
    'division (5)',
    testFixture,
    '@if 4px / 2px == 2px { success {} }', 
    ' success {}');

test(
    'division (6)',
    testFixture,
    '@if 4 / 2px == 2px { success {} }', 
    ' success {}');

test(
    'colors (1)',
    testFixture,
    '@if aqua - blue == lime { success {} }', 
    ' success {}');

test(
    'colors (2)',
    testFixture,
    '@if lime + rgb(0, 0, 255) == #00ffff { success {} }', 
    ' success {}');

test(
    'colors (3)',
    testFixture,
    '@if #0ff == #00ffff { success {} }', 
    ' success {}');

test(
    'colors (4)',
    testFixture,
    '@if #0ff == #00ffffff { success {} }', 
    ' success {}');

test(
    'colors (5)',
    testFixture,
    '@if #0fff == #00ffff { success {} }', 
    ' success {}');

test(
    'colors (6)',
    testFixture,
    '@if #0fff == #00ffffff { success {} }', 
    ' success {}');

test(
    'colors (7)',
    testFixture,
    '@if hsl(0, 0%, 100%) == white { success {} }', 
    ' success {}');

test(
    'colors (8)',
    testFixture,
    '@if hsla(0, 0%, 100%, .5) == white { success {} }', 
    '');

test(
    'colors (9)',
    testFixture,
    '@if rgb(0, 255, 255) == aqua { success {} }', 
    ' success {}');

test(
    'colors (10)',
    testFixture,
    '@if rgba(0, 255, 255, .5) == aqua { success {} }', 
    '');

test(
    'colors (11)',
    testFixture,
    '@if rgb(0, 255, 255) == rgb(0, 100%, 100%) { success {} }', 
    ' success {}');

test(
    'colors (12)',
    testFixture,
    '@if rgba(0, 100%, 100%, 1) == rgb(0, 100%, 100%) { success {} }', 
    ' success {}');

test(
    'nesting (1)',
    testFixture,    
    '@if a == a { @if b == b { success {} } }', 
    ' success {}');

test(
    'nesting (2)',
    testFixture,
    '@if a == a { @if b != b { success {} } @else { branch {} } }', 
    ' branch {}');

test(
    'nesting (3)',
    testFixture,
    '@if a != a { @if b == b { success {} } }', 
    '');

test(
    'nesting (4)',
    testFixture,
    '@if a == a { @if b != b { success {} } }', 
    '');

test(
    'nesting (5)',
    testFixture,
    '@if a == a { @if b == b { @if c==c { success {} } } }', 
    ' success {}');

test(
    'booleans (1)',
    testFixture,
    '@if true { success {} }', 
    ' success {}');

test(
    'booleans (2)',
    testFixture,
    '@if false { success {} }', 
    '');

test(
    'booleans (3)',
    testFixture,
    '@if true AND true { success {} }', 
    ' success {}');

test(
    'booleans (4)',
    testFixture,
    '@if true OR true { success {} }',
    ' success {}'
);

test(
    'booleans (5)',
    testFixture,
    '@if true OR false { success {} }', 
    ' success {}');

test(
    'booleans (6)',
    testFixture,
    '@if false OR true { success {} }', 
    ' success {}');

test(
    'booleans (7)',
    testFixture,
    '@if false AND false { success {} }', 
    '');

test(
    'booleans (8)',
    testFixture,
    '@if false OR false { success {} }', 
    '');

test(
    'booleans (9)',
    testFixture,
    '@if true == true { success {} }', 
    ' success {}');

test(
    'booleans (10)',
    testFixture,
    '@if true == false { success {} }', 
    '');

test(
    'booleans (11)',
    testFixture,
    '@if true != false { success {} }', 
    ' success {}');

test(
    'booleans (12)',
    testFixture,
    '@if true { foo: bar } @else if false { bar: baz } @else { bat: quux }', 
    ' foo: bar');

test(
    'booleans (13)',
    testFixture,
    '@if false { foo: bar } @else if true { bar: baz } @else { bat: quux }', 
    'bar: baz');

test(
    'booleans (14)',
    testFixture,
    '@if false { foo: bar } @else if false { bar: baz } @else { bat: quux }', 
    'bat: quux');

test(
    'booleans (15)',
    testFixture,
    '@if 1 { success {} }', 
    ' success {}');

test(
    'booleans (16)',
    testFixture,
    '@if 0 { success {} }', 
    '');

test(
    'strings (1)',
    testFixture,    
    '@if \'\' == \'\' { foo: bar }', 
    ' foo: bar');

test(
    'strings (2)',
    testFixture,
    '@if "" == "" { foo: bar }', 
    ' foo: bar');

test(
    'strings (3)',
    testFixture,
    '@if \'\' == "" { foo: bar }', 
    ' foo: bar');

test(
    'strings (4)',
    testFixture,
    '@if "" == \'\' { foo: bar }', 
    ' foo: bar');

test(
    'strings (5)',
    testFixture,
    '@if \'foo\\bar\' == \'foo\\bar\' { foo: bar }', 
    ' foo: bar');

test(
    'strings (6)',
    testFixture,
    '@if .foo == .foo { foo: bar }', ' foo: bar');

test(
    'strings (7)',
    testFixture,
    '@if .foo == .bar { foo: bar }', '');
