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
<<EOF>>                                                 return 'EOF';

/lex

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
	| LPAREN expr RPAREN { $$ = $2; }
	| binary_expression { $$ = $1; }
	| literal { $$ = $1; }
	| unary_expression { $$ = $1; }
	;
	
literal
	: value	{ $$ = { type: 'Literal', value: $1 };}
	;

binary_expression 
	: expr RELOP expr %prec UPREC { $$ = { type: 'BinaryExpression', operator: $2, left: $1, right: $3 }; }
	;

unary_expression
	: NOT literal { $$ = { type: 'UnaryExpression', operator: $1, argument: $2 }; }
	| NOT LPAREN expr RPAREN { $$ = { type: 'UnaryExpression', operator: $1, argument: $3 }; }
	;
	
logical_expression
	: expr OP expr	{ $$ = { type: 'LogicalExpression', operator: $2, left: $1, right: $3 }; }
	;
	
value
	: STRING { $$ = $1; }
	| NUMBER { $$ = $1; }
	;