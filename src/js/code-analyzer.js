/* eslint-disable no-console */
//import * as esprima from 'esprima';
const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');


let curr_env = 0;
let nodes = '';
let edges = '';
let inPath;

const parseCode = (codeToParse) => {
    return esprima.parse(codeToParse, { range: true });
};

function program(prog, dict){
    prog.body.map((exp) => generate_graph(exp, dict));
}

function functionDeclaration(func, dict){
    generate_graph(func.body, dict);
}

function blockStatement(block, dict){
    let assignments = block.body.filter((exp) => exp.type != 'IfStatement' && exp.type != 'WhileStatement' && exp.type != 'ReturnStatement');
    createNode(assignments, dict);
    let rest = block.body.filter((exp) => exp.type == 'IfStatement' || exp.type == 'WhileStatement' || exp.type == 'ReturnStatement');
    rest.map((exp) => generate_graph(exp, dict));
}

function createNode(assignments, dict){
    if(assignments.length > 0){
        nodes += 'op' + curr_env + '=>operation: ';
        assignments.map((ass) => fillNode(ass, dict));
        edges += 'op' + curr_env + '->';
        if(curr_env === 0){
            nodes = nodes.substring(0, nodes.length - 1) + '|approved\n';
        }
    }
}

function fillNode(assignment, dict){
    let names = ['VariableDeclaration', 'VariableDeclarator', 'ExpressionStatement', 'AssignmentExpression',
        'UpdateExpression'];
    let funcs = [variableDeclarations, variableDeclarator, expressionStatement, assignmentExpression,
        updateExpression];
    let index = names.indexOf(assignment.type);
    funcs[index](assignment, dict);
}

function variableDeclarations(decls, dict){
    decls.declarations.map((decl) => fillNode(decl, dict));
}

function variableDeclarator(decl, dict){
    dict[decl.id.name] = escodegen.generate(decl.init);
    nodes += decl.id.name + ' = ' + escodegen.generate(decl.init) + '\n';
}

function expressionStatement(exp, dict){
    fillNode(exp.expression, dict);
}

function assignmentExpression(exp, dict){
    if(inPath)
        dict[exp.left.name] = escodegen.generate(exp.right);
    nodes += escodegen.generate(exp) + '\n';
}

function updateExpression(exp){
    nodes += escodegen.generate(exp) + '\n';
}

function eval_cond(node, dict){
    let eval_string, vars_string = '';
    let isGreen;
    for(var name in dict){
        vars_string += 'let ' + name + ' = ' + dict[name] + '\n';
    }
    eval_string = vars_string + escodegen.generate(node);
    try{
        isGreen = eval(eval_string);
    } catch (e) {
        isGreen = false;
    }
    return isGreen;
}

function add_color(isTrue, dict, dit, dif){
    let last_node = nodes.substring(nodes.length - 10, nodes.length-1);
    if(last_node !== '|approved' && last_node !== '|rejected'){
        if(isTrue)
            nodes += dit;
        else nodes += dif;
    }
}

function ifStatement(if_stat, dict){
    curr_env++;
    let cond = 'cond' + curr_env;
    if(inPath)
        nodes += cond + '=>condition: ' + escodegen.generate(if_stat.test) + '|approved\n';
    else nodes += cond + '=>condition: ' + escodegen.generate(if_stat.test) + '|rejected\n';
    edges += cond + '\n';
    edges += cond + '(yes)->';
    let isTrue = eval_cond(if_stat.test, dict);
    inPath = isTrue;
    generate_graph(if_stat.consequent, dict);
    add_color(isTrue, dict, '|approved\n', '|rejected\n');
    edges += 'ret';
    curr_env++;
    edges += '\n' + cond + '(no)->';
    inPath = !isTrue;
    generate_graph(if_stat.alternate, dict);
    add_color(isTrue, dict, '|rejected\n', '|approved\n');
}

function whileStatement(while_stat, dict){
    curr_env++;
    let null_node = 'null' + curr_env;
    let while_node = 'while' + curr_env;
    if(inPath){
        nodes += null_node + '=>operation: NULL|approved\n';
        nodes += while_node + '=>condition: ' + escodegen.generate(while_stat.test) + '|approved\n';
    }else{
        nodes += null_node + '=>operation: NULL|rejected\n';
        nodes += while_node + '=>condition: ' + escodegen.generate(while_stat.test) + '|rejected\n';
    }
    edges += null_node + '->' + while_node + '\n' + while_node + '(yes)->';
    let isTrue = eval_cond(while_stat.test, dict);
    inPath = isTrue;
    generate_graph(while_stat.body, dict);
    add_color(isTrue, dict, '|approved\n', '|rejected\n');
    edges += null_node + '\n' + while_node + '(no)->';
}

function returnStatement(ret){
    nodes += 'ret=>operation: return ' + escodegen.generate(ret.argument) + '|approved\n';
    edges += 'ret\n';
}

function get_args(func, args){
    let args_dict = {};
    let arr = [], params = [];
    estraverse.traverse(func, {
        enter: function(node) {
            if(node.type === 'FunctionDeclaration'){params = node.params;}
        }});
    estraverse.traverse(args, {
        enter: function(node) {
            if(node.type === 'SequenceExpression'){arr = node.expressions;}
        }});
    if(arr.length === params.length){
        for(let i = 0; i < params.length; i++){
            args_dict[params[i].name] = eval(escodegen.generate(arr[i]));
        }
    }
    return args_dict;
}

function generate_graph(func, dict){
    let names = ['Program', 'FunctionDeclaration', 'BlockStatement', 'IfStatement', 'WhileStatement',
        'ReturnStatement'];
    let funcs = [program, functionDeclaration, blockStatement, ifStatement, whileStatement, returnStatement];
    let index = names.indexOf(func.type);
    funcs[index](func, dict);
    let graph_code = nodes + '\n' + edges;
    //console.log('graph code: ' + graph_code);
    return graph_code;
}

function parse(func, args_code){
    nodes = '';
    edges = '';
    curr_env = 0;
    inPath = true;
    let ast = parseCode(func);
    let args = parseCode(args_code);
    let args_dict = get_args(ast, args);
    return generate_graph(ast, args_dict);
}

let code = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        while (c < z) {\n' +
    '            c = c + 5;\n' +
    '        }\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}';
let args = '1,2,1';
console.log(parse(code, args));


export {parseCode, parse};
