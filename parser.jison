/* description: Parses expressions. */

/* lexical grammar */
%lex
%%
\s+                                                     /* skip whitespace */
"AND"                                                   return 'OP';
"and"                                                   yytext = yytext.toUpperCase(); return 'OP';
"OR"                                                    return 'OP';
"or"                                                    yytext = yytext.toUpperCase(); return 'OP';
"NOT"                                                   return 'NOT';
"not"                                                   yytext = yytext.toUpperCase(); return 'NOT';
[0-9]+("."[0-9]+)?px\b                                  return 'LENGTH';
[0-9]+("."[0-9]+)?cm\b                                  return 'LENGTH';
[0-9]+("."[0-9]+)?mm\b                                  return 'LENGTH';
[0-9]+("."[0-9]+)?in\b                                  return 'LENGTH';
[0-9]+("."[0-9]+)?pt\b                                  return 'LENGTH';
[0-9]+("."[0-9]+)?pc\b                                  return 'LENGTH';
[0-9]+("."[0-9]+)?deg\b                                 return 'ANGLE';
[0-9]+("."[0-9]+)?grad\b                                return 'ANGLE';
[0-9]+("."[0-9]+)?rad\b                                 return 'ANGLE';
[0-9]+("."[0-9]+)?turn\b                                return 'ANGLE';
[0-9]+("."[0-9]+)?s\b                                   return 'TIME';
[0-9]+("."[0-9]+)?ms\b                                  return 'TIME';
[0-9]+("."[0-9]+)?Hz\b                                  return 'FREQ';
[0-9]+("."[0-9]+)?kHz\b                                 return 'FREQ';
[0-9]+("."[0-9]+)?dpi\b                                 return 'RES';
[0-9]+("."[0-9]+)?dpcm\b                                return 'RES';
[0-9]+("."[0-9]+)?dppx\b                                return 'RES';
[0-9]+("."[0-9]+)?em\b                                  return 'EMS';
[0-9]+("."[0-9]+)?ex\b                                  return 'EXS';
[0-9]+("."[0-9]+)?ch\b                                  return 'CHS';
[0-9]+("."[0-9]+)?rem\b                                 return 'REMS';
[0-9]+("."[0-9]+)?vw\b                                  return 'VHS';
[0-9]+("."[0-9]+)?vh\b                                  return 'VWS';
[0-9]+("."[0-9]+)?vmin\b                                return 'VMINS';
[0-9]+("."[0-9]+)?vmax\b                                return 'VMAXS';
[0-9]+("."[0-9]+)?\%\b                                  return 'PERCENTAGE';
[0-9]+("."[0-9]+)?\b                                    return 'NUMBER';
[a-zA-Z0-9-_]+\b                                        return 'STRING';
\'(\\\'|[^\'\\])+\'                                     yytext = yytext.slice(1,-1); return 'STRING';
\#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?\b    return 'STRING';
"("                                                     return 'LPAREN';
")"                                                     return 'RPAREN';
"=="                                                    return 'RELOP';
"!="                                                    return 'RELOP';
">="                                                    return 'RELOP';
">"                                                     return 'RELOP';
"<="                                                    return 'RELOP';
"<"                                                     return 'RELOP';
"*"                                                     return 'MUL';
"/"                                                     return 'DIV';
"+"                                                     return 'ADD';
"-"                                                     return 'SUB';
<<EOF>>                                                 return 'EOF';

/lex

%left ADD SUB
%left MUL DIV
%left OP
%left NOT
%left STRING
%left RELOP
%left UPREC

%start expression

%%

expression
	: expr EOF { return $1; }
	;

expr
	: logical_expression { $$ = $1; }
	| LPAREN logical_expression RPAREN { $$ = $2; }
	| binary_expression { $$ = $1; }
	| LPAREN binary_expression RPAREN { $$ = $2; }
	| unary_expression { $$ = $1; }
	| LPAREN unary_expression RPAREN { $$ = $2; }
	| math_expression { $$ = $1; }
	| string { $$ = $1; }
	;

binary_expression 
	: expr RELOP expr %prec UPREC { $$ = { type: 'BinaryExpression', operator: $2, left: $1, right: $3 }; }
	;

unary_expression
	: NOT css_value { $$ = { type: 'UnaryExpression', operator: $1, argument: $2 }; }
	| NOT value { $$ = { type: 'UnaryExpression', operator: $1, argument: $2 }; }
	| NOT string { $$ = { type: 'UnaryExpression', operator: $1, argument: $2 }; }
	| NOT LPAREN expr RPAREN { $$ = { type: 'UnaryExpression', operator: $1, argument: $3 }; }
	;
	
logical_expression
	: expr OP expr { $$ = { type: 'LogicalExpression', operator: $2, left: $1, right: $3 }; }
	;

math_expression
	: math_expression ADD math_expression { $$ = { type: 'MathematicalExpression', operator: $2, left: $1, right: $3 }; }
	| math_expression SUB math_expression { $$ = { type: 'MathematicalExpression', operator: $2, left: $1, right: $3 }; }
	| math_expression MUL math_expression { $$ = { type: 'MathematicalExpression', operator: $2, left: $1, right: $3 }; }
	| math_expression DIV math_expression { $$ = { type: 'MathematicalExpression', operator: $2, left: $1, right: $3 }; }
	| SUB math_expression %prec UMINUS { $$ = -$2; }
	| LPAREN math_expression RPAREN { $$ = $2; }
	| css_value { $$ = $1; }
	| value { $$ = $1; }
	;
	
value
	: NUMBER { $$ = { type: 'Value', value: $1 }; }
	;
	
css_value
	: LENGTH { $$ = { type: 'LengthValue', value: parseFloat($1), unit: /[a-z]+/.exec($1)[0] }; } 
	| ANGLE { $$ = { type: 'AngleValue', value: parseFloat($1), unit: /[a-z]+/.exec($1)[0] }; } 
	| TIME { $$ = { type: 'TimeValue', value: parseFloat($1), unit: /[a-z]+/.exec($1)[0] }; } 
	| FREQ { $$ = { type: 'FrequencyValue', value: parseFloat($1), unit: /[a-z]+/.exec($1)[0] }; }
	| RES { $$ = { type: 'ResolutionValue', value: parseFloat($1), unit: /[a-z]+/.exec($1)[0] }; }
	| EMS { $$ = { type: 'EmValue', value: parseFloat($1) }; }
	| EXS { $$ = { type: 'ExValue', value: parseFloat($1) }; }
	| CHS { $$ = { type: 'ChValue', value: parseFloat($1) }; }
	| REMS { $$ = { type: 'RemValue', value: parseFloat($1) }; }
	| VHS { $$ = { type: 'VhValue', value: parseFloat($1) }; }
	| VWS { $$ = { type: 'VwValue', value: parseFloat($1) }; }
	| VMINS { $$ = { type: 'VminValue', value: parseFloat($1) }; }
	| VMAXS { $$ = { type: 'VmaxValue', value: parseFloat($1) }; }
	| PERCENTAGE { $$ = { type: 'PercentageValue', value: parseFloat($1) }; }
	;
		
string
	: STRING { $$ = { type: 'String', value: $1 }; }
	;
